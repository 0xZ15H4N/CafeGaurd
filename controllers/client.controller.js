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
        return res.status(200).send("OTP Verified Successfully!");
    } catch (err) {
        console.error('❌ Error:', err.message);
        return res.status(500).send("QR Code generation failed");
    }
});


const genOTP = asyncHandler(async (req,res) => {
  let {client_number} = req.body; // for testing purpose i have use my number to send the message
  
  // checking if the number len is 10
  if(client_number==''){res.status(400).send("Enter Correct Number");}
  client_number =  client_number.replace(/^\+91/, ''); // right now we are surving only the INDIA +91 need improvement here!
  if(client_number.length != 10){res.status(400).send("Enter Correct Number");}

  // checking if the number contains only digit
  if(!(/^[0-9]+$/.test(client_number))){ res.status(400).send("Enter Correct Number"); }
  client_number = client_number.replace(/\s+/g, '');
  const otp = Math.floor(100000 + Math.random() * 900000);

/* HERE WILL ADD THE OTP API INTEGARTION THAT'S THE PAID PART {twilio or fast2sms}
  //   const response =
  console.log(response)
  res.status(200).send(`OTP send successfully ${otp}`)
*/
console.log(client_number)
 const expiresAt = Date.now() + 30000;
 otpStore.set(client_number, { otp, expiresAt }); // temproraliy store the otp in memroy after 30sec it expires
 
 // Auto-delete after TTL
 setTimeout(() => otpStore.delete(client_number), 30000);
 console.log(`otp : ${otp}`);
 res.status(200).send(`${custom_message} + ${otp}`);


})
const verifyOTP = asyncHandler (async (req, res) => {
    const { client_number, otp } = req.body;
    const storedOtp = otpStore.get(client_number); // Or fetch from Redis
    console.log(storedOtp)
    if (!storedOtp) {
      return res.status(410).json({ message: "OTP expired or not found" });
    }
  
    if (storedOtp.otp != otp) {
      return res.status(401).json({ message: "Invalid OTP" });
    }
  
    // Success
    otpStore.delete(client_number);
    // at this moment we need to generate the qr code for the user
    getQrCode(req,res);
  });


export {
    genOTP ,
    verifyOTP
};
