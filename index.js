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

// Public Section

app.get('/', (req, res) => {
  res.send("Progress Classes Backend Running");
});

app.get("/course", async (req, res) => {
  try {
    const result = await db.query("SELECT fc.course_id, c.name AS course_name, c.level, fc.faculty_id, f.first_name, f.last_name FROM faculty_course fc JOIN faculty f ON fc.faculty_id = f.id JOIN course c ON fc.course_id = c.id ORDER BY c.name ASC, CASE c.level WHEN 'beginner' THEN 1 WHEN 'intermediate' THEN 2 WHEN 'advanced' THEN 3 END ASC");
    const courses = result.rows;
    res.json(courses);
  } catch (err) {
    console.error("Error executing Query : ", err);
    res.json({'error': err});
  }
});

app.get("/faculty", async (req, res) => {
  try {
    const result = await db.query("SELECT fc.faculty_id, f.first_name, f.last_name, f.qualification, f.date_joined, fc.course_id, c.name AS course_name, c.level FROM faculty_course fc JOIN faculty f ON fc.faculty_id = f.id JOIN course c ON fc.course_id = c.id ORDER BY f.first_name ASC, f.last_name ASC");
    const faculties = result.rows;
    res.json(faculties);
  } catch (err) {
    console.error("Error executing Query : ", err);
    res.json({'error': err});
  }
});

app.get("/enquiry", async (req, res) => {
  try {
    const result = await db.query("SELECT * FROM enquiry WHERE is_visible AND is_answered ORDER BY created_at ASC");
    const enquiries = result.rows;
    res.json(enquiries);
  } catch (err) {
    console.error("Error executing Query : ", err);
    res.json({'error': err});
  }
});

app.post("/enquiry", async (req, res) => {
  const name = req.body.name;
  const question = req.body.question;
  try {
    const result = await db.query("INSERT INTO enquiry (name, question) VALUES($1,$2) RETURNING *",[name,question]);
    res.json(result.rows[0]);
  } catch (err) {
    console.error("Error executing Query : ", err);
    res.json({'error': err});
  }
});

// Admin Section

app.get('/admin-login', (req, res) => {
  res.send("Admin Login page");
});

app.get('/admin', (req, res) => {
  res.send("Welcome admin");
});

// Admin -> course Section

app.get("/admin/course", async (req, res) => {
  try {
    const result = await db.query("SELECT c.id AS course_id, c.name AS course_name, c.level, fc.faculty_id, f.first_name, f.last_name FROM course c LEFT JOIN faculty_course fc ON c.id = fc.course_id LEFT JOIN faculty f ON fc.faculty_id = f.id ORDER BY c.name ASC, CASE c.level WHEN 'beginner' THEN 1 WHEN 'intermediate' THEN 2 WHEN 'advanced' THEN 3 END ASC");
    const courses = result.rows;
    res.json(courses);
  } catch (err) {
    console.error("Error executing Query : ", err);
    res.json({'error': err});
  }
});

app.post("/admin/course", async (req, res) => {
  const id = req.body.id;
  const name = req.body.name;
  const level = req.body.level;
  try {
    const result = await db.query("INSERT INTO course VALUES($1,$2,$3) RETURNING *",[id,name,level]);
    res.json(result.rows[0]);
  } catch (err) {
    console.error("Error executing Query : ", err);
    res.json({'error': err});
  }
});

app.patch("/admin/course/:id", async (req, res) => {
  try {
    const result = await db.query("UPDATE course SET name = $1, level = $2 WHERE id = $3 RETURNING *",[req.body.name,req.body.level,req.params.id]);
    res.json(result.rows[0]);
  } catch (err) {
    console.error("Error executing Query : ", err);
    res.json({'error': err});
  }
});

app.delete("/admin/course/:id", async (req, res) => {
  try {
    const result = await db.query("DELETE FROM course WHERE id = $1",[req.params.id]);
    res.json(result.rowCount);
  } catch (err) {
    console.error("Error executing Query : ", err);
    res.json({'error': err});
  }
});

// Admin -> faculty Section

app.get("/admin/faculty", async (req, res) => {
  try {
    const result = await db.query("SELECT fc.faculty_id, f.first_name, f.last_name, f.qualification, f.date_joined, fc.course_id, c.name AS course_name, c.level FROM faculty_course fc JOIN faculty f ON fc.faculty_id = f.id JOIN course c ON fc.course_id = c.id ORDER BY f.first_name ASC, f.last_name ASC");
    const faculties = result.rows;
    res.json(faculties);
  } catch (err) {
    console.error("Error executing Query : ", err);
    res.json({'error': err});
  }
});

// Admin -> enquiry Section

app.get("/admin/enquiry", async (req, res) => {
  try {
    const result = await db.query("SELECT * FROM enquiry ORDER BY created_at ASC");
    const enquiries = result.rows;
    res.json(enquiries);
  } catch (err) {
    console.error("Error executing Query : ", err);
    res.json({'error': err});
  }
});

app.patch("/admin/enquiry/:id", async (req, res) => {
  if('answer' in req.body){
    try {
      const result = await db.query("UPDATE enquiry SET answer = $1, is_answered = true, answered_at = CURRENT_TIMESTAMP, is_visible = $2 WHERE id = $3 RETURNING *",[req.body.answer,req.body.is_visible,req.params.id]);
      res.json(result.rows[0]);
    } catch (err) {
      console.error("Error executing Query : ", err);
      res.json({'error': err});
    }
  } else{
    try {
      const result = await db.query("UPDATE enquiry SET answer = null, is_answered = false, answered_at = null, is_visible = $1 WHERE id = $2 RETURNING *",[req.body.is_visible,req.params.id]);
      res.json(result.rows[0]);
    } catch (err) {
      console.error("Error executing Query : ", err);
      res.json({'error': err});
    }
  }
});

app.delete("/admin/enquiry/:id", async (req, res) => {
  try {
    const result = await db.query("DELETE FROM enquiry WHERE id = $1",[req.params.id]);
    res.json(result.rowCount);
  } catch (err) {
    console.error("Error executing Query : ", err);
    res.json({'error': err});
  }
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});