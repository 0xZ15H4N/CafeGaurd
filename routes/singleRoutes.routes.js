import {Router} from "express";
import { getQrCode, redirectRequest } from "../controllers/getQrCode.controller.js";
const router = Router();
router.route("/").get(redirectRequest)
router.route("/qrcode").get(getQrCode)

export default router
