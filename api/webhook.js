export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  try {
    const { message } = req.body;

    // Lógica básica de respuesta según la pregunta
    let reply = "";

    if (!message || message.trim() === "") {
      reply = "Hola, ¿en qué te puedo ayudar?";
    } else {
      const pregunta = message.toLowerCase();

      if (pregunta.includes("napolitana")) {
        reply = "¿Te referís a una pizza napolitana o una milanesa napolitana?";
      } else if (pregunta.includes("pizzanesa")) {
        reply = "¡Perfecto! ¿Qué gusto querés en tu pizzanesa? (es como una milanesa con gustos de pizza arriba)";
      } else if (pregunta.includes("pizza para cocinar")) {
        reply = "Las pizzas para cocinar vienen listas para meter al horno. Tienen la salsa, la muzarella, las aceitunas y los ingredientes del gusto que elijas.";
      } else if (pregunta.includes("faina con muzza")) {
        reply = "La fainá con muzza es una porción de fainá servida junto con una porción de muzzarella.";
      } else {
        reply = "¿Podrías decirme de otra manera? Así te ayudo mejor.";
      }
    }

    return res.status(200).json({ reply });
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}
