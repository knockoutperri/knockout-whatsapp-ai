import menuData from "./menuData.js";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  try {
    const { message } = req.body;
    const lowerMsg = message.toLowerCase();

    // Reglas específicas
    if (lowerMsg.includes("napolitana")) {
      return res.status(200).json({
        reply: "¿Te referís a una pizza napolitana o una milanesa napolitana?",
      });
    }

    if (lowerMsg.includes("pizzanesa")) {
      return res.status(200).json({
        reply: "Perfecto, anotamos tu pizzanesa. ¿Con qué gusto la querés? (Sola, napolitana, roquefort, etc.) ¿De carne o de pollo?",
      });
    }

    // Buscar coincidencia exacta en productos
    const producto = menuData.find(p => lowerMsg.includes(p.nombre.toLowerCase()));

    if (producto) {
      return res.status(200).json({
        reply: `${producto.nombre}: ${producto.descripcion} Precio: ${producto.precio}`,
      });
    }

    // Respuesta general si no reconoce
    return res.status(200).json({
      reply: "¿Podrías decirlo de otra forma? Si querés, puedo ayudarte con el menú.",
    });

  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}
