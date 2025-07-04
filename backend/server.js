// Core & Third-party imports
import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import http from "http";
import path from "path";
import { fileURLToPath } from "url";
import { Server } from "socket.io";

// Route imports
import userRouter from "./routes/auth.js";
import postRouter from "./routes/posts.js";
import commentRouter from "./routes/comments.js";
import followRouter from "./routes/follows.js";

// Environment variables
dotenv.config();

// Setup __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create Express app and HTTP server
const app = express();
const server = http.createServer(app);

// CORS Configuration
const allowedOrigins = ["http://localhost:3000"];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true
}));

// Middleware
app.use(express.json());
app.use("/uploads", express.static("uploads")); // Serve uploaded files
app.use(express.static(path.join(__dirname, 'public'))); // Serve frontend

// API Routes
app.use("/api/auth", userRouter);
app.use("/api/posts", postRouter);
app.use("/api/comments", commentRouter);
app.use("/api/follow", followRouter);

// Basic test route
app.get("/", (req, res) => {
  res.send("✅ Backend is Live");
});

// Socket.IO setup
const io = new Server(server, {
  cors: {
    origin: "*", // Optional: restrict in production
    methods: ["GET", "POST"]
  }
});

io.on("connection", (socket) => {
  console.log("🟢 User connected:", socket.id);

  socket.on("newMessage", (message) => {
    io.emit("messageReceived", message);
  });

  socket.on("disconnect", () => {
    console.log("🔴 User disconnected:", socket.id);
  });
});

// MongoDB connection
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log("✅ MongoDB Connected"))
.catch((err) => console.error("❌ MongoDB Connection Error:", err));

// Start server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
