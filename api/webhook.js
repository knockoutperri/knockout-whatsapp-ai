// webhook.js
import { menuData } from './menuData.js';
import { OpenAI } from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const imagenMenuPizzas = "https://i.imgur.com/YxDHo49.jpeg";
const imagenMenuMilanesas = "https://i.imgur.com/bPFMK3o.jpeg";

export default async function handler(req, res) {
  const incomingMsg = req.body.Body?.toLowerCase() || "";
  let reply = "";

  // Saludo con hora local Argentina
  const ahora = new Date().toLocaleString("en-US", { timeZone: "America/Argentina/Buenos_Aires", hour: "numeric", hour12: false });
  const hora = parseInt(ahora);
  if (incomingMsg === "hola") {
    if (hora >= 1 && hora < 13) reply = "Hola, buen día. ¿En qué puedo ayudarte hoy?";
    else if (hora >= 13 && hora < 20) reply = "Hola, buenas tardes. ¿En qué puedo ayudarte hoy?";
    else reply = "Hola, buenas noches. ¿En qué puedo ayudarte hoy?";
    return res.status(200).send(`<Response><Message>${reply}</Message></Response>`);
  }

  // Mostrar menú si lo pide
  if (incomingMsg.includes("ver el menu") || incomingMsg.includes("pasas el menu") || incomingMsg.includes("precios")) {
    reply = "Asistente: ¡Hola! Por supuesto, aquí te dejo las imágenes de nuestro menú. ¡Espero que encuentres algo que te guste!";
    reply += `\n${imagenMenuPizzas}`;
    reply += `\n${imagenMenuMilanesas}`;
    return res.status(200).send(`<Response><Message>${reply}</Message></Response>`);
  }

  // Buscar precios de pizza específica
  const gustosPizza = Object.keys(menuData.pizzas || {});
  const gustoDetectado = gustosPizza.find(g => incomingMsg.includes(g.toLowerCase()));
  if (gustoDetectado) {
    const precios = menuData.pizzas[gustoDetectado];
    reply = `Precios de ${gustoDetectado}:\nChica: $${precios.chica}\nGrande: $${precios.grande}\nGigante: $${precios.gigante}`;
    return res.status(200).send(`<Response><Message>${reply}</Message></Response>`);
  }

  // Respuesta por defecto
  reply = "Perdoná, no entendí bien. ¿Querés ver el menú o saber el precio de algo?";
  return res.status(200).send(`<Response><Message>${reply}</Message></Response>`);
}
