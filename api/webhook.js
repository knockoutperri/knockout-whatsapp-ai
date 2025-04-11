// webhook.js actualizado con detección generalizada entre pizza y milanesa

import { OpenAI } from "openai";
import menuData from "./menuData.js";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const productosDudosos = [
  "napolitana",
  "roquefort",
  "fugazzeta",
  "jamón y morrón",
  "rúcula y parmesano",
  "3 quesos",
  "4 quesos"
];

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).send("Method Not Allowed");
  }

  const incomingMsg = req.body.Body?.toLowerCase().trim();

  // Detecta si es un saludo básico
  if (["hola", "buenas", "holaa", "buenas noches", "buenas tardes"].includes(incomingMsg)) {
    return res.status(200).send(`<Response><Message>Hola, ¿en qué puedo ayudarte hoy en la pizzería Knockout?</Message></Response>`);
  }

  // Si el mensaje menciona solo un producto dudoso, preguntar pizza o milanesa
  for (const prod of productosDudosos) {
    if (incomingMsg.includes(prod) && !incomingMsg.includes("pizza") && !incomingMsg.includes("milanesa")) {
      return res.status(200).send(`<Response><Message>¿Te referís a una pizza ${prod} o una milanesa ${prod}?</Message></Response>`);
    }
  }

  // Si el mensaje incluye "milanesa", pero no dice si es de carne o de pollo
  if (incomingMsg.includes("milanesa") && !incomingMsg.includes("carne") && !incomingMsg.includes("pollo")) {
    // Buscar si ya incluye el gusto (ej: napolitana, roquefort...)
    const gustoDetectado = productosDudosos.find(prod => incomingMsg.includes(prod));
    if (gustoDetectado) {
      return res.status(200).send(`<Response><Message>Perfecto. Milanesa ${gustoDetectado}. ¿La querés de carne o de pollo?</Message></Response>`);
    } else {
      return res.status(200).send(`<Response><Message>¿Qué gusto de milanesa querés? Tenemos muchas: Napolitana, Fugazzeta, Roquefort, etc.</Message></Response>`);
    }
  }

  // Ejemplo de respuesta general en caso de que no haya coincidencia
  const prompt = `Actuá como un asistente de una pizzería. Contestá de forma natural y clara, sin repetir saludos ni usar muchos emojis. Respondé esto: ${incomingMsg}`;

  const completion = await openai.chat.completions.create({
    messages: [{ role: "user", content: prompt }],
    model: "gpt-3.5-turbo"
  });

  const respuesta = completion.choices[0].message.content;

  return res.status(200).send(`<Response><Message>${respuesta}</Message></Response>`);
}
