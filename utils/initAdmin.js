import bcrypt from "bcrypt";
import pg from "pg";
import dotenv from "dotenv";

dotenv.config();

const pool = new pg.Pool({
  user: process.env.PG_USER,
  host: process.env.PG_HOST,
  database: process.env.PG_DATABASE,
  password: process.env.PG_PASSWORD,
  port: process.env.PG_PORT,
  ssl: {
    rejectUnauthorized: false
  }
});


const PASSWORD = process.argv[2];

if (!PASSWORD) {
  console.error("Usage: node initAdmin.js <password>");
  process.exit(1);
}

const run = async () => {
  const hash = await bcrypt.hash(PASSWORD, 12);

  await pool.query(
    `INSERT INTO admin_auth (id, password_hash)
     VALUES (TRUE, $1)
     ON CONFLICT (id) DO NOTHING`,
    [hash]
  );

  console.log("✅ Admin password initialized");
  process.exit(0);
};

run();
