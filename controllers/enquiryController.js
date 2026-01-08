import { db } from '../utils/db.js';

export const renderPublicEnquiries = async (req, res) => {
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
}

export const renderAdminEnquiries = async (req, res) => {
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
}

export const createEnquiry = async (req, res) => {
  let { name, question } = req.body;

  if (!question || !question.trim()) {
    return res.status(400).send("Question is required");
  }
  name = name && name.trim() ? name.trim() : null;

  try {
    await db.query(
      "INSERT INTO enquiry (name, question) VALUES ($1, $2)",
      [name, question.trim()]
    );

    return res.status(303).redirect("/enquiry");

  } catch (err) {
    console.error("POST /enquiry error:", err.message);

    return res.status(500).send("Internal server error");
  }
}

export const updateEnquiry = async (req, res) => {
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
}

export const deleteEnquiry = async (req, res) => {
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
}