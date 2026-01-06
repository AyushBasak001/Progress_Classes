import express from 'express';
import {
    renderAdminCourses,
    createCourse,
    updateCourse,
    deleteCourse
} from '../controllers/courseController.js';
import { adminAuth } from '../middlewares/auth.js';

const router = express.Router();

router.get('/', adminAuth, renderAdminCourses);
router.post('/', adminAuth, createCourse);
router.patch('/:id', adminAuth, updateCourse);
router.delete('/:id', adminAuth, deleteCourse);

export default router;