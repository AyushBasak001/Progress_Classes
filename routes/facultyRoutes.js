import express from 'express';
import {renderPublicFaculties} from '../controllers/facultyController.js';

const router = express.Router();

router.get('/', renderPublicFaculties);

export default router;