import { db } from '../utils/db.js';
import { fetchFacultyWithCourses } from '../services/dbfetch.js';

export const renderPublicFaculties = async (req, res) => {
  try {
    const facultyList = await fetchFacultyWithCourses();

    res.status(200).render("faculty.ejs", {
      facultyList: facultyList
    });

  } catch (err) {
    console.error("GET /faculty error:", err.message);

    return res.status(500).send("Internal server error");
  }
}

export const renderAdminFaculties = async (req, res) => {
  try {
    const facultyList = await fetchFacultyWithCourses();

    return res.status(200).render("adminFaculty.ejs", {
      facultyList: facultyList
    });

  } catch (err) {
    console.error("GET /admin/faculty error:", err.message);

    return res.status(500).send("Internal server error");
  }
}

export const createFaculty = async (req, res) => {
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
}

export const updateFaculty = async (req, res) => {
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
}

export const deleteFaculty = async (req, res) => {
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
}