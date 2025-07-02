import express from "express";
import Follow from "../models/Follow.js";

const FollowRouter = express.Router();

// ✅ Toggle follow/unfollow
FollowRouter.post("/", async (req, res) => {
  const { follower, following } = req.body;

  try {
    const existing = await Follow.findOne({ follower, following });

    if (existing) {
      await Follow.findByIdAndDelete(existing._id);
      return res.json({ message: "Unfollowed", unfollowed: true });
    } else {
      const follow = await Follow.create({ follower, following });
      return res.json({ message: "Followed", follow });
    }
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

export default FollowRouter;
