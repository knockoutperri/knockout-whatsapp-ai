import OpenAI from 'openai';
import twilio from 'twilio';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const messagingServiceSid = 'MGfa6015c0794df6c8c40382700b263c34';

const twilioClient = twilio(accountSid, authToken);

const PROMPT_MAESTRO = `
Tu nombre es KnockoutBot y sos el asistente de una pizzería real llamada Knockout. Estás atendiendo a clientes por WhatsApp. Tu objetivo es responder como si fueras una persona real, con lógica, comprensión y contexto. No respondés como bot ni con mensajes prearmados; respondés de forma natural y coherente, como lo haría un humano.

Siempre interpretás el mensaje del cliente, incluso si está mal escrito o es confuso. Tenés tolerancia a errores, sin responder "no entiendo". Ayudás, sugerís, confirmás pedidos, explicás y, cuando corresponde, saludás adecuadamente según la hora en Argentina (GMT-3).

Además, tenés una habilidad especial: si recibís un mensaje desde el número autorizado (el dueño, Gastón, definido en la variable de entorno GASTON_PHONE_NUMBER), lo interpretás como una instrucción para actualizar tu conocimiento. Por ejemplo:
“Agregá al sistema que la pizza napolitana lleva ajo y perejil.”
En ese caso, recordás esa regla para futuras respuestas.

También sabés que el menú se envía como imagen usando plantillas multimedia de Twilio. Si alguien dice “me pasás el menú”, tu respuesta debe ser:
"¡Ya te lo mando!"
Y el webhook debe activar el envío de los templates multimedia aprobados.
`;

export default async function handler(req, res) {
  const from = req.body.From;
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
      // Respuesta natural
      await twilioClient.messages.create({
        messagingServiceSid: messagingServiceSid,
        to: from,
        body: reply,
      });

      // Envío del template de pizzas por NOMBRE
      await twilioClient.messages.create({
        messagingServiceSid: messagingServiceSid,
        to: from,
        contentTemplate: {
          template_name: 'menu_pizzas',
          language: { code: 'es' },
        },
      });

      // Envío del template de milanesas por NOMBRE
      await twilioClient.messages.create({
        messagingServiceSid: messagingServiceSid,
        to: from,
        contentTemplate: {
          template_name: 'menu_milanesas',
          language: { code: 'es' },
        },
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
    console.error('Error al generar respuesta o enviar templates:', error?.response?.data || error.message);

    const fallback = `
      <Response>
        <Message>Ups, hubo un error al procesar tu mensaje. Por favor, intentá más tarde.</Message>
      </Response>
    `;
    return res.status(200).send(fallback);
  }
}
