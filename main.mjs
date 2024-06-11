import {fileURLToPath} from "url";
import path from "path";
import dotenv from "dotenv";
import express from "express";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.static(path.join(__dirname, "ui")));

app.get('*', (req, res) => {
    res.sendFile(__dirname + '/ui/index.html');
});

app.listen(process.env.PORT || 3001, () => {
    console.log(`Server running on port http://localhost:${process.env.PORT || 3001}/`);
});