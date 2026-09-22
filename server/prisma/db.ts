import 'dotenv/config';
import mongo from '@prisma/orm-mongo/runtime';
import type { Contract } from './contract';
import contractJson from './contract.json' with { type: 'json' };

// NOTE: this project uses Prisma, not Mongoose — no `mongoose.connect()` needed.
// WHY: Prisma connects lazily on the first query, and the routes use
// `db.orm.users` / `db.orm.todos` from this export.

// FIX: fail fast with a clear message instead of `process.env.DATABASE_URL!`.
// WHY: `!` only silences TypeScript; a missing URL would crash later with a
// confusing driver error on the first request.
const url = process.env['DATABASE_URL'];
if (!url) {
  throw new Error('DATABASE_URL is not set — add it to server/.env');
}

export const db = mongo<Contract>({
  contractJson,
  url,
});
