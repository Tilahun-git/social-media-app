import express from 'express'
import Follow from "../models/Follow.js";
const FollowRouter = express.Router();
FollowRouter.post("/", async (req, res) => {
  try {
    const follow = await Follow.create(req.body);
    res.json(follow);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

export default FollowRouter