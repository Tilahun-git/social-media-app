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

// Get number of followers for a user
FollowRouter.get("/followers/:userId", async (req, res) => {
  const { userId } = req.params;
  try {
    const count = await Follow.countDocuments({ following: userId });
    res.json({ followersCount: count });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Get number of users a user is following
FollowRouter.get("/following/:userId", async (req, res) => {
  const { userId } = req.params;
  try {
    const count = await Follow.countDocuments({ follower: userId });
    res.json({ followingCount: count });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

async function getFollowerCount(userId) {
  try {
    const res = await fetch(`${API}/follow/followers/${userId}`);
    if (!res.ok) throw new Error("Failed to fetch follower count");
    const data = await res.json();
    return data.followersCount || 0;
  } catch (err) {
    console.error(err);
    return 0;
  }
}

export default FollowRouter;
