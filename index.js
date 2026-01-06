import express from "express";
import pg from "pg";
import dotenv from "dotenv";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import cookieParser from "cookie-parser";

const app = express();
const port = process.env.PORT || 3000;

dotenv.config();

// PostgreSQL client setup
const db = new pg.Client({
  user: process.env.PG_USER,
  host: process.env.PG_HOST,
  database: process.env.PG_DATABASE,
  password: process.env.PG_PASSWORD,
  port: process.env.PG_PORT,
});

db.connect()
  .then(() => console.log("Connected to PostgreSQL"))
  .catch((err) => console.error("PostgreSQL connection error:", err.message));

// Middleware
app.use(express.static("public"));          // Serve static files
app.use(express.json());                    // Parse JSON bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies
app.use(cookieParser());                    // Parse cookies

// Public Section

app.get("/", (req, res) => {
  try {
    return res.status(200).render("index.ejs");
  } catch (err) {
    console.error("GET / error:", err.message);
    return res.status(500).send("Internal server error");
  }
});

app.get("/course", async (req, res) => {
  try {
    const result = await db.query(
      `SELECT c.id, c.name, c.level,
       COALESCE(
         JSON_AGG(
           JSON_BUILD_OBJECT(
             'id', f.id,
             'first_name', f.first_name,
             'last_name', f.last_name
           )
           ORDER BY f.first_name
         ) FILTER (WHERE f.id IS NOT NULL),
         '[]'
       ) AS faculty
       FROM course c
       LEFT JOIN faculty_course fc ON fc.course_id = c.id
       LEFT JOIN faculty f ON f.id = fc.faculty_id
       GROUP BY c.id, c.name, c.level
       ORDER BY c.name ASC,
       CASE c.level
         WHEN 'beginner' THEN 1
         WHEN 'intermediate' THEN 2
         WHEN 'advanced' THEN 3
       END`
    );

    return res.status(200).render("course.ejs", {
      courseList: result.rows
    });

  } catch (err) {
    console.error("GET /course error:", err.message);

    return res.status(500).send("Internal server error");
  }
});

app.get("/faculty", async (req, res) => {
  try {
    const result = await db.query(
      `SELECT f.id, f.first_name, f.last_name, f.qualification, f.date_joined,
       COALESCE(
         JSON_AGG(
           JSON_BUILD_OBJECT(
             'id', c.id,
             'name', c.name,
             'level', c.level
           )
           ORDER BY c.name,
           CASE c.level
             WHEN 'beginner' THEN 1
             WHEN 'intermediate' THEN 2
             WHEN 'advanced' THEN 3
           END
         ) FILTER (WHERE c.id IS NOT NULL),
         '[]'
       ) AS courses
       FROM faculty f
       LEFT JOIN faculty_course fc ON fc.faculty_id = f.id
       LEFT JOIN course c ON c.id = fc.course_id
       GROUP BY f.id, f.first_name, f.last_name, f.qualification, f.date_joined
       ORDER BY f.first_name, f.last_name`
    );

    return res.status(200).render("faculty.ejs", {
      facultyList: result.rows
    });

  } catch (err) {
    console.error("GET /faculty error:", err.message);

    return res.status(500).send("Internal server error");
  }
});

app.get("/enquiry", async (req, res) => {
  try {
    const result = await db.query(
      "SELECT * FROM enquiry WHERE is_visible AND is_answered ORDER BY created_at ASC"
    );

    return res.status(200).render("enquiry.ejs", {
      enquiryList: result.rows
    });

  } catch (err) {
    console.error("GET /enquiry error:", err.message);

    return res.status(500).send("Internal server error");
  }
});

app.post("/enquiry", async (req, res) => {
  const { name, question } = req.body;

  if (!name || !question) {
    return res.status(400).send("Invalid enquiry data");
  }

  try {
    await db.query(
      "INSERT INTO enquiry (name, question) VALUES ($1, $2)",
      [name, question]
    );

    return res.status(303).redirect("/enquiry");

  } catch (err) {
    console.error("POST /enquiry error:", err.message);

    return res.status(500).send("Internal server error");
  }
});

