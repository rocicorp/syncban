import postgres from "postgres";

// Initialize postgres connection
const dbURL = process.env.DATABASE_URL;
if (!dbURL) {
  throw new Error("DATABASE_URL is not defined");
}

export const sql = postgres(dbURL);
