import { OpenAI } from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const historial = {};

export default async function handler(req, res) {
  const mensaje = req.body.Body?.toLowerCase() || "";
  const telefono = req.body.From || "anonimo";

  if (!historial[telefono]) historial[telefono] = [];

  historial[telefono].push(mensaje);
  if (historial[telefono].length > 10) historial[telefono].shift();

  // Determinar contexto reciente (pizza o milanesa)
  const contextoReciente = historial[telefono].slice(-3).reverse().find((m) =>
    m.includes("milanesa") ? "milanesa" : m.includes("pizza") ? "pizza" : null
  );

  const hora = new Date().getHours();
  const saludo =
    hora >= 20
      ? "Buenas noches"
      : hora >= 13
      ? "Buenas tardes"
      : "Buen día";

  const promptBase = `
Sos la inteligencia artificial de la pizzería Knockout. Respondé con amabilidad pero sin exagerar, sin repetir "hola" muchas veces ni usar muchos emojis. Contestá de forma natural.

Menú:
- Usá las imágenes PNG reales del menú si preguntan por los precios o quieren ver el menú. No pongas texto tipo "1. pizzas, 2. milanesas...".
- Si alguien dice "quiero ver el menú", "cuánto están las pizzas", "mostrame los precios", etc., mandale las imágenes del menú.
- Imagen 1: pizzas, pizzas especiales, rellenas, fainá, calzones.
- Imagen 2: milanesas, tartas, tortillas, empanadas, canastitas, bebidas.

Lógica de nombres iguales:
- Si alguien dice "napolitana", "fugazzeta", "roquefort", "3 quesos", etc. y no aclara si es pizza o milanesa:
  - Si el mensaje anterior era sobre milanesa, asumí que sigue con milanesa.
  - Si era sobre pizza, asumí pizza.
  - Si no está claro, preguntá: "¿Estamos hablando de pizza o de milanesa?"

Milanesas:
- Siempre preguntá si es de carne o de pollo.
- Mostrá los precios y los tamaños antes de esa pregunta, para que primero elijan.

Empanadas:
- Si piden una empanada de carne, preguntá si es carne picada o a cuchillo.

Usá esta estructura al saludar por primera vez:
${saludo}, ¿en qué puedo ayudarte hoy?

Ahora respondé este mensaje como si fueras la IA:
"${mensaje}"
`;

  try {
    const completion = await openai.chat.completions.create({
      messages: [{ role: "user", content: promptBase }],
      model: "gpt-4",
    });

    const respuesta = completion.choices[0]?.message?.content || "";
    res.status(200).send(`<Response><Message>${respuesta}</Message></Response>`);
  } catch (err) {
    console.error("Error:", err);
    res.status(500).send(`<Response><Message>Hubo un error. Intentá de nuevo en unos minutos.</Message></Response>`);
  }
}
