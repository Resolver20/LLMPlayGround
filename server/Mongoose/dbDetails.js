
import mongoose from "mongoose";
import express from "express";
import dotenv from "dotenv";
dotenv.config({ path: "./.env" });



mongoose.connect(process.env.VITE_MONGO_DB_CONNECTION);


// export const ObjectId = mongoose.Types.ObjectId;

export const UserSchema = new mongoose.Schema({
  username: String,
  password: String,
});

export const DataFlowSchema = new mongoose.Schema(
  {
    userId: String,
    title: String,
    data: String,
  },
  { timestamps: true }
);

export const User = mongoose.model("User", UserSchema);
export const DataFlow = mongoose.model("DataFlow", DataFlowSchema);
