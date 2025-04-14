import OpenAI from 'openai';
import twilio from 'twilio';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioClient = twilio(accountSid, authToken);

// Memoria en RAM (temporal por sesión)
const memoriaPorCliente = new Map();

function saludoPorHoraArgentina() {
  const hora = new Date().toLocaleString('es-AR', {
    timeZone: 'America/Argentina/Buenos_Aires',
    hour: 'numeric',
    hour12: false
  });
  const horaNum = parseInt(hora);
  if (horaNum >= 6 && horaNum < 13) return 'Hola, buen día.';
  if (horaNum >= 13 && horaNum < 20) return 'Hola, buenas tardes.';
  return 'Hola, buenas noches.';
}

import fs from 'fs';
const PROMPT_MAESTRO = fs.readFileSync('./PROMPT_MAESTRO.txt', 'utf8');

export default async function handler(req, res) {
  const from = req.body.From;
  const to = req.body.To;
  const mensaje = req.body.Body;

  if (!mensaje || !from) {
    return res.status(200).send('<Response></Response>');
  }

  const saludo = saludoPorHoraArgentina();

  // Obtenemos historial si existe
  const historial = memoriaPorCliente.get(from) || [];

  // Agregamos el mensaje nuevo al historial
  historial.push({ role: 'user', content: mensaje });

  // Armamos el contexto
  const mensajes = [
    { role: 'system', content: PROMPT_MAESTRO },
    { role: 'user', content: saludo },
    ...historial
  ];

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: mensajes,
      temperature: 0.7,
    });

    const respuesta = completion.choices[0].message.content;

    // Agregamos la respuesta al historial
    historial.push({ role: 'assistant', content: respuesta });

    // Guardamos el historial actualizado
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
