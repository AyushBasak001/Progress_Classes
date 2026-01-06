import express from 'express';
import {
    createFacultyCourseLink,
    deleteFacultyCourseLink
} from '../controllers/facultyCourseController.js';
import { adminAuth } from '../middlewares/auth.js';

const router = express.Router();

router.post('/', adminAuth, createFacultyCourseLink);
router.delete('/faculty/:facultyID/course/:courseID', adminAuth, deleteFacultyCourseLink);

export default router;