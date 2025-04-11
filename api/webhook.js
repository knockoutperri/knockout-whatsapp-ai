import menuData from './menuData.js';
import { OpenAI } from 'openai';
import { config } from 'dotenv';
config();

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const MILANESA_Y_PIZZA_DUPLICADOS = ['napolitana', 'fugazzeta', 'roquefort', 'jamón y morrón', '4 quesos', 'rúcula y parmesano'];

let contexto = {
  ultimoMenuEnviado: null,
  ultimaCategoriaAmbigua: null,
  categoriaActual: null,
};

function normalizarTexto(texto) {
  return texto
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\w\s]/gi, "")
    .toLowerCase()
    .trim();
}

function obtenerSaludo() {
  const hora = new Date().toLocaleString("es-AR", { timeZone: "America/Argentina/Buenos_Aires", hour: "numeric", hour12: false });
  const h = parseInt(hora);
  if (h < 13) return "Buen día";
  if (h >= 13 && h < 20) return "Buenas tardes";
  return "Buenas noches";
}

function yaSeEnvioElMenu() {
  const ahora = Date.now();
  return contexto.ultimoMenuEnviado && (ahora - contexto.ultimoMenuEnviado < 1000 * 60 * 60);
}

function generarRespuestaAI(prompt) {
  return openai.chat.completions.create({
    model: "gpt-4",
    messages: [{ role: "user", content: prompt }],
    temperature: 0.6,
  });
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).send("Método no permitido");
  }

  const { Body } = req.body;
  const mensaje = normalizarTexto(Body || "");

  const saludo = obtenerSaludo();

  if (mensaje.includes("hola") || mensaje.includes("buenas") || mensaje.includes("buen día")) {
    return res.status(200).send(`
      <Response>
        <Message>Hola, ${saludo}. ¿En qué puedo ayudarte hoy?</Message>
      </Response>
    `);
  }

  if (mensaje.includes("ver el menú") || mensaje.includes("ver los precios") || mensaje.includes("qué tenés")) {
    if (!yaSeEnvioElMenu()) {
      contexto.ultimoMenuEnviado = Date.now();
      return res.status(200).send(`
        <Response>
          <Message>Te paso una imagen del menú para que puedas verlo tranquilo.</Message>
          <Message mediaUrl="https://i.imgur.com/bPFMK3o.jpeg" />
          <Message mediaUrl="https://i.imgur.com/YxDHo49.jpeg" />
        </Response>
      `);
    } else {
      return res.status(200).send(`
        <Response>
          <Message>Ya te envié el menú. ¿Querés que te lo reenvíe?</Message>
        </Response>
      `);
    }
  }

  for (let palabra of MILANESA_Y_PIZZA_DUPLICADOS) {
    if (mensaje.includes(palabra)) {
      contexto.ultimaCategoriaAmbigua = palabra;
      return res.status(200).send(`
        <Response>
          <Message>¿Estamos hablando de pizza o de milanesa?</Message>
        </Response>
      `);
    }
  }

  if (contexto.ultimaCategoriaAmbigua && (mensaje.includes("pizza") || mensaje.includes("milanesa"))) {
    const categoria = mensaje.includes("pizza") ? "pizza" : "milanesa";
    contexto.categoriaActual = categoria;

    const productos = categoria === "pizza"
      ? menuData.pizzasComunes.concat(menuData.pizzasEspeciales, menuData.pizzasRellenas)
      : menuData.milanesas;

    const producto = productos.find(p =>
      normalizarTexto(p.name).includes(contexto.ultimaCategoriaAmbigua)
    );

    contexto.ultimaCategoriaAmbigua = null;

    if (!producto) {
      return res.status(200).send(`<Response><Message>No encontré ese producto en el menú.</Message></Response>`);
    }

    if (categoria === "pizza") {
      return res.status(200).send(`
        <Response>
          <Message>${producto.name}:\nChica: $${producto.chica}\nGrande: $${producto.grande}\nGigante: $${producto.gigante}</Message>
        </Response>
      `);
    } else {
      return res.status(200).send(`
        <Response>
          <Message>${producto.name}:\nChica: $${producto.chica}\nMediana: $${producto.mediana}\nGrande: $${producto.grande}</Message>
          <Message>¿La querés de carne o de pollo?</Message>
        </Response>
      `);
    }
  }

  if (mensaje.includes("tenes milanesa") || mensaje.includes("tenes milanesas") || mensaje.includes("que milanesas")) {
    contexto.categoriaActual = "milanesa";
    return res.status(200).send(`
      <Response>
        <Message>Te paso una imagen con todas las milanesas y precios para que elijas tranquilo.</Message>
        <Message mediaUrl="https://i.imgur.com/bPFMK3o.jpeg" />
      </Response>
    `);
  }

  // Por defecto, inteligencia artificial
  const respuestaAI = await generarRespuestaAI(`
    Actuá como un asistente de atención de una pizzería llamada Knockout. Contestá breve y con buena onda. Si alguien pregunta algo que no entendés, respondé de manera educada e informal para que lo reformule. Si alguien dice "napolitana", "fugazzeta", "roquefort", etc., sin aclarar si es pizza o milanesa, preguntale cuál de las dos es. Mostrá precios cuando preguntan "¿cuánto está...?" o "precio de...". Si dicen "ver menú", mandales las dos imágenes del menú. Nunca respondas dos veces "hola" seguidas. No uses demasiados emojis. Solo uno de vez en cuando está bien.
    
    Usuario: ${Body}
  `);

  const final = respuestaAI.choices[0].message.content;

  return res.status(200).send(`<Response><Message>${final}</Message></Response>`);
}
