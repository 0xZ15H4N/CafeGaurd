import {Router} from "express";
import { getQrCode, redirectRequest } from "../controllers/getQrCode.controller.js";
const router = Router();
//router.route("/").get(redirectRequestctRequest)
router.route("/qrcode").post(getQrCode)
export default router
