import { OpenAI } from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).send('Método no permitido');
  }

  const userMessage = req.body.Body?.trim() || "Hola";

  try {
    const completion = await openai.chat.completions.create({
      messages: [
        {
          role: "system",
          content: `Sos el asistente de una pizzería real llamada Knockout. Respondé con cordialidad pero sin pasarte de simpático. Si alguien dice "napolitana", preguntá si es pizza o milanesa. Si es milanesa, preguntá si es de carne o pollo. Mostrá siempre los precios y tamaños de milanesas y pizzas. No digas "hola" varias veces. No pongas caritas ni emojis todo el tiempo. No repitas cosas que ya se dijeron.`
        },
        {
          role: "user",
          content: userMessage
        }
      ],
      model: "gpt-4",
      temperature: 0.4,
    });

    const respuesta = completion.choices[0].message.content;

    return res
      .status(200)
      .send(`<Response><Message>${respuesta}</Message></Response>`);
  } catch (error) {
    console.error("Error en OpenAI:", error);
    return res
      .status(500)
      .send("<Response><Message>Hubo un error interno. Probá de nuevo en unos segundos.</Message></Response>");
  }
}
