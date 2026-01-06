import express from 'express';
import {
    renderLogin,
    createLogin,
    renderHome
} from '../controllers/adminController.js';
import { adminAuth } from '../middlewares/auth.js';

const router = express.Router();

router.get('/', adminAuth, renderHome);
router.get('/login', renderLogin);
router.post('/login', createLogin);
// router.patch('/:id', adminAuth, updateFaculty);

export default router;