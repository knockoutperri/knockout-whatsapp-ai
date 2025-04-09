import { Configuration, OpenAIApi } from "openai";
import menuData from "./menuData.js";

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res
      .status(405)
      .send("<Response><Message>Método no permitido</Message></Response>");
  }

  const { Body } = req.body;
  const mensajeOriginal = Body || "";
  const mensaje = mensajeOriginal.trim().toLowerCase();

  try {
    const completion = await openai.createChatCompletion({
      model: "gpt-3.5-turbo",
      temperature: 0.4,
      messages: [
        {
          role: "system",
          content: `
Sos una inteligencia artificial que trabaja para una pizzería llamada Knockout. Respondés los mensajes de WhatsApp de forma natural, como si fueras una persona. Tenés que interpretar lo que el cliente te escribe y ayudarlo a hacer su pedido o resolver sus dudas.

Reglas:
- Si alguien menciona “napolitana”, preguntá si se refiere a una pizza o a una milanesa.
- Si alguien pide milanesa, siempre tenés que preguntar si la quiere de carne o de pollo.
- Cuando alguien pide empanadas, contá cuántas pidió. Si pidió 12, cobrás $20.000. Si son menos, cada una cuesta $1.800.
- No digas los totales mientras el cliente todavía está agregando cosas. Solo mostrás el total cuando confirma el pedido.
- Siempre que alguien termine de pedir algo, preguntá: “¿Querés agregar algo más?” con botones de Sí / No (por ahora solo escribiendo).
- No digas “botones: sí / no” en el mensaje. Solo preguntá.
- Si alguien pregunta “¿Tenés pizzas?”, “¿Tenés milanesas?”, “¿Qué milanesas tenés?”, etc., respondé con la lista y los precios. 
- Si alguien pregunta por las pizzas, mandale la imagen del menú que contiene las pizzas.
- Si alguien dice “hola”, “buen día”, “quiero hacer un pedido”, etc., saludalo bien según la hora y preguntale si quiere ver el menú o hacer un pedido.
- Si el mensaje está mal escrito, tiene faltas de ortografía, emojis o comas de más, igual intentá entenderlo.
- Si el pedido es para retirar, avisale cuánto demora según el producto: 
  - Pizzas, empanadas, tartas, canastitas → 10 min
  - Milanesas → 15 min
  - Calzones, tortillas, pizzas rellenas → 20-25 min

Usá el menú que tenés cargado como base para entender los productos, nombres, precios y categorías. Respondé de forma clara y amable, como si fueras un empleado real atendiendo WhatsApp.
          `,
        },
        {
          role: "user",
          content: mensaje,
        },
      ],
    });

    const respuestaFinal = completion.data.choices[0].message.content;

    return res
      .status(200)
      .send(`<Response><Message>${respuestaFinal}</Message></Response>`);
  } catch (error) {
    console.error("Error al generar la respuesta:", error);
    return res
      .status(200)
      .send("<Response><Message>Hubo un error. Intentá de nuevo.</Message></Response>");
  }
}
