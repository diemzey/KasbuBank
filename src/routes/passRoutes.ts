import { Router } from 'express';
import { PassController } from '../controllers/passController.ts';

const router = Router();
const passController = new PassController();

router.get('/pass/:username', passController.generatePass);

export default router; 