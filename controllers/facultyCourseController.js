import { db } from '../utils/db.js';

export const createFacultyCourseLink = async (req, res) => {
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
}

export const deleteFacultyCourseLink = async (req, res) => {
  const { facultyID, courseID } = req.params;

  try {
    const result = await db.query(
      "DELETE FROM faculty_course WHERE faculty_id = $1 AND course_id = $2",
      [facultyID, courseID]
    );

    if (result.rowCount === 0) {
      return res.status(404).send("Relation not found");
    }

    return res.status(200).send("Assignment removed");

  } catch (err) {
    console.error("DELETE /admin/faculty_course/faculty/:facultyID/course/:courseID error:", err.message);

    return res.status(500).send("Internal server error");
  }
}