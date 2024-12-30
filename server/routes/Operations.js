import express from "express";
import jwt from "jsonwebtoken";
import {  DataFlow } from "../Mongoose/dbDetails.js";
import { TokenAuthentication } from "./Authentication.js";
import dotenv from "dotenv";
dotenv.config({ path: "./.env" });

const operationRoutes = express.Router();

operationRoutes.post("/deleteData", async (req, res) => {
  const { token, title } = req.body;
  
  const status = TokenAuthentication(token);
  if (status != "verified") { console.log(status); res.json({ message: "Token Authentication Failed", failure: true }); return; }

  const decoded = jwt.decode(token, { complete: true });
  const userId = decoded.payload.user_id;
  const value = await DataFlow.deleteOne({ userId: userId, title: title });

  res.json({ message: "Successfully Deleted" });

});

operationRoutes.post("/getSaved", async (req, res) => {
  const { token } = req.body;


  const status = TokenAuthentication(token);
  if (status != "verified") { console.log(status); res.json({ message: "Token Authentication Failed", failure: true }); return; }

  const decoded = jwt.decode(token, { complete: true });
  const userId = decoded.payload.user_id;
  console.log("userId", userId);
  const data = await DataFlow.find(
    { userId: userId },
    { title: 1, data: 1, _id: 1 }
  ).sort({ updatedAt: -1 });
  res.json({ message: data });

});

operationRoutes.post("/save", async (req, res) => {
  const { token, data, title, id } = req.body;

  const status = TokenAuthentication(token);
  if (status != "verified") { console.log(status); res.json({ message: "Token Authentication Failed",failure:true }); return; }

  const decoded = jwt.decode(token, { complete: true });
  const userId = decoded.payload.user_id;
  let data_id = id;

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
    failure:false,
  });
});

export default operationRoutes;