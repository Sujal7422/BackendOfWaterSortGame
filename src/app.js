import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser"


const app = express();
app.use(cors({
  origin:process.env.CORS_ORIGIN,
  credentials:true
}));

app.use(express.json({limit:"16kb"}))

app.use(express.urlencoded({extended:true,limit:"16kb"}))

app.use(express.static("public"))

app.use(cookieParser())

import userRouter from "./routes/user.routes.js";
import levelRouter from "./routes/level.routes.js";

app.use("/api/user", userRouter);
app.use("/api/level", levelRouter);

app.get("/", (req, res) => {
  res.send("API is working");
});


export { app }