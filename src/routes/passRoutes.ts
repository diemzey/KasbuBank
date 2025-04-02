import express from 'express';
import { generatePass } from '../controllers/passController.js';

const router = express.Router();

router.get('/pass/:username', generatePass);

export default router; 