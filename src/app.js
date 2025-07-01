import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv"; // ✅ Load env variables

dotenv.config(); // ✅ Call dotenv to load .env

const app = express();

// ✅ CORS setup for multiple origins (localhost and Vercel frontend)
app.use(cors({
  origin: process.env.CORS_ORIGIN?.split(","), // allow multiple origins
  credentials: true
}));

// ✅ Middleware setup
app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"));
app.use(cookieParser());

// ✅ Routes
import userRouter from "./routes/user.routes.js";
import levelRouter from "./routes/level.routes.js";

app.use("/api/user", userRouter);
app.use("/api/level", levelRouter);

// ✅ Test Route
app.get("/", (req, res) => {
  res.send("API is working");
});

export { app };
