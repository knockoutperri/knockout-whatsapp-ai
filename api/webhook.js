import OpenAI from 'openai';
import twilio from 'twilio';
import menuData from '../menuData.js'; // Asegurate que esté bien escrito con la mayúscula si así lo tenés

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioClient = twilio(accountSid, authToken);

const memoriaPorCliente = new Map();

function saludoPorHoraArgentina() {
  const hora = new Date().toLocaleString('es-AR', {
    timeZone: 'America/Argentina/Buenos_Aires',
    hour: 'numeric',
    hour12: false,
  });
  const horaNum = parseInt(hora);
  if (horaNum >= 6 && horaNum < 13) return 'Hola, buen día.';
  if (horaNum >= 13 && horaNum < 20) return 'Hola, buenas tardes.';
  return 'Hola, buenas noches.';
}

const PROMPT_MAESTRO = `
Sos la inteligencia artificial del local Knockout Pizzas. Atendés pedidos por WhatsApp como si fueras una persona real, con respuestas naturales y amigables, pero bien claras. Tenés que entender lo que escribe el cliente, aunque tenga errores de ortografía o se exprese mal.

Tu objetivo es:
- Tomar pedidos completos.
- Aclarar dudas sobre los productos.
- Ser rápido y concreto.
- Siempre ofrecer agregar algo más antes de cerrar el pedido.
- No repetir información innecesaria.
- Si un cliente pregunta por un producto, explicá lo justo y necesario.

Reglas especiales:
1. Si un cliente pide una pizza o milanesa por nombre (por ejemplo: "Napolitana"), preguntá si se refiere a pizza o milanesa.
2. Si el cliente no dice el tamaño de la pizza, asumí que es la GRANDE.
3. Si pregunta por los tamaños, respondé: “La pizza chica es de 4 porciones (individual), la grande es de 8 porciones (común) y la gigante es de 12 porciones.”
4. Las milanesas tienen 3 tamaños y vienen siempre con papas fritas. Siempre preguntar si son de carne o de pollo.
5. Las empanadas valen $1800 la unidad y $20000 la docena. Si el cliente pide 12, aplicar precio por docena. Si pide 13 o más, cobrar 1 docena + el resto por unidad. Si pide menos de 12, sumar y decir cuántas pidió, y sugerir completar una docena.
6. Si el cliente pregunta “¿Cuánto está la napolitana?”, preguntá si es pizza o milanesa.
7. No respondas como robot. Respondé como una persona del local.
8. Si el número que escribe es el del dueño, interpretalo como una instrucción para modificar el conocimiento.

Siempre respondé con un saludo que incluya la hora del día (ej: "Hola, buenas tardes") usando la hora de Argentina.

Este es el menú completo. Usalo como base para todas tus respuestas. No inventes ni cambies nada. Si un producto no está en la lista, decí que no lo vendemos.

${menuData}
`;

export default async function handler(req, res) {
  const from = req.body.From;
  const mensaje = req.body.Body;

  if (!mensaje || !from) {
    return res.status(200).send('<Response></Response>');
  }

  const saludo = saludoPorHoraArgentina();
  const historial = memoriaPorCliente.get(from) || [];

  historial.push({ role: 'user', content: mensaje });

  const mensajes = [
    { role: 'system', content: PROMPT_MAESTRO },
    { role: 'user', content: saludo },
    ...historial,
  ];

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: mensajes,
      temperature: 0.7,
    });

    const respuesta = completion.choices[0].message.content;
    historial.push({ role: 'assistant', content: respuesta });
    memoriaPorCliente.set(from, historial);

    const twilioResponse = `
      <Response>
        <Message>${respuesta}</Message>
      </Response>
    `;

    return res.status(200).send(twilioResponse);
  } catch (error) {
    console.error('Error:', error?.response?.data || error.message);
    const fallback = `
      <Response>
        <Message>Ups, hubo un error. Por favor, intentá más tarde.</Message>
      </Response>
    `;
    return res.status(200).send(fallback);
  }
}
