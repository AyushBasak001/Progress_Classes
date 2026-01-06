import express from 'express';
import {
    renderAdminEnquiries,
    updateEnquiry,
    deleteEnquiry
} from '../controllers/enquiryController.js';
import { adminAuth } from '../middlewares/auth.js';

const router = express.Router();

router.get('/', adminAuth, renderAdminEnquiries);
router.patch('/:id', adminAuth, updateEnquiry);
router.delete('/:id', adminAuth, deleteEnquiry);

export default router;