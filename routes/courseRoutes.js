import express from 'express';
import {renderPublicCourses} from '../controllers/courseController.js';

const router = express.Router();

router.get('/', renderPublicCourses);

export default router;
