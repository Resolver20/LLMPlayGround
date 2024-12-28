import express from "express";
import Groq  from "groq-sdk";
import dotenv from "dotenv";
dotenv.config({ path: "../.env" });


const  LLMRoutes = express.Router();


async function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms)); // Returns a promise that resolves after 'ms' milliseconds
}

LLMRoutes.post("/Groq", async (req, res) => {
  const { token, query_data } = req.body;
  console.log(query_data);
  const groq = new Groq({ apiKey: process.env.VITE_GROQ_API_KEY });
  const chatCompletion = await groq.chat.completions.create({
    messages: [{ role: "user", content: query_data }],
    model: "llama-3.1-70b-versatile",
    temperature: 1,
    max_tokens: 1024,
    top_p: 1,
    stream: true,
    stop: null,
  });
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  for await (const chunk of chatCompletion) {
    if (chunk.choices[0].delta.role == "assistant") {
      continue;
    } else if (chunk.choices[0].finish_reason == null) {
      console.log(chunk);
      const chunk_data = chunk.choices[0].delta.content;
      res.write(chunk_data);
      await delay(40);
    } else {
      console.log(chunk);
      const reason = chunk.choices[0].finish_reason;
      if (reason == "stop") {
        continue;
      } else {
        res.write(` ### Ended abruptly cause of REASON : ${reason} ###`);
        break;
      }
    }
  }
  res.end();
});

LLMRoutes.post("/LocalLLM", async (req, res) => {
  const { token, query_data } = req.body;

  const local_url = process.env.VITE_LOCAL_OLLAMA_HOST;
  console.log(local_url);
  const local_headers = { "Content-Type": "application/json" };
  const local_body = JSON.stringify({
    model: "llama3.1",
    prompt: `${query_data}`,
  });

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

export default LLMRoutes;