// Admin Section

function adminAuth(req, res, next) {
  const token = req.cookies.admin_token;

  if (!token) {
    // Browser: redirect to login
    if (req.originalUrl.startsWith("/admin")) {
      return res.redirect("/admin/login");
    }
    // API: send 401
    return res.status(401).send("Unauthorized");
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (!decoded.admin) {
      return res.status(403).send("Forbidden");
    }

    next();
  } catch (err) {
    console.error("Admin auth error:", err.message);

    // Invalid token
    if (req.originalUrl.startsWith("/admin")) {
      return res.redirect("/admin/login");
    }
    return res.status(401).send("Unauthorized");
  }
}


//Admin login route

app.post("/admin/login", async (req, res) => {
  const { password } = req.body;

  if (!password) {
    return res.status(400).send("Password required");
  }

  try {
    const result = await db.query("SELECT password_hash FROM admin_auth WHERE id = TRUE");

    if (result.rowCount === 0) {
      return res.status(500).send("Admin not initialized");
    }

    const valid = await bcrypt.compare(password, result.rows[0].password_hash);

    if (!valid) {
      return res.status(401).send("Invalid password");
    }

    const token = jwt.sign(
      { admin: true },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.cookie("admin_token", token, {
      httpOnly: true,
      sameSite: "strict",
      secure: false, // change to true in HTTPS production
      maxAge: 60 * 60 * 1000
    });

    return res.redirect("/admin");

  } catch (err) {
    console.error("POST /admin/login error:", err.message);
    return res.status(500).send("Login failed");
  }
});

//Not being used currently but kept for future use
app.patch("/admin/password", adminAuth, async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  if (!oldPassword || !newPassword) {
    return res.status(400).json({ error: "Both passwords required" });
  }
  try {
    const result = await db.query("SELECT password_hash FROM admin_auth WHERE id = TRUE");
    const valid = await bcrypt.compare(oldPassword,result.rows[0].password_hash);
    if (!valid) {
      return res.status(401).json({ error: "Old password incorrect" });
    }
    const newHash = await bcrypt.hash(newPassword, 12);
    await db.query("UPDATE admin_auth SET password_hash = $1 WHERE id = TRUE",[newHash]);
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Password update failed" });
  }
});

app.get('/admin/login', (req, res) => {
  res.render("adminLogin.ejs");
});

app.get('/admin', adminAuth, (req, res) => {
  res.render("adminHome.ejs");
});

// Admin -> course Section

app.get("/admin/course", adminAuth, async (req, res) => {
  try {
    const result = await db.query(
      `SELECT c.id, c.name, c.level,
       COALESCE(
         JSON_AGG(
           JSON_BUILD_OBJECT(
             'id', f.id,
             'first_name', f.first_name,
             'last_name', f.last_name
           )
           ORDER BY f.first_name
         ) FILTER (WHERE f.id IS NOT NULL),
         '[]'
       ) AS faculty
       FROM course c
       LEFT JOIN faculty_course fc ON fc.course_id = c.id
       LEFT JOIN faculty f ON f.id = fc.faculty_id
       GROUP BY c.id, c.name, c.level
       ORDER BY c.name ASC,
       CASE c.level
         WHEN 'beginner' THEN 1
         WHEN 'intermediate' THEN 2
         WHEN 'advanced' THEN 3
       END`
    );

    return res.status(200).render("adminCourse.ejs", {
      courseList: result.rows
    });

  } catch (err) {
    console.error("GET /admin/course error:", err.message);

    return res.status(500).send("Internal server error");
  }
});

app.post("/admin/course", adminAuth, async (req, res) => {
  const { id, name, level } = req.body;

  if (!id || !name || !level) {
    return res.status(400).send("Invalid course data");
  }

  try {
    await db.query(
      "INSERT INTO course VALUES ($1, $2, $3)",
      [id, name, level]
    );

    return res.status(303).redirect("/admin/course");

  } catch (err) {
    console.error("POST /admin/course error:", err.message);

    return res.status(500).send("Internal server error");
  }
});

