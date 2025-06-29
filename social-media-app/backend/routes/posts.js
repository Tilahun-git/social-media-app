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

// ✅ Create post with optional image
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

// ✅ Get all posts
postRouter.get("/", async (req, res) => {
  try {
    const posts = await Post.find()
      .populate("author", "username")
      .sort({ createdAt: -1 });
    res.json(posts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ Like/Dislike toggle
postRouter.put("/:id/like", async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    const userId = req.body.userId;

    if (!post.likes.includes(userId)) {
      post.likes.push(userId); // Like
    } else {
      post.likes = post.likes.filter((id) => id !== userId); // Dislike (remove like)
    }

    await post.save();
    res.json(post);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// ✅ Delete post
postRouter.delete("/:id", async (req, res) => {
  try {
    const post = await Post.findByIdAndDelete(req.params.id);
    if (!post) return res.status(404).json({ error: "Post not found" });

    // Delete associated image from uploads (if exists)
    if (post.image) {
      const imagePath = path.resolve("uploads", post.image);
      fs.unlink(imagePath, (err) => {
        if (err) console.warn("Image delete failed:", err.message);
      });
    }

    res.json({ message: "Post deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default postRouter;
