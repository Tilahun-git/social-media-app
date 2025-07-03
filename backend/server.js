import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import http from "http";

import userRouter from "./routes/auth.js";
import postRouter from "./routes/posts.js";
import commentRouter from "./routes/comments.js";
import FollowRouter from "./routes/follows.js";
import { Server } from "socket.io";

dotenv.config();

const app = express();

app.use(
  cors({
    origin: "https://social-media-apps.onrender.com",
  })
);

app.use(express.json());
app.use("/uploads", express.static("uploads"));

app.get("/", (req, res) => {
  res.send("You are live");
});

const server = http.createServer(app);

const io = new Server(server, {
  cors: { origin: "*" },
});

io.on("connection", (socket) => {
  console.log("User connected", socket.id);

  socket.on("newMessage", (message) => {
    io.emit("messageReceived", message);
  });

  socket.on("disconnect", () => {
    console.log("User disconnected", socket.id);
  });
});

mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => console.error("❌ MongoDB Connection Error:", err));

app.use("/api/auth", userRouter);
app.use("/api/posts", postRouter);
app.use("/api/comments", commentRouter);
app.use("/api/follow", FollowRouter);

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
