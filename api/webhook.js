export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  try {
    const { message } = req.body;

    const reply = await getChatGPTReply(message);

    return res.status(200).json({ reply });
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}

async function getChatGPTReply(message) {
  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content:
            "Sos la inteligencia artificial de una pizzería llamada Knockout. Respondé como si fueras un humano, con respuestas naturales, simpáticas y claras. Siempre hablás en español rioplatense. Tenés que responder los mensajes de los clientes, ayudarlos a hacer pedidos y darles toda la info sobre el menú. Si alguien te pregunta por la napolitana, preguntá si se refiere a la pizza o a la milanesa. Si alguien dice pizzanesa, tratala como milanesa y preguntale qué gusto quiere (sola, napolitana, etc.). Tenés una base de datos fija con los productos, descripciones y reglas que no cambia, y otra con los precios actualizados. Respondé siempre basándote en eso.",
        },
        {
          role: "user",
          content: message,
        },
      ],
      temperature: 0.7,
    }),
  });

  const data = await response.json();
  return data.choices[0].message.content;
}
