import menuData from './menuData.js';
import { OpenAI } from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default async function handler(req, res) {
  const twilio = await import('twilio');
  const MessagingResponse = twilio.default.twiml.MessagingResponse;

  const twiml = new MessagingResponse();
  const message = req.body.Body || '';
  const lowerMessage = message.toLowerCase().trim();

  // Saludo inteligente según la hora
  const now = new Date();
  const hora = now.getHours();
  let saludo = '¡Buenas tardes!';
  if (hora < 13) saludo = '¡Buen día!';
  else if (hora >= 20) saludo = '¡Buenas noches!';

  // Inicio con botones
  if (['hola', 'buenas', 'buen día', 'buenas tardes', 'buenas noches'].some(txt => lowerMessage.includes(txt))) {
    twiml.message(`${saludo} ¿Querés ver el menú o ya sabés qué pedir?\n\n👉 Ver menú\n👉 Quiero hacer un pedido`);
    return res.status(200).send(twiml.toString());
  }

  // Procesamiento con inteligencia artificial real
  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: `Sos un asistente de una pizzería llamada Knock Out. Respondé como un humano, con buena onda, pero sin exagerar. 
          Usá esta base de datos como referencia para responder precios, aclaraciones, ingredientes y tamaños: ${JSON.stringify(menuData)}.
          Si alguien pide una empanada de carne, preguntá si la quiere picada o a cuchillo.
          Si pide 12 empanadas, cobrales $20000 en total. Si pide menos, es $1800 cada una. Nunca aclares esto si no lo preguntan.
          Siempre que alguien haga un pedido, preguntá: "¿Querés agregar algo más al pedido?" y mostrá botones Sí / No.
          Si preguntan por pizzas, mandá la imagen del menú de pizzas.
          Si preguntan por milanesas, tartas, tortillas, empanadas o canastitas, mandá la otra imagen.
          Respondé de forma flexible ante errores ortográficos, mayúsculas y signos. Usá el mismo estilo que el cliente.
          Siempre respondé en español.`
        },
        {
          role: 'user',
          content: message,
        }
      ],
      temperature: 0.6,
    });

    const aiReply = completion.choices[0].message.content;
    twiml.message(aiReply);
    return res.status(200).send(twiml.toString());

  } catch (error) {
    console.error('Error con OpenAI:', error);
    twiml.message('Perdoná, tuve un problema para procesar tu mensaje. ¿Podés repetirlo?');
    return res.status(200).send(twiml.toString());
  }
}
