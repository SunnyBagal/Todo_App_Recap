# Todo App

A small full-stack todo app: sign up, sign in, and manage your own todos.

| Part | Stack |
|---|---|
| `frontend/` | React 19, Vite, Tailwind CSS v4, TanStack Query, Zustand, React Router |
| `server/` | Bun, Express, Prisma 8 (MongoDB), argon2, JWT, zod |

## Running it

**1. Backend** (needs MongoDB 8+ running):

```bash
cd server
cp .env.example .env     # then fill in DATABASE_URL, JWT_SECRET, PORT=5000
bun install
bun prisma db init       # creates the collections and the unique email index
bun run dev              # http://localhost:5000
```

**2. Frontend:**

```bash
cd frontend
npm install
npm run dev              # http://localhost:5173
```

Vite proxies `/signup`, `/signin` and `/api/*` to the backend on port 5000, so
there is no CORS setup to worry about.

## API

| Method | Path | Auth | Purpose |
|---|---|---|---|
| POST | `/signup` | – | Create an account |
| POST | `/signin` | – | Get a JWT |
| GET | `/api/todos` | Bearer | List your todos |
| POST | `/api/todos` | Bearer | Create a todo |
| PUT | `/api/todos/:id` | Bearer | Update a todo |
| DELETE | `/api/todos/:id` | Bearer | Delete a todo |

## Frontend layout

```
src/
├── lib/api.js          all fetch calls to the backend
├── store/authStore.js  Zustand: token + user (persisted to localStorage)
├── hooks/              TanStack Query hooks (useTodos, useAuth)
├── components/         UI building blocks
├── pages/              SignIn, SignUp, Todos
└── learn/              standalone Zustand + Query examples with tests
```

## Learning the libraries

`frontend/src/learn/` is a playground the app never imports, with a written
guide and runnable tests:

```bash
cd frontend
npm test
```

Start with [`frontend/src/learn/README.md`](frontend/src/learn/README.md).
