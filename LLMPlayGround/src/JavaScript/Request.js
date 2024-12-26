import { url } from "../App.jsx";

export async function fetch_LLama(event, data, streamEmitter, id, queryType) {
  const values = [];
  for (let i in data.input_data) {
    values.push(data.input_data[i]);
  }
  const query = values
    .map((elem) => {
      return elem.trim();
    })
    .join(" ");

  try {
    const response = await fetch(url + queryType, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        token: window.localStorage.getItem("access_token"),
        query_data: query,
      }),
    });
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    while (true) {
      const { value, done } = await reader.read();
      if (done) {
        break;
      }
      const chunk = decoder.decode(value, { stream: true });
      streamEmitter.emit("data", chunk);
    }
    streamEmitter.emit("end");
  } catch (err) {
    console.log(err);
  }
}
