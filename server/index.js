import express from "express";
import cors from "cors";
import LLMRoutes from "./routes/LLM.js";
import AuthRoutes from "./routes/Authentication.js";
import operationRoutes from "./routes/Operations.js";

import dotenv from "dotenv";
dotenv.config({ path: "./.env" });

const app = express();

// Middleware
app.use(
  cors({
    origin: "*",
    methods: "GET,POST,PUT,DELETE,OPTIONS",
    allowedHeaders: "Content-Type,Authorization",
  })
);
app.use(express.json());
app.use("/LLMQuery", LLMRoutes);
app.use("/Auth", AuthRoutes);
app.use("/operation", operationRoutes);


app.get("/", (req, res) => {
  res.json({ message: "Here is your server" });
});




// Start Server
app.listen(process.env.VITE_LOCAL_HOST_PORT, () =>
  console.log(
    `Server running on ${process.env.VITE_LOCAL_HOST}:${process.env.VITE_LOCAL_HOST_PORT}`
  )
);
