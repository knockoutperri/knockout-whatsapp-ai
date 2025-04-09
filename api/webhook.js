import pkg from 'openai';
const { OpenAIApi, Configuration } = pkg;
import menuData from './menuData.js';
import { readFileSync } from 'fs';
import path from 'path';

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

// Función para normalizar texto
function normalizarTexto(texto) {
  return texto
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\w\s]/gi, '')
    .toLowerCase()
    .trim();
}

// Horarios para saludo
function obtenerSaludo() {
  const hora = new Date().getHours();
  if (hora < 13) return 'Buen día';
  if (hora < 20.5) return 'Buenas tardes';
  return 'Buenas noches';
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).send('Método no permitido');
  }

  const { Body, From } = req.body;
  const mensajeOriginal = Body || '';
  const mensaje = normalizarTexto(mensajeOriginal);

  const saludoInicial = obtenerSaludo();

  // Detectar palabras clave
  const esNapolitana = mensaje.includes('napolitana');
  const esMilanesa = mensaje.includes('milanesa');
  const esPizza = mensaje.includes('pizza');

  // Preguntar si es pizza o milanesa si menciona algo ambiguo
  if (esNapolitana && !esMilanesa && !esPizza) {
    return res.status(200).send(`<Response><Message>¿Te referís a pizza napolitana o milanesa napolitana?</Message></Response>`);
  }

  // Pregunta por milanesa → preguntar si carne o pollo
  if (mensaje.includes('milanesa') && !mensaje.includes('carne') && !mensaje.includes('pollo')) {
    return res.status(200).send(`<Response><Message>¿La milanesa la querés de carne o de pollo?</Message></Response>`);
  }

  // Empanada de carne → preguntar si picada o a cuchillo
  if (mensaje.includes('empanada') && mensaje.includes('carne') && !mensaje.includes('cuchillo')) {
    return res.status(200).send(`<Response><Message>¿Querés empanada de carne picada o carne a cuchillo?</Message></Response>`);
  }

  if (mensaje.includes('carne picante')) {
    return res.status(200).send(`<Response><Message>Las empanadas de carne son sabrosas, pero no picantes.</Message></Response>`);
  }

  // Si pide ver el menú de pizzas → enviar imagen
  if (mensaje.includes('pizza') || mensaje.includes('pizzas')) {
    return res.status(200).send(`
      <Response>
        <Message>
          ¡Estas son nuestras pizzas! Mirá la imagen del menú.
          <Media>https://knockout-menu.vercel.app/menu-pizzas.png</Media>
        </Message>
      </Response>
    `);
  }

  // Si pide milanesas o menú general → imagen general
  if (
    mensaje.includes('milanesa') ||
    mensaje.includes('empanada') ||
    mensaje.includes('canastita') ||
    mensaje.includes('bebida') ||
    mensaje.includes('tarta') ||
    mensaje.includes('tortilla')
  ) {
    return res.status(200).send(`
      <Response>
        <Message>
          ¡Acá tenés nuestras opciones! Te dejo el menú general.
          <Media>https://knockout-menu.vercel.app/menu-general.png</Media>
        </Message>
      </Response>
    `);
  }

  // IA – respuesta natural
  try {
    const completion = await openai.createChatCompletion({
      model: 'gpt-3.5-turbo',
      temperature: 0.7,
      messages: [
        {
          role: 'system',
          content: `
Sos el asistente virtual de una pizzería. Tu tarea es responder con naturalidad, como si atendieras desde el local, y entender cualquier mensaje que llegue por WhatsApp. 

Respondé con cordialidad, pero no como un robot. Si te preguntan precios, mostrálos. Si preguntan gustos, ingredientes o si hay un producto, respondé naturalmente.

Aclaraciones importantes:
- Si alguien pide una empanada de carne, preguntá si la quiere picada o a cuchillo.
- Si piden 12 empanadas, cobrás $20.000 (no $1.800 x 12).
- Si piden menos de 12, es $1.800 cada una.
- Mostrá el total solo al final del pedido.
- Las milanesas pueden ser de carne o de pollo. Siempre preguntá cuál quieren.
- Los tiempos de demora son:
  - Pizzas, tartas, empanadas, papas fritas y canastitas: 10 min
  - Milanesa: 15 min
  - Tortillas, pizzas rellenas y calzones: 20-25 min

No uses botones ni pongas opciones tipo "Sí/No". Respondé como un humano. No digas que sos un bot ni pongas mensajes automáticos.

Recordá que estás en un local llamado Knockout. Respondé como lo harías con un cliente en el mostrador. Sin repetir frases genéricas.
          `,
        },
        { role: 'user', content: mensajeOriginal },
      ],
    });

    const respuesta = completion.data.choices[0].message.content;
    return res.status(200).send(`<Response><Message>${respuesta}</Message></Response>`);
  } catch (error) {
    console.error('Error al generar respuesta con OpenAI:', error.message);
    return res.status(500).send(`<Response><Message>Hubo un error al procesar tu mensaje. Intentá de nuevo en un momento.</Message></Response>`);
  }
}
