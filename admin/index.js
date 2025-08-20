import { BrowserMultiFormatReader } from "https://cdn.jsdelivr.net/npm/@zxing/library@latest/+esm";

// Password must match Java-side
const password = "mySecretPassword123";

// Convert password to SHA-256 hash like Java's getKeyFromPassword
async function deriveKey(password) {
  const encoder = new TextEncoder();
  const keyData = encoder.encode(password);
  const hash = await crypto.subtle.digest("SHA-256", keyData);

  return await crypto.subtle.importKey(
    "raw",
    hash,
    { name: "AES-CBC" },
    false,
    ["decrypt"]
  );
}

// Decrypt AES-CBC encrypted data with IV prepended
window.decrypt = async function (encryptedB64, password) {
  const encryptedBytes = Uint8Array.from(atob(encryptedB64), c => c.charCodeAt(0));

  const iv = encryptedBytes.slice(0, 16);
  const ciphertext = encryptedBytes.slice(16);

  const key = await deriveKey(password);

  const decryptedBuffer = await crypto.subtle.decrypt(
    { name: "AES-CBC", iv: iv },
    key,
    ciphertext
  );

  return new TextDecoder().decode(decryptedBuffer);
};

// QR Code scanner function exposed globally
window.startScanner = async function () {
  const codeReader = new BrowserMultiFormatReader();
  const videoElement = document.getElementById("reader");
  const resultText = document.getElementById("result");
  const decrypted = document.getElementById("decrypted");

  try {
    const devices = await navigator.mediaDevices.enumerateDevices();
    const videoInputDevices = devices.filter(d => d.kind === "videoinput");
    const backCamera = videoInputDevices.find(d => d.label.toLowerCase().includes("back")) || videoInputDevices[0];
    const selectedDeviceId = backCamera.deviceId;

    codeReader.decodeFromVideoDevice(
      selectedDeviceId,
      "reader",
      async (result, err, controls) => {
        if (result) {
          const encryptedText = JSON.parse(result.getText());
          
          resultText.textContent = "Scanned QR Code: " encryptedText;

          try {
            const plainText = await decrypt(encryptedText, password);
            decrypted.textContent = "We decrypted the value and it is: " + plainText;
          } catch (decryptionError) {
            decrypted.textContent = "Failed to decrypt: " + decryptionError.message;
          }

          controls.stop();
          videoElement.srcObject = null;
          videoElement.style.display = "none";
        }
      }
    );

    videoElement.style.display = "block";
  } catch (err) {
    alert("Camera error: " + err.message);
  }
};
