// webhook.js
import menuData from './menuData.js';
import { getCompletion } from './openaiUtils.js';

export default async function handler(req, res) {
  const msg = req.body.Body?.trim().toLowerCase() || '';
  const now = new Date();
  const hour = now.getHours();
  let greeting = 'Hola';
  if (hour < 13) greeting += ', buen día';
  else if (hour < 20) greeting += ', buenas tardes';
  else greeting += ', buenas noches';

  let reply = '';
  if (msg === 'hola') {
    reply = `${greeting}, ¿en qué puedo ayudarte hoy?`;
  } else if (msg.includes('menu') || msg.includes('precios') || msg.includes('carta')) {
    if (!global.menuSent) {
      global.menuSent = true;
      reply = `¡Claro! Acá te paso las imágenes del menú para que puedas verlo tranquilo.`;
      return res.status(200).send(
        `<Response><Message>${reply}</Message><Message><Media>https://i.imgur.com/YxDHo49.jpeg</Media></Message><Message><Media>https://i.imgur.com/bPFMK3o.jpeg</Media></Message></Response>`
      );
    } else {
      reply = `Ya te envié el menú en esta conversación. Si querés que te lo reenvíe, decime nomás.`;
    }
  } else if (msg.includes('hora')) {
    reply = `${greeting}, ¿en qué puedo ayudarte hoy?`;
  } else if (msg.includes('muzzarella')) {
    reply = `La pizza muzzarella grande cuesta $13.500. Si querés saber otros tamaños o gustos, decime.`;
  } else if (msg.includes('roquefort')) {
    reply = `¡Perfecto! Tenés pizza roquefort o milanesa roquefort. ¿Cuál de las dos querés?`;
  } else {
    // fallback con IA
    const aiReply = await getCompletion(msg, menuData);
    reply = aiReply;
  }

  res.status(200).send(`<Response><Message>${reply}</Message></Response>`);
}
