// webhook.js
import menuData from "./menuData.js";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  try {
    const { message } = req.body;
    const lowerMsg = message.toLowerCase();

    // Buscar en pizzas
    for (const pizza of menuData.pizzas) {
      if (lowerMsg.includes(pizza.nombre.toLowerCase())) {
        let respuesta = `La pizza ${pizza.nombre} cuesta:\n`;
        for (const [tamano, precio] of Object.entries(pizza.tamaños)) {
          respuesta += `• ${tamano.charAt(0).toUpperCase() + tamano.slice(1)}: $${precio}\n`;
        }
        return res.status(200).json({ reply: respuesta });
      }
    }

    // Buscar en milanesas
    for (const mila of menuData.milanesas) {
      if (lowerMsg.includes(mila.nombre.toLowerCase())) {
        let respuesta = `¿Querés la milanesa ${mila.nombre} de carne o de pollo?\nPrecios:\n`;
        for (const [tamano, precio] of Object.entries(mila.precios)) {
          respuesta += `• ${tamano.charAt(0).toUpperCase() + tamano.slice(1)}: $${precio}\n`;
        }
        return res.status(200).json({ reply: respuesta });
      }
    }

    // Si no encontró nada
    return res.status(200).json({
      reply: "No encontré ese producto en el menú. Podés escribir por ejemplo: ¿Cuánto está la napolitana?"
    });
  } catch (error) {
    console.error("Error en el webhook:", error);
    return res.status(500).json({ error: "Error interno del servidor" });
  }
}
