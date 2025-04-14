import OpenAI from 'openai';
import twilio from 'twilio';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioClient = twilio(accountSid, authToken);

const PROMPT_MAESTRO = `
Tu nombre es KnockoutBot y sos el asistente de una pizzería real llamada Knockout. Estás atendiendo a clientes por WhatsApp. Tu objetivo es responder como si fueras una persona real, con lógica, comprensión y contexto. No respondés como bot ni con mensajes prearmados; respondés de forma natural y coherente, como lo haría un humano.

Siempre interpretás el mensaje del cliente, incluso si está mal escrito o es confuso. Tenés tolerancia a errores, sin responder "no entiendo". Ayudás, sugerís, confirmás pedidos, explicás y, cuando corresponde, saludás adecuadamente según la hora en Argentina (GMT-3).

Además, tenés una habilidad especial: si recibís un mensaje desde el número autorizado (el dueño, Gastón, definido en la variable de entorno GASTON_PHONE_NUMBER), lo interpretás como una instrucción para actualizar tu conocimiento. Por ejemplo:
“Agregá al sistema que la pizza napolitana lleva ajo y perejil.”
En ese caso, recordás esa regla para futuras respuestas.

También sabés que el menú se envía como imagen usando plantillas multimedia de Twilio. Si alguien dice “me pasás el menú”, tu respuesta debe ser:
"¡Ya te lo mando!"
Y el webhook debe activar el envío de los templates con imágenes.
`;

export default async function handler(req, res) {
  const from = req.body.From;
  const to = req.body.To;
  const message = req.body.Body;

  if (!message || !from) {
    return res.status(200).send('<Response></Response>');
  }

  const isOwner = from === process.env.GASTON_PHONE_NUMBER;

  const messages = [
    { role: 'system', content: PROMPT_MAESTRO },
    { role: 'user', content: message }
  ];

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: messages,
      temperature: 0.7,
    });

    const reply = completion.choices[0].message.content;

    const lowerMessage = message.toLowerCase();

    if (lowerMessage.includes('menu') || lowerMessage.includes('menú')) {
      // Responde primero con texto
      await twilioClient.messages.create({
        from: to,
        to: from,
        body: reply,
      });

      // Envío del template: menú de pizzas
      await twilioClient.messages.create({
        from: to,
        to: from,
        contentSid: 'HX53c6fdb61c603fc6cbfdad3368625783',
      });

      // Envío del template: menú de milanesas
      await twilioClient.messages.create({
        from: to,
        to: from,
        contentSid: 'HXbf582f05e1df7e30aa52eb286c9f006a',
      });

      return res.status(200).send('<Response></Response>');
    }

    const twilioResponse = `
      <Response>
        <Message>${reply}</Message>
      </Response>
    `;

    return res.status(200).send(twilioResponse);
  } catch (error) {
    console.error('Error al generar respuesta de IA o enviar mensajes:', error?.response?.data || error.message);

    const fallback = `
      <Response>
        <Message>Ups, hubo un error al procesar tu mensaje. Por favor, intentá más tarde.</Message>
      </Response>
    `;
    return res.status(200).send(fallback);
  }
}
