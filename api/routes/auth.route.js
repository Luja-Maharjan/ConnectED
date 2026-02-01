import express from 'express'
import { signin, signup, getCurrentUser, signout, teacherExists } from '../controllers/auth.controller.js';
import { verifyToken } from '../middleware/verifyToken.js';

const router = express.Router();

router.post("/signup", signup);
router.post("/signin", signin);
router.get("/teacher-exists", teacherExists);
router.get("/me", verifyToken, getCurrentUser);
router.post("/signout", verifyToken, signout);

export default router;