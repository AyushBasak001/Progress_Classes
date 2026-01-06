import express from 'express';
import {
    renderAdminFaculties,
    createFaculty,
    updateFaculty,
    deleteFaculty
} from '../controllers/facultyController.js';
import { adminAuth } from '../middlewares/auth.js';

const router = express.Router();

router.get('/', adminAuth, renderAdminFaculties);
router.post('/', adminAuth, createFaculty);
router.patch('/:id', adminAuth, updateFaculty);
router.delete('/:id', adminAuth, deleteFaculty);

export default router;