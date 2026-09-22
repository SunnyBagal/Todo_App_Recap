import express from 'express';
// FIX: removed unused `{ argon2id }` named import — we use argon2.argon2id below.
import argon2 from 'argon2';


const app = express()
app.use(express.json());
const JWT_SECRET = process.env.JWT_SECRET

app.post('/signup', async (req, res) => {

  const { name, email, password }  = req.body;

  try {
    const hashedPassword = await argon2.hash(password, {
      type: argon2.argon2id,
      memoryCost: 65536,  //64 MiB
      timeCost: 1,
      hashLength: 32,
      saltLength: 16,
      parallelism: 2
    });

    await User.create({
      email,
      hashedPassword,
      username: name
    });

    res.status(201).json({
      message: "Signup successfull"
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

app.post("/signin", async(req,res) => {
  const {email, password} = req.body;

  const user = await User.find({ email });

  if (!user){
    return res.status(403).json({
      message: "Inccorect Email"
    });
  }

  const passwordMatch = await argon2.verify(password, hashedPassword);

  if (!passwordMatch) {
    return res.status(403).json({ message: 'Incorrect credentials' });
  }

  const token = jwt.sign({ id: user._id.toString() }, JWT_SECRET, {
    expireIn: '24h'
  });


})


// FIX: `const username, email` is invalid JS (const needs a value), which
// stopped the whole file from running. Stubbed until the todo routes are built.
app.post('/api/todos', async (req, res) => {
  res.status(501).json({ message: "Not implemented yet" });
});



const PORT = process.env.PORT;
app.listen(PORT)