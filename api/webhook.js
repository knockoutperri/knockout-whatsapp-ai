// webhook.js
import menuData from "./menuData.js";
import stringSimilarity from "string-similarity";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  try {
    const { message } = req.body;
    const lowerMsg = message.toLowerCase();

    // Si alguien pide una pizzanesa
    if (lowerMsg.includes("pizzanesa")) {
      return res.status(200).json({
        reply: "Perfecto, anotamos tu pizzanesa. ¿Con qué gusto la querés? (Sola, napolitana, fugazzeta, roquefort...) ¿Y de carne o de pollo?"
      });
    }

    // Reglas para productos que pueden ser pizza o milanesa
    const gustosDuplicados = ["napolitana", "fugazzeta", "roquefort", "3 quesos", "4 quesos", "choclo"];
    const matchDoble = stringSimilarity.findBestMatch(lowerMsg, gustosDuplicados).bestMatch;
    if (matchDoble.rating > 0.6) {
      return res.status(200).json({
        reply: `¿Te referís a una pizza ${matchDoble.target} o a una milanesa ${matchDoble.target}?`
      });
    }

    // Buscar producto por similitud
    const nombres = menuData.productos.map(p => p.nombre.toLowerCase());
    const best = stringSimilarity.findBestMatch(lowerMsg, nombres).bestMatch;

    if (best.rating > 0.6) {
      const producto = menuData.productos.find(p => p.nombre.toLowerCase() === best.target);
      return res.status(200).json({
        reply: `${producto.nombre}: ${producto.descripcion}`
      });
    }

    return res.status(200).json({
      reply: "¿Podés decirlo de otra forma? No te estoy entendiendo bien."
    });

  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}
