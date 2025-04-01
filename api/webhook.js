import { Configuration, OpenAIApi } from "openai";

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Only POST method is allowed" });
  }

  const { message } = req.body;

  try {
    const completion = await openai.createChatCompletion({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "Sos la inteligencia artificial de una pizzería llamada Knockout. Tenés que responder con calidez, claridad y ayudar a tomar pedidos, responder dudas sobre el menú y ofrecer sugerencias.",
        },
        {
          role: "user",
          content: message,
        },
      ],
    });

    const reply = completion.data.choices[0].message.content;
    return res.status(200).json({ reply });
  } catch (error) {
    console.error("OpenAI Error:", error);
    return res.status(500).json({ error: "Error procesando la solicitud." });
  }
}
