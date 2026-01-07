import express from 'express';
import {
    renderLogin,
    createLogin,
    renderHome,
    renderchangePassword,
    changePassword
} from '../controllers/adminController.js';
import { adminAuth } from '../middlewares/auth.js';

const router = express.Router();

router.get('/', adminAuth, renderHome);
router.get('/login', renderLogin);
router.post('/login', createLogin);
router.get('/changePassword', adminAuth, renderchangePassword);
router.post('/changePassword', adminAuth, changePassword);

export default router;