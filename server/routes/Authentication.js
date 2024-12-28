import express from "express";
import { User } from "../Mongoose/dbDetails.js";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

dotenv.config({ path: "./.env" });

const AuthRoutes = express.Router();

AuthRoutes.post("/signup", async (req, res) => {
  const { username, password } = req.body;
  const isExisting = await User.find({ username: username });
  if (isExisting != 0) {
    res.json({ message: "User already Exists !!", id: -1 });
    return;
  }
  const hashedPassword = await bcrypt.hash(password, 10);
  const newUser = new User({ username, password: hashedPassword });
  await newUser.save();
  console.log("Hello");

  res.json({
    message: "User created successfully!",
    id: User.findOne({ username })._id,
  });
});

AuthRoutes.post("/login", async (req, res) => {
  console.log("Entered into login");

  const { username, password } = req.body;
  const user = await User.findOne({ username });
  if (!user) return res.status(404).json({ error: "User not found" });

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) return res.status(401).json({ error: "Invalid credentials" });

  const jwt_secret = process.env.VITE_JWT_SECRET_KEY;
  const token = jwt.sign({ user_id: user._id }, jwt_secret, {
    expiresIn: "365d",
  });

  res.json({ message: "Login successful", token });
});

export default AuthRoutes;