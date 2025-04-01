// webhook.js
import menuData from "./menuData.js";

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

    // Si alguien pide una pizzanesa, responder con lógica de milanesa
    if (lowerMsg.includes("pizzanesa")) {
      return res.status(200).json({
        reply: "Perfecto, anotamos tu pizzanesa. ¿Con qué gusto la querés? (Sola, napolitana, fugazzeta, roquefort...) ¿Y de carne o de pollo?"
      });
    }

    // Buscar coincidencia exacta en productos
    const productoEncontrado = menuData.productos.find((p) =>
      lowerMsg.includes(p.nombre.toLowerCase())
    );

    if (productoEncontrado) {
      const respuesta = `${productoEncontrado.nombre}: ${productoEncontrado.descripcion}`;
      return res.status(200).json({ reply: respuesta });
    }

    return res.status(200).json({ reply: "¿Podés decirlo de otra forma? No te estoy entendiendo bien." });
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}
