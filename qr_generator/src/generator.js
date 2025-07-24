
import crypto from "crypto"
import fs from "fs"
import QRCode from "qrcode"
import readline from "readline";

// AES Encryption Utility
function getKeyFromPassword(password) {
    return crypto.createHash('sha256').update(password, 'utf8').digest();
}

function encrypt(plainText, password) {
    const key = getKeyFromPassword(password);
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);

    let encrypted = cipher.update(plainText, 'utf8', 'binary');
    encrypted += cipher.final('binary');

    // Combine IV and ciphertext
    const encryptedBuffer = Buffer.concat([iv, Buffer.from(encrypted, 'binary')]);

    return encryptedBuffer.toString('base64');
}

// QR Code Generator
function generateQRCode(encryptedText) {
    const outputPath = '../../assets/qr.png';
    QRCode.toFile(outputPath, encryptedText, {
        width: 300,
        height: 300
    }, function (err) {
        if (err) throw err;
        console.log(`✅ QR Code generated at: ${outputPath}`);
    });
}

// Main logic
function main() {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    rl.question('Enter your name: ', function (name) {
        rl.close();
        const now = new Date();
        const formatted = `(${String(now.getHours() + 1).padStart(2, '0')}-${String(now.getMinutes()).padStart(2, '0')}-${String(now.getSeconds()).padStart(2, '0')})`;
        const data = `${formatted}-${name}`;
        const password = 'mySecretPassword123';

        try {
            const encrypted = encrypt(data, password);
            generateQRCode(encrypted);
        } catch (err) {
            console.error('❌ Error:', err.message);
        }
    });
}


export {
    generateQRCode,
    getKeyFromPassword,
    encrypt
}