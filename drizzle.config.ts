import { defineConfig } from "drizzle-kit";

const databasePath = process.env.DATABASE_URL?.replace('file:', '') || './dev.db';

export default defineConfig({
  out: "./migrations",
  schema: "./shared/schema.ts",
  dialect: "sqlite",
  dbCredentials: {
    url: databasePath,
  },
});