app.patch("/admin/course/:id", adminAuth, async (req, res) => {
  const { name, level } = req.body;
  const { id } = req.params;

  if (!name || !level) {
    return res.status(400).send("Invalid course data");
  }

  try {
    const result = await db.query(
      "UPDATE course SET name = $1, level = $2 WHERE id = $3 RETURNING *",
      [name, level, id]
    );

    if (result.rowCount === 0) {
      return res.status(404).send("Course not found");
    }

    return res.status(200).send("Course updated");

  } catch (err) {
    console.error("PATCH /admin/course error:", err.message);

    return res.status(500).send("Internal server error");
  }
});

app.delete("/admin/course/:id", adminAuth, async (req, res) => {
  const { id } = req.params;

  try {
    const result = await db.query(
      "DELETE FROM course WHERE id = $1",
      [id]
    );

    if (result.rowCount === 0) {
      return res.status(404).send("Course not found");
    }

    return res.status(200).send("Course deleted");

  } catch (err) {
    console.error("DELETE /admin/course error:", err.message);

    return res.status(500).send("Internal server error");
  }
});

// Admin -> faculty Section

app.get("/admin/faculty", adminAuth, async (req, res) => {
  try {
    const result = await db.query(
      `SELECT f.id, f.first_name, f.last_name, f.qualification, f.date_joined,
       COALESCE(
         JSON_AGG(
           JSON_BUILD_OBJECT(
             'id', c.id,
             'name', c.name,
             'level', c.level
           )
           ORDER BY c.name,
           CASE c.level
             WHEN 'beginner' THEN 1
             WHEN 'intermediate' THEN 2
             WHEN 'advanced' THEN 3
           END
         ) FILTER (WHERE c.id IS NOT NULL),
         '[]'
       ) AS courses
       FROM faculty f
       LEFT JOIN faculty_course fc ON fc.faculty_id = f.id
       LEFT JOIN course c ON c.id = fc.course_id
       GROUP BY f.id, f.first_name, f.last_name, f.qualification, f.date_joined
       ORDER BY f.first_name, f.last_name`
    );

    return res.status(200).render("adminFaculty.ejs", {
      facultyList: result.rows
    });

  } catch (err) {
    console.error("GET /admin/faculty error:", err.message);

    return res.status(500).send("Internal server error");
  }
});

app.post("/admin/faculty", adminAuth, async (req, res) => {
  const { id, fname, lname, qualification, dateJoined } = req.body;

  if (!id || !fname || !lname || !qualification || !dateJoined) {
    return res.status(400).send("Invalid faculty data");
  }

  try {
    await db.query(
      "INSERT INTO faculty VALUES ($1, $2, $3, $4, $5)",
      [id, fname, lname, qualification, dateJoined]
    );

    return res.status(303).redirect("/admin/faculty");

  } catch (err) {
    console.error("POST /admin/faculty error:", err.message);

    return res.status(500).send("Internal server error");
  }
});

app.patch("/admin/faculty/:id", adminAuth, async (req, res) => {
  const { fname, lname, qualification, dateJoined } = req.body;
  const { id } = req.params;

  if (!fname || !lname || !qualification || !dateJoined) {
    return res.status(400).send("Invalid faculty data");
  }

  try {
    const result = await db.query(
      `UPDATE faculty
       SET first_name = $1,
           last_name = $2,
           qualification = $3,
           date_joined = $4
       WHERE id = $5
       RETURNING *`,
      [fname, lname, qualification, dateJoined, id]
    );

    if (result.rowCount === 0) {
      return res.status(404).send("Faculty not found");
    }

    return res.status(200).send("Faculty updated");

  } catch (err) {
    console.error("PATCH /admin/faculty error:", err.message);

    return res.status(500).send("Internal server error");
  }
});

