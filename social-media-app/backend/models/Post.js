// models/Post.js
import mongoose from "mongoose";

const postSchema = new mongoose.Schema({
  author: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  content: String,
  image: String, // NEW
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("Post", postSchema);
