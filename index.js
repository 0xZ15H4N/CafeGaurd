import express from "express"
import cors from "cors"
import singleRoutes from "./routes/singleRoutes.routes.js"
import path from "path";
import fs from "fs"

import { fileURLToPath } from "url";

// Emulate __dirname in ES module scope
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
console.log(__dirname,__filename)
const app = express();
app.use(cors());  
app.use(express.json({limit:"16kb"}));
app.use(express.urlencoded({extended:true,limit:"16kb"}));
app.use(express.static("./dist"));


app.use("/",singleRoutes)

app.get('/show-QrCode', (req, res) => {
    const ip = (req.socket.remoteAddress || "")
        .replace("::ffff:", "")
        .replace("::1", "127.0.0.1");
    console.log("ip_address recieved : ",ip)
    const filename = `${ip.replaceAll(".", "")}.png`;
    const filePath = path.resolve("public", filename);
    console.log("file created @ ", filePath)
    if (fs.existsSync(filePath)) {
        res.send(`
        <html>
        <body style="margin: 0; padding: 0; background: #f2f2f2; font-family: Arial, sans-serif; display: flex; justify-content: center; align-items: center; height: 100vh;">
          <div style="text-align: center; background: white; padding: 30px; border-radius: 12px; box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);">
            <h2 style="color: #333; margin-bottom: 20px;">Scan Your QR</h2>
            <img src="${filename}" alt="QR Code" style="width: 500px; height: 500px;" />
          </div>
        </body>
      </html>
        `);
    } else {
        res.status(404).send("QR Code not found");
    }
});
app.listen(4443,()=>{
    console.log("listening on http://localhost:4443/");
})
