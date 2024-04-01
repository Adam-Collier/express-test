import pg from "pg";

export const client = new pg.Pool({
  connectionString: process.env["DATABASE_URL"],
});

client.on("error", (err) => {
  console.error("Unexpected error on idle client", err);
});
