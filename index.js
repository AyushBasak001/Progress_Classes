// index.js
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import cookieParser from "cookie-parser";
import courseRoutes from './routes/courseRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import enquiryRoutes from './routes/enquiryRoutes.js';
import facultyRoutes from './routes/facultyRoutes.js';
import adminCourseRoutes from './routes/adminCourseRoutes.js';
import adminFacultyRoutes from './routes/adminFacultyRoutes.js';
import adminEnquiryRoutes from './routes/adminEnquiryRoutes.js';
import adminFacultyCourseRoutes from './routes/adminFacultyCourseRoutes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Routes
app.use('/course' , courseRoutes);
app.use('/faculty', facultyRoutes);
app.use('/enquiry', enquiryRoutes);

app.use('/admin', adminRoutes);
app.use('/admin/course' , adminCourseRoutes);
app.use('/admin/faculty', adminFacultyRoutes);
app.use('/admin/Enquiry', adminEnquiryRoutes);
app.use('/admin/faculty_course', adminFacultyCourseRoutes);

app.get("/", (req, res) => {
  try {
    return res.status(200).render("index.ejs");
  } catch (err) {
    console.error("GET / error:", err.message);
    return res.status(500).send("Internal server error");
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));