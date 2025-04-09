// webhook.js

import { OpenAI } from 'openai';
import menuData from './menuData.js';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).send('Only POST requests allowed');

  const incomingMsg = req.body.Body?.trim().toLowerCase() || '';
  const replyParts = [];

  // Función para detectar productos ambiguos (pizza o milanesa)
  function esGustoAmbiguo(texto) {
    const ambiguos = ["napolitana", "fugazzeta", "roquefort", "primavera", "rúcula", "tres quesos", "3 quesos", "cuatro quesos", "4 quesos", "jamón", "jamón y morrón"];
    return ambiguos.some(g => texto.includes(g));
  }

  // Detectar saludo inicial
  if (["hola", "buenas", "buenas tardes", "buenas noches", "buenos días"].includes(incomingMsg)) {
    return res.status(200).send(`<Response><Message>Hola. ¿En qué puedo ayudarte hoy en la pizzería Knockout?</Message></Response>`);
  }

  // Si el usuario menciona un gusto ambiguo sin aclarar categoría
  if (esGustoAmbiguo(incomingMsg)) {
    return res.status(200).send(`<Response><Message>¿Estás hablando de pizza o de milanesa?</Message></Response>`);
  }

  // Si menciona milanesa sola
  if (incomingMsg.includes('milanesa')) {
    const gustoDetectado = Object.keys(menuData.milanesas).find(g => incomingMsg.includes(g.toLowerCase()));

    if (gustoDetectado) {
      const precios = menuData.milanesas[gustoDetectado];
      const preciosTexto = `• Chica: $${precios.chica}\n• Mediana: $${precios.mediana}\n• Grande: $${precios.grande}`;

      return res.status(200).send(`<Response><Message>Perfecto. Milanesa ${gustoDetectado}. ¿Qué tamaño preferís?\n${preciosTexto}</Message></Response>`);
    }

    // Si no detecta gusto
    return res.status(200).send(`<Response><Message>¿Qué gusto de milanesa querés? Por ejemplo: Napolitana, Roquefort, Fugazzeta...</Message></Response>`);
  }

  // Si ya mencionó gusto y tamaño, falta carne o pollo
  if (incomingMsg.includes('chica') || incomingMsg.includes('mediana') || incomingMsg.includes('grande')) {
    if (incomingMsg.includes('milanesa')) {
      return res.status(200).send(`<Response><Message>¿La milanesa es de carne o de pollo?</Message></Response>`);
    }
  }

  // Si menciona gusto + tamaño + tipo (carne/pollo)
  if (incomingMsg.includes('carne') || incomingMsg.includes('pollo')) {
    if (incomingMsg.includes('milanesa')) {
      return res.status(200).send(`<Response><Message>Genial. Anotado. ¿Querés agregar algo más al pedido?</Message></Response>`);
    }
  }

  // Fallback
  const aiResponse = await openai.chat.completions.create({
    model: 'gpt-3.5-turbo',
    messages: [
      { role: 'system', content: 'Sos una inteligencia artificial que atiende pedidos en la pizzería Knockout. Respondé breve, claro, sin repetir saludos ni emojis. Si te piden una napolitana, preguntá si es pizza o milanesa. Si es milanesa, preguntá tamaño y si es de carne o pollo.' },
      { role: 'user', content: incomingMsg },
    ],
  });

  const respuesta = aiResponse.choices[0].message.content;
  res.status(200).send(`<Response><Message>${respuesta}</Message></Response>`);
}
