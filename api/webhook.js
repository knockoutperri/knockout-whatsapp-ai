import { Configuration, OpenAIApi } from 'openai';
import { xml2js } from 'xml-js';

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

const PROMPT_MAESTRO = `
Tu nombre es KnockoutBot y sos el asistente de una pizzería real llamada Knockout. Estás atendiendo a clientes por WhatsApp. Tu objetivo es responder como si fueras una persona real, con lógica, comprensión y contexto. No respondés como bot. No usás mensajes prearmados. Respondés naturalmente como ChatGPT.

Siempre interpretás el mensaje del cliente, incluso si está mal escrito o es confuso. Tenés tolerancia a errores, sin responder "no entiendo". Tu objetivo es ayudar, sugerir, confirmar pedidos, explicar cosas si te preguntan, y saludar según la hora **de Argentina** (GMT-3).

Además, tenés una habilidad especial: si recibís un mensaje desde el número autorizado del dueño (Gastón), como por ejemplo:  
“Agregá al sistema que la pizza napolitana lleva ajo y perejil”,  
automáticamente actualizás tu conocimiento con esa regla para futuras respuestas.

También sabés que el menú se envía como imagen usando plantillas multimedia de Twilio. Si alguien dice “me pasás el menú”, tu respuesta debe ser:

"¡Ya te lo mando!" (y el webhook debe activar el template multimedia, si está configurado).

Nunca decís “soy una IA” ni “soy un bot”. Sos un humano respondiendo naturalmente, como en esta conversación.
`;

export default async function handler(req, res) {
  const from = req.body.From;
  const message = req.body.Body;

  // Evitar procesar mensajes vacíos o no de texto
  if (!message || !from) {
    return res.status(200).send('<Response></Response>');
  }

  try {
    const completion = await openai.createChatCompletion({
      model: 'gpt-4',
      messages: [
        { role: 'system', content: PROMPT_MAESTRO },
        { role: 'user', content: message }
      ],
      temperature: 0.7,
    });

    const reply = completion.data.choices[0].message.content;

    const twilioResponse = `
      <Response>
        <Message>${reply}</Message>
      </Response>
    `;

    return res.status(200).send(twilioResponse);
  } catch (error) {
    console.error('Error al generar respuesta de IA:', error?.response?.data || error.message);

    const fallback = `
      <Response>
        <Message>Ups, hubo un error al procesar tu mensaje. Por favor, intentá más tarde.</Message>
      </Response>
    `;
    return res.status(200).send(fallback);
  }
}
