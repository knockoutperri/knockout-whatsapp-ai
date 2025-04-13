import menuData from './menuData.js';
import { OpenAI } from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export default async function handler(req, res) {
  const incomingMsg = req.body.Body?.toLowerCase().trim();

  const ahora = new Date().toLocaleString("es-AR", { timeZone: "America/Argentina/Buenos_Aires" });
  const hora = new Date(ahora).getHours();
  let saludo = "Hola, buen día";
  if (hora >= 13 && hora < 20) saludo = "Hola, buenas tardes";
  else if (hora >= 20 || hora < 5) saludo = "Hola, buenas noches";

  const promptIA = `
    Sos la inteligencia artificial de la pizzería Knockout. Atendé a los clientes de manera natural, amigable y efectiva.  
    Reglas estrictas que debés cumplir siempre:
    - Nunca repitas "hola" si ya lo dijiste antes.
    - Saluda diciendo "${saludo}" según el horario actual de Argentina.
    - Si el cliente pide ver el menú, respondé solo con: "Claro, acá te dejo nuestro menú" y enviá las imágenes directamente desde Twilio.
    - Si el cliente quiere hacer un pedido o pregunta por precios específicos, asumí que pide pizza grande salvo que indique otro tamaño.
    - Si hay nombres compartidos entre pizzas y milanesas (como napolitana, roquefort, fugazzeta, etc.) preguntá claramente "¿Te referís a pizza o milanesa?".
    - Recordá que las milanesas pueden ser de carne o pollo. Siempre preguntá si no está aclarado.
    - Sé breve y claro, sin mensajes largos innecesarios. No inventes ingredientes ni promociones que no existan.

    El menú tiene pizzas, milanesas, empanadas, tartas, tortillas, canastitas, calzones, fainá y bebidas.
  `;

  const completion = await openai.chat.completions.create({
    messages: [{ role: "user", content: `${promptIA}\nCliente dice: ${incomingMsg}` }],
    model: "gpt-3.5-turbo",
  });

  const reply = completion.choices[0].message.content;

  const twiml = `
  <Response>
    <Message>${reply}</Message>
  </Response>
  `;

  res.status(200).send(twiml);
}
