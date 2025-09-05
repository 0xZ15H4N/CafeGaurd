import asyncHandler from "../utils/asyncHandler.utils.js";
import dotenv from "dotenv";
import crypto from "crypto";
import QRCode from "qrcode";
import path from "path";
import fs from "fs";
import fast2sms from "fast-two-sms";
import {custom_message} from "../constants.js"



dotenv.config({ path: "./.env" });

const otpStore = new Map(); 
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
    const {client_number} = req.body;
    console.log("inside the genOrcode : ",client_number)
    const storedOtp = otpStore.get(client_number);
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

const password = process.env.SECRET_TOKEN || "mySecretPassword123"; // defualt password
 
    try {
        const encrypted = encrypt(formatted, password);
        await generateQRCode(encrypted, ip);
        return res.status(200).json({ secret_token: storedOtp.secretToken });// save this token in the localstorage at the frontend!
    } catch (err) {
        console.error('❌ Error:', err.message);
        return res.status(500).send("QR Code generation failed");
    }
});


const genOTP = asyncHandler(async (req,res) => {
  let { client_number } = req.body; 

  // 1. Check empty
  if (!client_number) {
    return res.status(400).send("Enter Correct Number");
  }
  
  // 2. Remove spaces and trim
  client_number = client_number.replace(/\s+/g, '').trim();
  
  // 3. Remove +91 prefix (for Indian numbers)
  client_number = client_number.replace(/^(\+91)/, '');
  const len  = (client_number.length)

  // 4. Check length
  if (len != 10) {
    return res.status(400).send("Enter Correct Number");
  }
  
  // 5. Check digits only
  if (!/^[0-9]+$/.test(client_number)) {
    return res.status(400).send("Enter Correct Number");
  }
  
  console.log("Validated client_number:", client_number);
  
  // 6. Generate OTP
  const otp = Math.floor(100000 + Math.random() * 900000);
  

/* HERE WILL ADD THE OTP API INTEGARTION THAT'S THE PAID PART {twilio or fast2sms}
  //   const response =
  console.log(response)
  res.status(200).send(`OTP send successfully ${otp}`)
*/

const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
let secretToken = "";
const len2 = characters.length
for (let i = 0; i < 6; i++) {
  secretToken += characters.charAt(Math.floor(Math.random() * len2));
}
console.log(secretToken);
 const expiresAt = Date.now() + 30000*2*60;
 otpStore.set(client_number, { otp, expiresAt,secretToken }); // temproraliy store the otp in memroy after 30sec it expires
 console.log(otpStore)
 // Auto-delete after TTL
 setTimeout(() => otpStore.delete(client_number), 30000*2*60);
 console.log(`otp : ${otp}`);
 res.status(200).send(`${custom_message} + ${otp}`);


})
const verifyOTP = asyncHandler (async (req, res) => {
    const { client_number, otp } = req.body;
    const storedOtp = otpStore.get(client_number); // Or fetch from Redis

    if (!storedOtp) {
      return res.status(410).json({ message: "OTP expired or not found" });
    }
  
    if (storedOtp.otp != otp) {
      return res.status(401).json({ message: "Invalid OTP" });
    }
  
    // Success
    // otpStore.delete(client_number);
    // at this moment we need to generate the qr code for the user
    getQrCode(req,res);
  });


// add the functionality of verify token using the phonenumber


export {
    genOTP ,
    verifyOTP
};
