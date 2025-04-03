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

    const coincidencia = stringSimilarity.findBestMatch(lowerMsg, gustosDuplicados);
    const mejorCoincidencia = coincidencia.bestMatch;
    if (mejorCoincidencia.rating > 0.6) {
      return res.status(200).json({
        reply: `¿Te referís a una pizza ${mejorCoincidencia.target} o a una milanesa ${mejorCoincidencia.target}?`
      });
    }

    // Si alguien pide una pizzanesa, responder con lógica de milanesa
    if (lowerMsg.includes("pizzanesa")) {
      return res.status(200).json({
        reply: "Perfecto, anotamos tu pizzanesa. ¿Con qué gusto la querés? (Sola, napolitana, fugazzeta, roquefort...) ¿Y de carne o de pollo?"
      });
    }

    // Buscar coincidencia en productos usando similitud
    const nombresProductos = menuData.productos.map(p => p.nombre.toLowerCase());
    const similitud = stringSimilarity.findBestMatch(lowerMsg, nombresProductos);
    const mejorProducto = similitud.bestMatch;
    if (mejorProducto.rating > 0.6) {
      const producto = menuData.productos.find(p => p.nombre.toLowerCase() === mejorProducto.target);
      const respuesta = `${producto.nombre}: ${producto.descripcion}`;
      return res.status(200).json({ reply: respuesta });
    }

    return res.status(200).json({ reply: "¿Podés decirlo de otra forma? No te estoy entendiendo bien." });
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}
