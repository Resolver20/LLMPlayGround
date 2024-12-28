import express from "express";
import jwt from "jsonwebtoken";
import {  DataFlow } from "../Mongoose/dbDetails.js";

import dotenv from "dotenv";
dotenv.config({ path: "./.env" });

const operationRoutes = express.Router();

operationRoutes.post("/deleteData", async (req, res) => {
  const { token, title } = req.body;
  console.log(token);
  if (token) {
    const decoded = jwt.decode(token, { complete: true });
    const userId = decoded.payload.user_id;
    const value = await DataFlow.deleteOne({ userId: userId, title: title });
    console.log(value);

    res.json({ message: "Successfully Deleted" });
  } else {
    res.json({
      message: "error",
    });
  }
});

operationRoutes.post("/getSaved", async (req, res) => {
  const { token } = req.body;
  console.log(token);
  if (token) {
    const decoded = jwt.decode(token, { complete: true });
    const userId = decoded.payload.user_id;
    console.log("userId", userId);
    const data = await DataFlow.find(
      { userId: userId },
      { title: 1, data: 1, _id: 1 }
    ).sort({ updatedAt: -1 });
    res.json({ message: data });
  } else {
    res.json({
      message: "error",
    });
  }
});

operationRoutes.post("/save", async (req, res) => {
  const { token, data, title, id } = req.body;
  console.log(" data from request => ", id);
  const decoded = jwt.decode(token, { complete: true });
  const userId = decoded.payload.user_id;
  let data_id = id;

  try {
    const verification = jwt.verify(token, process.env.VITE_JWT_SECRET_KEY, {
      algorithms: ["HS256"],
    });
    console.log("verification", verification);
  } catch (error) {
    console.log(error);
  }

  if (id == -1) {
    const df = new DataFlow({ userId: userId, title: title, data: data });
    await df.save();
    data_id = df._id;
  } else {
    await DataFlow.updateOne(
      { _id: id },
      { $set: { data: data, title: title } }
    ).exec();
    console.log("Updated");
  }

  res.json({
    message: "Data saved successfully!",
    _id: data_id,
  });
});

export default operationRoutes;