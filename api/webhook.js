import { OpenAI } from 'openai';
import { menuData } from './menuData.js';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

function getGreeting() {
  const now = new Date();
  const hour = now.getUTCHours() - 3; // UTC-3 para Argentina
  if (hour >= 1 && hour < 13) return 'Buen día';
  if (hour >= 13 && hour < 20) return 'Buenas tardes';
  return 'Buenas noches';
}

let hasSentMenu = {};

export default async function handler(req, res) {
  const incomingMsg = req.body.Body?.trim() || '';
  const from = req.body.From || '';
  const lowerMsg = incomingMsg.toLowerCase();

  // Saludo inicial con hora real
  if (['hola', 'buenas', 'holaa', 'buen día', 'buenas tardes', 'buenas noches'].includes(lowerMsg)) {
    const saludo = getGreeting();
    return res.status(200).send(`<Response><Message>Hola, ${saludo}. ¿En qué puedo ayudarte hoy?</Message></Response>`);
  }

  // Pregunta de hora
  if (lowerMsg.includes('qué hora') || lowerMsg.includes('hora es')) {
    const now = new Date();
    const horaArg = now.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' });
    return res.status(200).send(`<Response><Message>¡Hola! Son las ${horaArg}. ¿En qué puedo ayudarte hoy?</Message></Response>`);
  }

  // Ver menú
  if (lowerMsg.includes('ver el menú') || lowerMsg.includes('pasame el menú') || lowerMsg.includes('tenés carta') || lowerMsg.includes('ver precios') || lowerMsg.includes('quiero ver la carta')) {
    if (!hasSentMenu[from]) {
      hasSentMenu[from] = true;
      return res.status(200).send(`
        <Response>
          <Message>¡Claro! Te paso las imágenes del menú para que puedas verlo tranquilo:</Message>
          <Message>
            https://i.imgur.com/YxDHo49.jpeg
          </Message>
          <Message>
            https://i.imgur.com/bPFMK3o.jpeg
          </Message>
        </Response>
      `);
    } else {
      return res.status(200).send(`<Response><Message>¿Querés que te reenvíe el menú completo?</Message></Response>`);
    }
  }

  // Precio de muzzarella
  if (lowerMsg.includes('muzzarella')) {
    const pizza = menuData.pizzas.find(p => p.nombre.toLowerCase().includes('muzzarella'));
    if (pizza) {
      return res.status(200).send(`<Response><Message>La pizza muzzarella cuesta:\n• Chica: $${pizza.precio.chica}\n• Grande: $${pizza.precio.grande}\n• Gigante: $${pizza.precio.gigante}</Message></Response>`);
    }
  }

  // Pedido puntual con gusto ambiguo
  const gustosAmbiguos = ['napolitana', 'roquefort', 'fugazzeta', 'fugazeta', 'jamón y morrón', '3 quesos', '4 quesos', 'capresse'];
  for (const gusto of gustosAmbiguos) {
    if (lowerMsg.includes(gusto)) {
      if (lowerMsg.includes('pizza')) {
        return res.status(200).send(`<Response><Message>Perfecto, una pizza ${gusto}. ¿La querés chica, grande o gigante?</Message></Response>`);
      }
      if (lowerMsg.includes('milanesa')) {
        return res.status(200).send(`<Response><Message>Perfecto, una milanesa ${gusto}. ¿Chica, mediana o grande? ¿Carne o pollo?</Message></Response>`);
      }
      return res.status(200).send(`<Response><Message>¿Estamos hablando de pizza ${gusto} o milanesa ${gusto}?</Message></Response>`);
    }
  }

  // Por defecto
  return res.status(200).send(`<Response><Message>Perdón, no entendí bien. ¿Podés repetirlo con otras palabras?</Message></Response>`);
}
