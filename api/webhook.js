import { OpenAI } from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).send('<Response><Message>Método no permitido</Message></Response>');
  }

  const { Body } = req.body;
  const mensajeCliente = Body?.trim();

  if (!mensajeCliente) {
    return res.status(200).send('<Response><Message>No recibimos ningún mensaje.</Message></Response>');
  }

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: 'Sos el asistente de una pizzería. Respondé con amabilidad, claridad y en un tono casual. Ayudá a los clientes a hacer pedidos y a entender el menú. No expliques que sos una IA. Si te preguntan por una pizza o empanada, respondé con los precios, las opciones y los tiempos de demora.'
        },
        {
          role: 'user',
          content: mensajeCliente
        }
      ]
    });

    const respuestaIA = completion.choices[0].message.content;

    res.status(200).send(`<Response><Message>${respuestaIA}</Message></Response>`);
  } catch (error) {
   
