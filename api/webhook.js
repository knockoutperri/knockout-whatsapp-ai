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

    // Reglas específicas por gustos duplicados en pizza y milanesa
    const gustosDuplicados = [
      "napolitana",
      "fugazzeta",
      "roquefort",
      "3 quesos",
      "4 quesos",
      "choclo"
    ];

    for (const gusto of gustosDuplicados) {
      if (lowerMsg.includes(gusto)) {
        return res.status(200).json({
          reply: `¿Te referís a una pizza ${gusto} o a una milanesa ${gusto}?`
        });
      }
    }

    // Si alguien pide una pizzanesa
    if (lowerMsg.includes("pizzanesa")) {
      return res.status(200).json({
        reply: "Perfecto, anotamos tu pizzanesa. ¿Con qué gusto la querés? (Sola, napolitana, fugazzeta, roquefort...) ¿Y de carne o de pollo?"
      });
    }

    // Buscar coincidencia exacta primero
    const exactMatch = menuData.productos.find((p) =>
      lowerMsg.includes(p.nombre.toLowerCase())
    );

    if (exactMatch) {
      return res.status(200).json({
        reply: `${exactMatch.nombre}: ${exactMatch.descripcion}`
      });
    }

    // Buscar con fuzzy matching (errores de tipeo)
    const nombresMenu = menuData.productos.map(p => p.nombre.toLowerCase());
    const mejorCoincidencia = stringSimilarity.findBestMatch(lowerMsg, nombresMenu);

    if (mejorCoincidencia.bestMatch.rating >= 0.7) {
      const producto = menuData.productos.find(p =>
        p.nombre.toLowerCase() === mejorCoincidencia.bestMatch.target
      );

      return res.status(200).json({
        reply: `${producto.nombre}: ${producto.descripcion}`
      });
    }

    // Si no entendió
    return res.status(200).json({
      reply: "¿Podés decirlo de otra forma? No te estoy entendiendo bien."
    });

  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}
