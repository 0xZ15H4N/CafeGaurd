import {Router} from "express";
import { getQrCode } from "../controllers/getQrCode.controller.js";

const router = Router();

router.route("/qrcode").get(getQrCode)

export default router
