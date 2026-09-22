import 'dotenv/config';
import { definePrismaConfig } from '@prisma/cli-engine';
import { defineConfig as ormConfig } from '@prisma/orm-mongo/config';

export default definePrismaConfig({
  orm: ormConfig({
    // FIX: path was "./src/prisma/contract.prisma", but there is no src/ folder.
    // WHY: with the wrong path `prisma contract emit` could not find the schema,
    // so contract.json / contract.d.ts were stuck on an old User+Post template.
    contract: "./prisma/contract.prisma",
    db: {
      connection: process.env['DATABASE_URL']!,
    },
  }),
});
