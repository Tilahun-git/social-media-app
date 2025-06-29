import express from 'express'
import User from "../models/User.js";
const userRouter = express.Router();
userRouter.post("/register", async (req, res) => {
  try {
    const user = await User.create(req.body);
    res.json(user);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

userRouter.post("/login", async (req, res) => {
  const { username, password } = req.body;
  const user = await User.findOne({ username });
  if (!user || user.password !== password) {
    return res.status(401).json({ error: "Invalid credentials" });
  }
  res.json(user);
});

export default userRouter