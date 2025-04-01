export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { message } = req.body;

    const reply = await getChatGPTReply(message);
    return res.status(200).json({ reply });
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({ error: "Error interno del servidor" });
  }
}

async function getChatGPTReply(userMessage) {
  const apiKey = process.env.OPENAI_API_KEY;

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: userMessage }],
    }),
  });

  const data = await response.json();
  if (data.error) {
    throw new Error(data.error.message);
  }

  return data.choices[0].message.content;
}
