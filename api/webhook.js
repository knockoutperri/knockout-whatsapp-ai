import OpenAI from 'openai';
import menuData from './menuData.js';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res
      .status(405)
      .send('<Response><Message>Método no permitido</Message></Response>');
  }

  const { Body } = req.body;
  const mensajeOriginal = Body || '';
  const mensaje = mensajeOriginal.trim().toLowerCase();

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      temperature: 0.4,
      messages: [
        {
          role: 'system',
          content: `
Sos una inteligencia artificial que trabaja para una pizzería llamada Knockout. Respondés los mensajes de WhatsApp como si fueras un empleado real. Interpretás lo que escribe el cliente y lo ayudás a hacer su pedido o resolver sus dudas. Siempre respondé de forma natural y amable.

Reglas:
- Si mencionan “napolitana”, preguntá si es pizza o milanesa.
- Si piden milanesa, preguntá si es de carne o pollo.
- Si piden empanadas, contá cuántas. Si son 12, se cobra $20.000. Si son menos, $1.800 cada una.
- No muestres el total hasta que el cliente diga que terminó.
- Después de cada pedido, preguntá: “¿Querés agregar algo más?”
- Si preguntan por las pizzas, respondé con el menú (imagen) y los nombres con precios.
- Si preguntan si hay tortillas, milanesas, tartas, etc., respondé lo que hay.
- Siempre respondé bien aunque el mensaje esté mal escrito.
- Según el producto, avisá la demora:
  - Pizzas, empanadas, tartas, canastitas: 10 min
  - Milanesas: 15 min
  - Pizzas rellenas, calzones, tortillas: 20 a 25 min

Usá el menú cargado para conocer productos, gustos y precios. No seas robótico. Respondé como si fueras un humano.
          `,
        },
        {
          role: 'user',
          content: mensaje,
        },
      ],
    });

    const respuestaFinal = completion.choices[0].message.content;

    return res
      .status(200)
      .send(`<Response><Message>${respuestaFinal}</Message></Response>`);
  } catch (error) {
    console.error('Error al generar la respuesta:', error);
    return res
      .status(200)
      .send('<Response><Message>Ocurrió un error. Intentá de nuevo.</Message></Response>');
  }
}
