import express from 'express';
import {
  renderPublicEnquiries,
  createEnquiry
} from '../controllers/enquiryController.js';

const router = express.Router();

router.get('/', renderPublicEnquiries);
router.post('/', createEnquiry);

export default router;