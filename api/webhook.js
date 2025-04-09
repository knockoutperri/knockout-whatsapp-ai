// webhook.js
import { Configuration, OpenAIApi } from 'openai';
import menuData from './menuData.js';
import { readFile } from 'fs/promises';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const config = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(config);

function normalizarTexto(texto) {
  return texto.toLowerCase()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .replace(/[.,;:!?¿¡]/g, '')
    .trim();
}

function generarRespuestaSaludo() {
  const hora = new Date().getHours();
  if (hora < 13) return '¡Buen día!';
  if (hora < 20.5) return '¡Buenas tardes!';
  return '¡Buenas noches!';
}

function contienePalabra(frase, palabras) {
  return palabras.some(palabra => frase.includes(palabra));
}

function respuestaCategorias(mensaje) {
  const texto = normalizarTexto(mensaje);

  if (contienePalabra(texto, ['tenes milanesa', 'y milanesa', 'hay milanesa', 'milanesas'])) {
    return {
      tipo: 'imagen',
      url: 'https://knockout-imgs.s3.amazonaws.com/menu-milanesas.png'
    };
  }

  if (contienePalabra(texto, ['tenes pizza', 'hay pizza', 'pizzas'])) {
    return {
      tipo: 'imagen',
      url: 'https://knockout-imgs.s3.amazonaws.com/menu-pizzas.png'
    };
  }

  if (texto === 'napolitana') {
    return {
      tipo: 'texto',
      texto: '¿Estás hablando de una pizza napolitana o una milanesa napolitana?'
    };
  }

  return null;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).send('Método no permitido');
  }

  const promptUsuario = req.body.Body || '';
  const respuestaCategoria = respuestaCategorias(promptUsuario);

  if (respuestaCategoria) {
    if (respuestaCategoria.tipo === 'imagen') {
      return res.status(200).send(`<?xml version="1.0" encoding="UTF-8"?>
        <Response>
          <Message>
            <Body>Te mando la imagen del menú:</Body>
            <Media>${respuestaCategoria.url}</Media>
          </Message>
        </Response>`);
    }
    return res.status(200).send(`<?xml version="1.0" encoding="UTF-8"?>
      <Response>
        <Message>
          <Body>${respuestaCategoria.texto}</Body>
        </Message>
      </Response>`);
  }

  const systemPrompt = `Sos un asistente para una pizzería que se llama Knock Out. Respondé siempre como si fueras un humano, de forma natural. Podés interpretar errores ortográficos y frases poco claras. Usá el menú a continuación para dar respuestas.

${JSON.stringify(menuData)}`;

  try {
    const completion = await openai.createChatCompletion({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: promptUsuario }
      ]
    });

    const respuestaIA = completion.data.choices[0].message.content;

    return res.status(200).send(`<?xml version="1.0" encoding="UTF-8"?>
      <Response>
        <Message>
          <Body>${respuestaIA}</Body>
        </Message>
      </Response>`);
  } catch (error) {
    console.error('Error con OpenAI:', error);
    return res.status(200).send(`<?xml version="1.0" encoding="UTF-8"?>
      <Response>
        <Message>
          <Body>Hubo un problema al procesar tu mensaje. ¿Podés repetirlo?</Body>
        </Message>
      </Response>`);
  }
}
