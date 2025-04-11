// webhook.js
import { OpenAI } from 'openai';
import express from 'express';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
dotenv.config();

const app = express();
app.use(bodyParser.json());

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const MENU_IMAGES = [
  'https://i.imgur.com/YxDHo49.jpeg', // Pizzas
  'https://i.imgur.com/bPFMK3o.jpeg'  // Milanesas
];

function getGreeting() {
  const now = new Date();
  const hour = now.toLocaleString('en-US', { timeZone: 'America/Argentina/Buenos_Aires', hour: '2-digit', hour12: false });
  const hourNum = parseInt(hour);
  if (hourNum < 13) return 'buen día';
  if (hourNum < 20) return 'buenas tardes';
  return 'buenas noches';
}

const sentMenus = new Map(); // guardamos quién ya recibió el menú por session

app.post('/api/webhook', async (req, res) => {
  try {
    const msg = req.body.message?.toLowerCase() || '';
    const sessionId = req.body.sessionId || req.body.phone || 'default';
    const now = new Date();

    // Saludo inicial
    if (["hola", "buenas", "buenos dias", "buenas tardes", "buenas noches"].some(p => msg.includes(p))) {
      const saludo = getGreeting();
      return res.status(200).send(`<Response><Message>Hola, ${saludo}, ¿en qué puedo ayudarte hoy?</Message></Response>`);
    }

    // Ver menú
    if (msg.includes("menu") || msg.includes("ver precios") || msg.includes("ver la carta") || msg.includes("qué tenés")) {
      if (!sentMenus.get(sessionId)) {
        sentMenus.set(sessionId, true);
        return res.status(200).send(`
          <Response>
            <Message>Acá te paso las imágenes del menú para que puedas verlo tranquilo:</Message>
            <Message><Media>${MENU_IMAGES[0]}</Media></Message>
            <Message><Media>${MENU_IMAGES[1]}</Media></Message>
          </Response>
        `.trim());
      } else {
        return res.status(200).send(`<Response><Message>¿Querés saber el precio de algo en particular del menú?</Message></Response>`);
      }
    }

    // Pregunta por muzzarella
    if (msg.includes("muzzarella") && !msg.includes("precio") && !msg.includes("cuánto") && !msg.includes("vale")) {
      return res.status(200).send(`<Response><Message>¿Estás hablando de pizza muzzarella o milanesa muzzarella?</Message></Response>`);
    }

    if (msg.includes("cuánto") && msg.includes("muzzarella")) {
      return res.status(200).send(`<Response><Message>La pizza muzzarella grande está $22.800. ¿Querés agregar algo más?</Message></Response>`);
    }

    // Productos con nombre compartido entre pizza y milanesa
    const gustosCompartidos = ["napolitana", "fugazzeta", "roquefort", "primavera"];
    for (const gusto of gustosCompartidos) {
      if (msg.includes(gusto)) {
        return res.status(200).send(`<Response><Message>¿Estamos hablando de una pizza ${gusto} o una milanesa ${gusto}?</Message></Response>`);
      }
    }

    // Catch all por ahora
    return res.status(200).send(`<Response><Message>¿Podrías repetirlo de otra forma? Estoy aprendiendo a atender mejor cada día.</Message></Response>`);

  } catch (err) {
    console.error(err);
    return res.status(500).send(`<Response><Message>Error procesando tu mensaje.</Message></Response>`);
  }
});

export default app;
