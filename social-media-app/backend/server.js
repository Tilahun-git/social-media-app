import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";

import userRouter from "./routes/auth.js";
import postRouter from "./routes/posts.js";
import commentRouter from "./routes/comments.js";
import followRouter from "./routes/follows.js";

// Load environment variables
dotenv.config();

const app = express();

// CORS configuration
app.use(
  cors({
<<<<<<< HEAD
    origin: "https://social-media-app-6-ls9a.onrender.com", // For production, replace "*" with your frontend URL, e.g. "https://your-frontend.onrender.com"
=======
    origin: "https://social-media-app-6-ls9a.onrender.com",
>>>>>>> 211b727 (follow)
  })
);

app.use(express.json());

// Serve uploaded images statically
app.use("/uploads", express.static("uploads"));

// Simple root endpoint
app.get("/", (req, res) => {
  res.send("You are live");
});

// Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => console.error("❌ MongoDB Connection Error:", err));

// API Routes
app.use("/api/auth", userRouter);
app.use("/api/posts", postRouter);
app.use("/api/comments", commentRouter);
app.use("/api/follows", followRouter);

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
