import express from 'express';
// FIX: removed unused `{ argon2id }` named import — we use argon2.argon2id below.
import argon2 from 'argon2';
// FIX: `User` was never defined (User.create / User.find are Mongoose APIs).
// WHY: this project uses Prisma 8, whose client lives in prisma/db.ts.
import { db } from '../prisma/db';
// FIX: `jwt.sign` was used but jwt was never imported.
import jwt from 'jsonwebtoken';
// ADDED: zod (already installed) to validate request bodies.
import { z } from 'zod';


const app = express()
app.use(express.json());
const JWT_SECRET = process.env.JWT_SECRET
// ADDED: stop at startup if the secret is missing.
// WHY: jwt.sign would otherwise throw on every signin with a vague error.
if (!JWT_SECRET) {
  throw new Error('JWT_SECRET is not set — add it to server/.env');
}

// ADDED: request body schemas.
// WHY: without validation, a missing/non-string password makes argon2.hash
// throw (500), and junk emails get stored in the database.
const signupSchema = z.object({
  name: z.string().trim().min(1).max(50).optional(),
  email: z.email().toLowerCase(),
  password: z.string().min(8).max(128),
});

const signinSchema = z.object({
  email: z.email().toLowerCase(),
  password: z.string().min(1),
});

app.post('/signup', async (req, res) => {
  // FIX: validate instead of trusting req.body directly.
  const parsed = signupSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: "Invalid input", errors: z.flattenError(parsed.error).fieldErrors });
  }
  const { name, email, password } = parsed.data;

  try {
    const hashedPassword = await argon2.hash(password, {
      type: argon2.argon2id,
      memoryCost: 65536,  //64 MiB
      timeCost: 1,
      hashLength: 32,
      saltLength: 16,
      parallelism: 2
    });

    // FIX: check for an existing account first.
    // WHY: gives a clear 409 instead of relying only on the DB's error code.
    const existing = await db.orm.users.where({ email }).first();
    if (existing) {
      return res.status(409).json({ message: "Email already exists" });
    }

    // FIX: was `User.create({ email, hashedPassword, ... })`.
    // WHY: Prisma collections are `db.orm.<plural>`, and the hash must go in the
    // `password` field declared in the schema (unknown fields are rejected).
    await db.orm.users.create({
      email,
      password: hashedPassword,
      username: name ?? null,
      name: name ?? null,
    });

    res.status(201).json({
      message: "Signup successful"
    });

  } catch(error) {
    if (error.code === 11000) {
      return res.status(409).json({
        message: "Email already exists"
      });
    }

    return res.status(500).json({
      message: "Unable to signup, something went wrong"
    });
  }
// FIX: was `}` — it must be `});` to close the app.post( ... ) call.
});

app.post("/signin", async (req, res) => {
  // FIX: validate the body (and lowercase the email so it matches signup).
  const parsed = signinSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: "Invalid input", errors: z.flattenError(parsed.error).fieldErrors });
  }
  const { email, password } = parsed.data;

  // FIX: added try/catch.
  // WHY: a DB error would otherwise crash the request with no response.
  try {
    // FIX: was `User.find({ email })`, which returns a list — an empty list is
    // still truthy, so `!user` never caught a missing account. `.first()`
    // returns one user or null.
    const user = await db.orm.users.where({ email }).first();

    // FIX: same message for "no such email" and "wrong password".
    // WHY: different messages let attackers discover which emails are registered.
    // 401 (not authenticated) fits better than 403 (forbidden).
    if (!user) {
      return res.status(401).json({ message: "Incorrect credentials" });
    }

    // FIX: was `argon2.verify(password, hashedPassword)`.
    // WHY: argon2.verify(hash, plain) takes the stored hash FIRST, and
    // `hashedPassword` didn't exist here — the hash is on user.password.
    const passwordMatch = await argon2.verify(user.password, password);

    if (!passwordMatch) {
      return res.status(401).json({ message: "Incorrect credentials" });
    }

    // FIX: option is `expiresIn`, not `expireIn` (the typo made jwt.sign throw).
    const token = jwt.sign({ id: user._id.toString() }, JWT_SECRET, {
      expiresIn: '24h'
    });

    // FIX: the handler never sent a response, so the client hung forever.
    return res.json({ token });
  } catch (error) {
    return res.status(500).json({ message: "Unable to signin, something went wrong" });
  }
});


// ADDED: auth middleware for protected routes.
// WHY: todo routes must know WHICH user is calling. The client sends the token
// from /signin as `Authorization: Bearer <token>`; we verify it and put the
// user id on req.userId. Invalid/expired tokens get a 401.
function auth(req, res, next) {
  const header = req.headers.authorization ?? '';
  const [scheme, token] = header.split(' ');

  if (scheme !== 'Bearer' || !token) {
    return res.status(401).json({ message: "Missing token" });
  }

  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.userId = payload.id;
    next();
  } catch {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
}

// FIX: `const username, email` is invalid JS (const needs a value), which
// stopped the whole file from running. Stubbed until the todo routes are built.
app.post('/api/todos', auth, async (req, res) => {
  res.status(501).json({ message: "Not implemented yet" });
});



const PORT = process.env.PORT;
app.listen(PORT)