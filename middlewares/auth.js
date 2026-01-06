import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

export const adminAuth = (req, res, next) => {
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