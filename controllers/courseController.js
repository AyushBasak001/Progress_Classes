import { db } from '../utils/db.js';
import { fetchCoursesWithFaculty } from '../services/dbfetch.js';

export const renderPublicCourses = async (req, res) => {
  try {
    const courseList = await fetchCoursesWithFaculty();

    res.status(200).render("course.ejs", {
      courseList: courseList
    });

  } catch (err) {
    console.error("GET /course error:", err.message);

    res.status(500).send("Internal server error");
  }
}

export const renderAdminCourses = async (req, res) => {
  try {
    const courseList = await fetchCoursesWithFaculty();

    res.status(200).render("adminCourse.ejs", {
      courseList: courseList
    });

  } catch (err) {
    console.error("GET /admin/course error:", err.message);

    res.status(500).send("Internal server error");
  }
}

export const createCourse = async (req, res) => {
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
}

export const updateCourse = async (req, res) => {
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
}

export const deleteCourse = async (req, res) => {
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
}