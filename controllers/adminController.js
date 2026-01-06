import { db } from '../utils/db.js';
import bcrypt from 'bcrypt';
import jwt from "jsonwebtoken";

export const createLogin = async (req, res) => {
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
}

//Not being used currently but kept for future use
export const updateLogin = async (req, res) => {
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
}

export const renderLogin = (req, res) => {
  res.render("adminLogin.ejs");
}

export const renderHome = (req, res) => {
  res.render("adminHome.ejs");
}