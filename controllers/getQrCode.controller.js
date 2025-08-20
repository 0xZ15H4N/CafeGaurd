import asyncHandler from "../utils/asyncHandler.utils.js";
import dotenv from "dotenv";
import crypto from "crypto";
import QRCode from "qrcode";
import path from "path";
import fs from "fs";

dotenv.config({ path: "./.env" });

// --- AES Encryption Utility ---
function getKeyFromPassword(password) {
    return crypto.createHash('sha256').update(password, 'utf8').digest();
}

function encrypt(plainText, password) {
    const key = getKeyFromPassword(password);
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);

    let encrypted = cipher.update(plainText, 'utf8', 'binary');
    encrypted += cipher.final('binary');

    const encryptedBuffer = Buffer.concat([iv, Buffer.from(encrypted, 'binary')]);
    return encryptedBuffer.toString('base64');
}

// --- QR Code Generator ---
async function generateQRCode(encryptedText, ip) {
    const filename = `${ip.replaceAll(".", "")}.png`;
    const outputPath = path.resolve("public", filename);

    // Ensure the assets directory exists
    fs.mkdirSync(path.dirname(outputPath), { recursive: true });

    await QRCode.toFile(outputPath, encryptedText, {
        width: 300,
        height: 300,
    });

    console.log(`✅ QR Code generated at: ${outputPath}`);
}

// --- Main Controller ---
const getQrCode = asyncHandler(async (req, res) => {
    const ip = (req.socket.remoteAddress || "")
        .replace("::ffff:", "")
        .replace("::1", "127.0.0.1");
    console.log("the ip recieves is ",ip);
    const now = new Date();
    let formatted =JSON.parse(`{"time":"${String(now.getHours() + 1).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}"}`);
    formatted.ip = `${ip}`;
  console.log("the time limit granted : ", formatted.time, "ip address is ", formatted.ip);
    formatted = JSON.stringify(formatted);
console.log(formatted)

const password = process.env.SECRET_TOKEN || "mySecretPassword123";

    try {
        const encrypted = encrypt(formatted, password);
        await generateQRCode(encrypted, ip);
        return res.redirect("/show-QrCode");
    } catch (err) {
        console.error('❌ Error:', err.message);
        return res.status(500).send("QR Code generation failed");
    }
});

const redirectRequest = asyncHandler(async (req, res) => {
       return res.redirect("/qrcode");
});


export {
    getQrCode,
  redirectRequest };
