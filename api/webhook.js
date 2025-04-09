import OpenAI from 'openai';
import menuData from './menuData.js';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

function normalizarTexto(texto) {
  return texto
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\w\s]/gi, '')
    .toLowerCase()
    .trim();
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).send('Método no permitido');
  }

  const { Body } = req.body;
  const mensaje = Body?.trim() || '';

  try {
    const respuestaIA = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: `
Sos un asistente inteligente para una pizzería. Tu tarea es tomar pedidos, contestar dudas y guiar al cliente como si fueras un humano amable y canchero. Respondé con buena onda, pero sin exagerar. Si el cliente dice “napolitana”, preguntale si es pizza o milanesa. Si dice "carne", preguntá si quiere empanada de carne picada o carne a cuchillo. Siempre preguntá si quiere agregar algo más antes de confirmar. No digas “soy una inteligencia artificial”.

* Si pide "ver menú", mostrá imagen: https://knockout-menu.vercel.app/menu-general.png
* Si pide "pizzas", mostrá imagen: https://knockout-menu.vercel.app/menu-pizzas.png
* Si pide "empanadas", aclarales que 1 cuesta $1800 y la docena $20.000
* Si elige 12 empanadas, cobrales $20.000
* Si pide una milanesa, preguntá si es de carne o de pollo
* Si pide tarta, aclarale que son individuales
* Si pide tortilla, decile qué opciones hay
* Si dice “buen día” o “buenas tardes”, respondé con saludo según la hora (antes de 13:00 "Buen día", hasta 20:30 "Buenas tardes", después "Buenas noches").
* Siempre mantené el estilo natural. Si dice "hola", “quiero pedir”, “tomame una pizza”, etc., entendé el contexto y arrancá a tomar el pedido.  
          `
        },
        { role: 'user', content: mensaje }
      ],
      temperature: 0.7,
      max_tokens: 800
    });

    const respuestaFinal = respuestaIA.choices[0]?.message?.content || 'No pude entender el mensaje. ¿Podés repetirlo?';
    return res.status(200).send(respuestaFinal);
  } catch (error) {
    console.error('Error:', error);
    return res.status(500).send('Ocurrió un error procesando tu mensaje.');
  }
}
