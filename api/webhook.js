// webhook.js
import menuData from "./menuData.js";
import stringSimilarity from "string-similarity";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  try {
    const message = req.body?.message;
    if (!message || typeof message !== "string") {
      return res.status(400).json({ error: "Mensaje inválido" });
    }

    const lowerMsg = message.toLowerCase();

    // Si alguien pide una pizzanesa
    if (lowerMsg.includes("pizzanesa")) {
      return res.status(200).json({
        reply:
          "Perfecto, anotamos la pizzanesa. ¿Con qué gusto la querés? (sola, napolitana, fugazzeta, roquefort...) ¿De carne o de pollo?",
      });
    }

    // Buscar coincidencia exacta en pizzas
    for (const pizza of menuData.pizzas) {
      if (lowerMsg.includes(pizza.nombre.toLowerCase())) {
        let respuesta = `La pizza ${pizza.nombre} cuesta:\n`;
        for (const [tamaño, precio] of Object.entries(pizza.tamaños)) {
          respuesta += `• ${tamaño.charAt(0).toUpperCase() + tamaño.slice(1)}: $${precio}\n`;
        }
        return res.status(200).json({ reply: respuesta });
      }
    }

    // Reglas para productos que pueden ser pizza o milanesa
    const gustosDobleSentido = ["napolitana", "fugazzeta", "roquefort", "3 quesos", "4 quesos", "choclo"];
    const matchDoble = stringSimilarity.findBestMatch(lowerMsg, gustosDobleSentido).bestMatch;
    if (matchDoble.rating > 0.8) {
      return res.status(200).json({
        reply: `¿Te referís a una pizza *${matchDoble.target}* o a una milanesa *${matchDoble.target}*?`,
      });
    }

    // Buscar producto por similitud
    const nombres = menuData.productos.map(p => p.nombre.toLowerCase());
    const best = stringSimilarity.findBestMatch(lowerMsg, nombres).bestMatch;
    if (best.rating > 0.8) {
      const producto = menuData.productos.find(p => p.nombre.toLowerCase() === best.target);
      return res.status(200).json({
        reply: `${producto.nombre}: ${producto.descripcion}`,
      });
    }

    // Buscar en milanesas
    for (const mila of menuData.milanesas) {
      if (lowerMsg.includes(mila.nombre.toLowerCase())) {
        let respuesta = `¿Querés la milanesa ${mila.nombre} de carne o de pollo?\nPrecios:\n`;
        for (const [tamaño, precio] of Object.entries(mila.precios)) {
          respuesta += `• ${tamaño.charAt(0).toUpperCase() + tamaño.slice(1)}: $${precio}\n`;
        }
        return res.status(200).json({ reply: respuesta });
      }
    }

    // Si no encontró nada
    return res.status(200).json({
      reply: "No encontré ese producto en el menú. Podés escribir por ejemplo: ¿Cuánto está la napolitana?",
    });

  } catch (error) {
    console.error("Error en el webhook:", error);
    return res.status(500).json({ error: "Error interno del servidor" });
  }
}
