import { defineConfig } from "drizzle-kit";

if (!process.env.DATABASE_URL) {
  console.warn("DATABASE_URL no encontrada en drizzle.config.ts");
}

export default defineConfig({
  out: "./migrations",
  schema: "./shared/schema.ts",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL,
  },
});
