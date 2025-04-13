import { OpenAI } from 'openai';
import { menuData } from './menuData.js'; // Asegúrate de tener este archivo con todos los productos

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, // Configura tu clave de OpenAI aquí
});

const imagenMenuPizzas = "https://i.imgur.com/YxDHo49.jpeg";
const imagenMenuMilanesas = "https://i.imgur.com/bPFMK3o.jpeg";

// Aquí va la función que maneja las peticiones de WhatsApp
export default async function handler(req, res) {
  const incomingMsg = req.body.Body?.toLowerCase() || ''; // Obtenemos el mensaje entrante
  let reply = ''; // Variable para la respuesta que vamos a enviar

  // Saludo con hora local Argentina
  const ahora = new Date().toLocaleString("en-US", { timeZone: "America/Argentina/Buenos_Aires" });
  const hora = new Date(ahora).getHours();
  let saludo = '';
  
  if (hora < 12) {
    saludo = "¡Hola, buen día!";
  } else if (hora < 20) {
    saludo = "¡Hola, buenas tardes!";
  } else {
    saludo = "¡Hola, buenas noches!";
  }

  // Respuesta según el mensaje recibido
  if (incomingMsg.includes('hola')) {
    reply = `${saludo} ¿En qué puedo ayudarte hoy?`;
  } else if (incomingMsg.includes('ver el menu') || incomingMsg.includes('menú') || incomingMsg.includes('ver menú')) {
    reply = `${saludo} Claro, acá te dejo nuestro menú. Un momento que te envío las imágenes directamente desde Twilio.`;

    // Aquí se envían las imágenes de los menús directamente en el chat de WhatsApp
    res.status(200).send(`
      <Response>
        <Message>
          <Body>${reply}</Body>
          <Media>${imagenMenuPizzas}</Media>
          <Media>${imagenMenuMilanesas}</Media>
        </Message>
      </Response>
    `);
    return; // Terminamos la respuesta aquí, ya que estamos enviando las imágenes.
  } else if (incomingMsg.includes('precio') || incomingMsg.includes('cuánto cuesta')) {
    reply = "¡Claro! ¿De qué producto te gustaría saber el precio?";
  } else {
    // Si el mensaje no es reconocido, se devuelve un mensaje genérico
    reply = `${saludo} Perdoná, no entendí bien. ¿Querés ver el menú o saber el precio de algo?`;
  }

  // Si el mensaje es general y no hay imágenes, respondemos solo con texto
  res.status(200).send(`
    <Response>
      <Message>
        <Body>${reply}</Body>
      </Message>
    </Response>
  `);
}
