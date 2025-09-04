import {Router} from "express";
import { genOTP, verifyOTP } from "../controllers/client.controller.js";
const router = Router();

router.route("/generate-otp").post(genOTP)
router.route("/verify-otp").post(verifyOTP)

export default router
