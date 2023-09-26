import express from "express";
import ViteExpress from "vite-express";
import * as fs from 'fs';
import jsPDF from "jspdf";
import * as dotenv from "dotenv"

type ValidEnding = "B"|"KB"|"MB"|"GB"|"TB"|"PB"
const endings = {
  "B": 0,
  "KB": 3,
  "MB": 6,
  "GB": 9,
  "TB": 12,
  "PB": 15
}

function getBytes() {
  const byteString = process.env.CAPACITY as string
  const groups = byteString.match(/([0-9]+)([A-Z]*)/)
  if (groups === null || groups.length < 3) {
    return 0
  }
  const ending = groups[2] as ValidEnding
  return Math.pow(10, endings[ending]) * (groups[1] as any as number)
}

function logIfNotFull() {
  const path = process.env.VITE_HASH as string
  if (!fs.existsSync(path)) {
    fs.mkdirSync(path)
  }
  const files = fs.readdirSync(path)
  let totalSize = 0
  files.forEach(function(file) {
    totalSize += fs.statSync(path + "/" + file).size
  })
  const newFile = path + "/" + Math.random() + ".pdf" 
  
  if (totalSize < getBytes()) {
    const doc = new jsPDF();

    doc.text("Hello world!", 10, 10);
    doc.save(newFile);
  }
  
  return totalSize

}

const app = express();
app.use(express.json()); // <--- Here
app.use(express.urlencoded({extended: true}));
dotenv.config()
app.post("/calc", function(req, res) {
  const size = logIfNotFull()
  res.send("size:" + req.body.num1)
});

app.get("/log", (_, res) => {
  res.send(res.json.toString())
})

ViteExpress.listen(app, 5000, () =>
  console.log("Server is listening on port 3000...")
);
