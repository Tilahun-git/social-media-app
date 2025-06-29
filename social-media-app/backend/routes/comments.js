import express from "express";
import Comment from "../models/Comment.js";

const commentRouter = express.Router();

// Add new comment
commentRouter.post("/", async (req, res) => {
  try {
    const comment = await Comment.create(req.body);
    res.json(comment);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Get comments for a specific post
commentRouter.get("/post/:postId", async (req, res) => {
  try {
    const comments = await Comment.find({ post: req.params.postId })
      .populate("author", "username")
      .sort({ createdAt: 1 }); // optional: oldest first
    res.json(comments);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default commentRouter;