app.delete("/admin/faculty/:id", adminAuth, async (req, res) => {
  const { id } = req.params;

  try {
    const result = await db.query(
      "DELETE FROM faculty WHERE id = $1",
      [id]
    );

    if (result.rowCount === 0) {
      return res.status(404).send("Faculty not found");
    }

    return res.status(200).send("Faculty deleted");

  } catch (err) {
    console.error("DELETE /admin/faculty error:", err.message);

    return res.status(500).send("Internal server error");
  }
});

// Admin -> faculty-course relation Section

app.post("/admin/faculty_course", adminAuth, async (req, res) => {
  const { faculty_id, course_id } = req.body;

  if (!faculty_id || !course_id) {
    return res.status(400).send("Invalid assignment data");
  }

  try {
    const result = await db.query(
      `INSERT INTO faculty_course (faculty_id, course_id)
       VALUES ($1, $2)
       ON CONFLICT DO NOTHING
       RETURNING *`,
      [faculty_id, course_id]
    );

    if (result.rowCount === 0) {
      return res.status(409).send("Faculty already assigned to course");
    }

    return res.status(201).send("Assignment created");

  } catch (err) {
    console.error("POST /admin/faculty_course error:", err.message);

    return res.status(500).send("Internal server error");
  }
});

app.delete("/admin/faculty/:facultyId/courses/:courseId", adminAuth, async (req, res) => {
  const { facultyId, courseId } = req.params;

  try {
    const result = await db.query(
      "DELETE FROM faculty_course WHERE faculty_id = $1 AND course_id = $2",
      [facultyId, courseId]
    );

    if (result.rowCount === 0) {
      return res.status(404).send("Relation not found");
    }

    return res.status(200).send("Assignment removed");

  } catch (err) {
    console.error("DELETE /admin/faculty/:facultyId/courses/:courseId error:", err.message);

    return res.status(500).send("Internal server error");
  }
});

// Admin -> enquiry Section

app.get("/admin/enquiry", adminAuth, async (req, res) => {
  try {
    const result = await db.query(
      "SELECT * FROM enquiry ORDER BY created_at ASC"
    );

    return res.status(200).render("adminEnquiry.ejs", {
      enquiryList: result.rows
    });

  } catch (err) {
    console.error("GET /admin/enquiry error:", err.message);

    return res.status(500).send("Internal server error");
  }
});

app.patch("/admin/enquiry/:id", adminAuth, async (req, res) => {
  const { answer, is_visible } = req.body;
  const { id } = req.params;

  if (typeof is_visible === "undefined") {
    return res.status(400).send("Missing visibility status");
  }

  try {
    let result;

    if ("answer" in req.body) {
      result = await db.query(
        `UPDATE enquiry
         SET answer = $1,
             is_answered = true,
             answered_at = CURRENT_TIMESTAMP,
             is_visible = $2
         WHERE id = $3
         RETURNING *`,
        [answer, is_visible, id]
      );
    } else {
      result = await db.query(
        `UPDATE enquiry
         SET answer = null,
             is_answered = false,
             answered_at = null,
             is_visible = $1
         WHERE id = $2
         RETURNING *`,
        [is_visible, id]
      );
    }

    if (result.rowCount === 0) {
      return res.status(404).send("Enquiry not found");
    }

    return res.status(200).send("Enquiry updated");

  } catch (err) {
    console.error("PATCH /admin/enquiry error:", err.message);

    return res.status(500).send("Internal server error");
  }
});

app.delete("/admin/enquiry/:id", adminAuth, async (req, res) => {
  const { id } = req.params;

  try {
    const result = await db.query(
      "DELETE FROM enquiry WHERE id = $1",
      [id]
    );

    if (result.rowCount === 0) {
      return res.status(404).send("Enquiry not found");
    }

    return res.status(200).send("Enquiry deleted");

  } catch (err) {
    console.error("DELETE /admin/enquiry error:", err.message);

    return res.status(500).send("Internal server error");
  }
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});