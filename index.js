import express from "express";
import bodyParser from "body-parser";
import pg from "pg";
import env from "dotenv";

const app = express();
const port = 3000;
env.config();

const db = new pg.Client({
  user: process.env.PG_USER,
  host: process.env.PG_HOST,
  database: process.env.PG_DATABASE,
  password: process.env.PG_PASSWORD,
  port: process.env.PG_PORT,
});
db.connect();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

app.get('/', (req, res) => {
  res.send("Progress Classes Backend Running");
});

app.get("/course", async (req, res) => {
  try {
    const result = await db.query("SELECT * FROM course ORDER BY name ASC");
    const courses = result.rows;
    res.json(courses);
  } catch (err) {
    console.error("Error executing Query : ", err);
    res.json({'error': err});
  }
});

app.get("/faculty", async (req, res) => {
  try {
    const result = await db.query("SELECT * FROM faculty ORDER BY first_name ASC, last_name ASC");
    const faculties = result.rows;
    res.json(faculties);
  } catch (err) {
    console.error("Error executing Query : ", err);
    res.json({'error': err});
  }
});

app.get("/enquiry", async (req, res) => {
  try {
    const result = await db.query("SELECT * FROM enquiry");
    const enquiries = result.rows;
    res.json(enquiries);
  } catch (err) {
    console.error("Error executing Query : ", err);
    res.json({'error': err});
  }
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});