// routes/posts.js
import express from "express";
import Post from "../models/Post.js";
import multer from "multer";
import path from "path";
import fs from "fs";

const postRouter = express.Router();

// Create uploads folder if it doesn't exist
const uploadDir = new URL("../uploads", import.meta.url);
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Setup multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.resolve("uploads")),
  filename: (req, file, cb) =>
    cb(null, Date.now() + path.extname(file.originalname)),
});

const upload = multer({ storage });

// Create post with image
postRouter.post("/", upload.single("image"), async (req, res) => {
  try {
    const post = await Post.create({
      author: req.body.author,
      content: req.body.content,
      image: req.file ? req.file.filename : null,
    });
    res.json(post);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

postRouter.get("/", async (req, res) => {
  const posts = await Post.find()
    .populate("author", "username")
    .sort({ createdAt: -1 });
  res.json(posts);
});

postRouter.put("/:id/like", async (req, res) => {
  const post = await Post.findById(req.params.id);
  post.likes.push(req.body.userId);
  await post.save();
  res.json(post);
});

export default postRouter;
