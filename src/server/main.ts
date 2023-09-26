import express from "express";
import ViteExpress from "vite-express";
import * as dotenv from "dotenv"


const app = express();
app.use(express.json()); // <--- Here
app.use(express.urlencoded({extended: true}));
dotenv.config()
app.post("/calc", function(req, res) {
  res.send("size:" + req.body)
});

app.get("/log", (_, res) => {
  res.send(res.json.toString())
})

ViteExpress.listen(app, 5000, () =>
  console.log("Server is listening on port 5000...")
);