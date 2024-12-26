const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const cors = require("cors");
const Groq = require("groq-sdk");




require("dotenv").config({ path: "./.env" });

const app = express();
const ObjectId=mongoose.Types.ObjectId;


// Middleware
app.use(
  cors({
    origin: "*", // Allow all origins
    methods: "GET,POST,PUT,DELETE,OPTIONS",
    allowedHeaders: "Content-Type,Authorization",
  })
);
app.use(express.json());


mongoose.connect(process.env.VITE_MONGO_DB_CONNECTION);

const UserSchema = new mongoose.Schema({
  username: String,
  password: String,
});

const DataFlowSchema = new mongoose.Schema(
  {
    userId: String,
    title: String,
    data: String,
  },
  { timestamps: true }
);

const User = mongoose.model("User", UserSchema);
const DataFlow = mongoose.model("DataFlow", DataFlowSchema);

async function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms)); // Returns a promise that resolves after 'ms' milliseconds
}

//Servers
app.get("/", (req, res) => {
  res.json({ message: "Here is your server" });
});


app.post("/queryGrok",async(req,res)=>{
  const {token,query_data}=req.body;
  console.log(query_data);
  const groq = new Groq({ apiKey: process.env.VITE_GROQ_API_KEY });
  const chatCompletion = await groq.chat.completions.create({ messages: [{role:"user",content:query_data}], model: "llama-3.1-70b-versatile", temperature: 1, max_tokens: 1024, top_p: 1, stream: true, stop: null, });
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  for await (const chunk of chatCompletion) {

    if(chunk.choices[0].delta.role=="assistant" ){
      continue;
    }
    else if(chunk.choices[0].finish_reason==null){
        console.log(chunk);
        const chunk_data = chunk.choices[0].delta.content;
        res.write(chunk_data);
        await delay(40);
    }
    else {
      console.log(chunk);
      const reason =chunk.choices[0].finish_reason;
      if(reason=="stop"){continue;}
      else{res.write(` ### Ended abruptly cause of REASON : ${reason} ###` );break;}
    }
    
  }
  res.end();

});


app.post("/queryLocalLLM",async(req,res)=>{
  const {token,query_data}=req.body;

  const local_url = process.env.VITE_LOCAL_OLLAMA_HOST; 
  console.log(local_url);
  const local_headers = { "Content-Type": "application/json" };
  const local_body = JSON.stringify({ model: "llama3.1", prompt: `${query_data}` });

  try {
    const response = await fetch(local_url, {
      method: "POST",
      headers: local_headers,
      body: local_body,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let done = false;

    console.log("Streaming response:");
    while (!done) {
      const { value, done: readerDone } = await reader.read();
      done = readerDone;

      if (value) {
        const decoded_data = decoder.decode(value, { stream: true });
        const chunk = JSON.parse(decoded_data).response;
        res.write(chunk); 
      }
    }
    

    console.log("Streaming complete.");
  } catch (error) {
    console.error("Error while fetching from Ollama:", error);
  }
  res.end();

});





app.post("/deleteData", async (req, res) => {
  const { token,title } = req.body;
  console.log(token);
  if (token) {
    const decoded = jwt.decode(token, { complete: true });
    const userId = decoded.payload.user_id;
    const value=await DataFlow.deleteOne({userId:userId,title:title});
    console.log(value);

    res.json({ message: "Successfully Deleted" });
  } else {
    res.json({
      message: "error",
    });
  }
});


app.post("/getSaved",async (req,res)=>{
  const { token} = req.body;
  console.log(token);
  if(token){
    const decoded = jwt.decode(token, { complete: true });
    const userId = decoded.payload.user_id;
    console.log("userId", userId);
    const data = await DataFlow.find( { userId: userId }, { title: 1, data: 1, _id: 1 } ).sort({ updatedAt: -1 }); 
    res.json({ message: data });
  }
  else{

    res.json({
      message: "error",
    });
  }
})

app.post("/save",async (req,res)=>{
  const { token, data ,title ,id} = req.body;
  console.log(" data from request => ",id);
  const decoded = jwt.decode(token, { complete: true }); 
  const userId=decoded.payload.user_id;
  let data_id=id;

  try {
    const verification = jwt.verify(token, process.env.VITE_JWT_SECRET_KEY, {
      algorithms: ["HS256"],
    });
    console.log("verification", verification);
  } catch (error) {
    console.log(error);
  }

  
  const isExisting = await DataFlow.find({ userId: userId, title:title });

  if(id==-1){
    const df = new DataFlow({userId:userId,title:title,data:data});
    await df.save();
    data_id=df._id;
  }
  else{
    await DataFlow.updateOne( {_id:id }, { $set: { data: data,title:title } } ).exec();
    console.log("Updated");

  }
  console.log("isExisting=>", isExisting.length );



  res.json({
    message: "Data saved successfully!",
    _id:data_id
  });
})



app.post("/signup", async (req, res) => {
  const { username , password } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);

  const newUser = new User({ username , password: hashedPassword });
  await newUser.save();
  console.log("Hello");

  res.json({ message: "User created successfully!", id:User.findOne({username})._id});
});


app.post("/login", async (req, res) => {

  console.log("Entered into login");

  const { username, password } = req.body;
  const user = await User.findOne({ username });
  if (!user) return res.status(404).json({ error: "User not found" });

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) return res.status(401).json({ error: "Invalid credentials" });
  
  const jwt_secret = process.env.VITE_JWT_SECRET_KEY;
  const token = jwt.sign({ "user_id" : user._id}, jwt_secret, { expiresIn: "365d" });

  res.json({ message: "Login successful", token });
});

// Start Server
app.listen(process.env.VITE_LOCAL_HOST_PORT, () =>
  console.log(
    `Server running on ${process.env.VITE_LOCAL_HOST}:${process.env.VITE_LOCAL_HOST_PORT}`
  )
);
