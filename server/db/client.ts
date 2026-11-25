// Single PrismaClient for the process. Only repositories should import this.
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";

import { PrismaClient } from "../../generated/prisma/client";

const url = process.env.DATABASE_URL;
if (!url) throw new Error("DATABASE_URL is not set (copy .env.example to .env)");

export const prisma = new PrismaClient({
  adapter: new PrismaBetterSqlite3({ url }),
});
