import express from 'express';
import argon2 from 'argon2';
import { db } from '../prisma/db';
import jwt from 'jsonwebtoken';.
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

// ADDED: todo routes (replaces the unfinished `const username, email` stub).
// Every query filters by userId so users can only touch their OWN todos.

const todoSchema = z.object({
  title: z.string().trim().min(1).max(200),
  description: z.string().trim().max(2000).default(""),
});

// WHY: a malformed id (not 24 hex chars) would make the ObjectId codec throw
// a 500; checking first lets us answer 404 like any other unknown todo.
const isObjectId = (id) => /^[a-f\d]{24}$/i.test(id);

// Create a todo for the logged-in user.
app.post('/api/todos', auth, async (req, res) => {
  const parsed = todoSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: "Invalid input", errors: z.flattenError(parsed.error).fieldErrors });
  }

  try {
    // WHY new Date(): Prisma 8 Mongo has no @default(now()), so dates are set here.
    const now = new Date();
    const todo = await db.orm.todos.create({
      ...parsed.data,
      userId: req.userId,
      created_At: now,
      updated_At: now,
    });
    return res.status(201).json(todo);
  } catch (error) {
    return res.status(500).json({ message: "Unable to create todo" });
  }
});

// List the logged-in user's todos, newest first.
app.get('/api/todos', auth, async (req, res) => {
  try {
    const todos = await db.orm.todos
      .where({ userId: req.userId })
      .orderBy({ created_At: -1 })
      .all();
    return res.json(todos);
  } catch (error) {
    return res.status(500).json({ message: "Unable to fetch todos" });
  }
});

// Update one of the user's todos.
app.put('/api/todos/:id', auth, async (req, res) => {
  const { id } = req.params;
  // WHY partial(): allow updating only the title or only the description.
  const parsed = todoSchema.partial().safeParse(req.body);
  if (!isObjectId(id)) {
    return res.status(404).json({ message: "Todo not found" });
  }
  if (!parsed.success) {
    return res.status(400).json({ message: "Invalid input", errors: z.flattenError(parsed.error).fieldErrors });
  }

  try {
    // WHY filter by _id AND userId: stops users editing someone else's todo.
    const mine = db.orm.todos.where({ _id: id, userId: req.userId });
    if (!(await mine.first())) {
      return res.status(404).json({ message: "Todo not found" });
    }

    // WHY updated_At here: @default only covers creation.
    await mine.update({ ...parsed.data, updated_At: new Date() });
    return res.json(await mine.first());
  } catch (error) {
    return res.status(500).json({ message: "Unable to update todo" });
  }
});

// Delete one of the user's todos.
app.delete('/api/todos/:id', auth, async (req, res) => {
  const { id } = req.params;
  if (!isObjectId(id)) {
    return res.status(404).json({ message: "Todo not found" });
  }

  try {
    const mine = db.orm.todos.where({ _id: id, userId: req.userId });
    if (!(await mine.first())) {
      return res.status(404).json({ message: "Todo not found" });
    }

    await mine.delete();
    return res.status(204).end();
  } catch (error) {
    return res.status(500).json({ message: "Unable to delete todo" });
  }
});


const PORT = process.env.PORT;
app.listen(PORT)