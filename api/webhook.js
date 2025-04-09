import menuData from './menuData.js';
import { format } from 'date-fns';
import Fuse from 'fuse.js';

const fuseOptions = {
  includeScore: true,
  threshold: 0.4,
  keys: ['name'],
};

const fuseIndex = {};
for (const categoria in menuData) {
  fuseIndex[categoria] = new Fuse(menuData[categoria], fuseOptions);
}

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
    return res.status(405).send('<Response><Message>Método no permitido</Message></Response>');
  }

  const { Body } = req.body;
  const mensajeOriginal = Body || '';
  const mensaje = normalizarTexto(mensajeOriginal);

  const hora = parseInt(format(new Date(), 'HH'), 10);
  let saludo;
  if (hora < 13) saludo = '¡Buen día!';
  else if (hora < 20.5) saludo = '¡Buenas tardes!';
  else saludo = '¡Buenas noches!';

  const saludos = ['hola', 'buenas', 'buenas tardes', 'buenas noches', 'buen dia', 'buenos dias'];
  if (saludos.some(s => mensaje.includes(s))) {
    return res.status(200).send(
      `<Response><Message>${saludo} ¿Querés ver el menú o ya sabés qué pedir?\n\n👉 *Ver menú*\n👉 *Quiero hacer un pedido*</Message></Response>`
    );
  }

  // Mostrar menú con imagen
  if (mensaje.includes('ver menu')) {
    return res.status(200).send(
      `<Response><Message>Te dejo el menú completo:\nhttps://i.imgur.com/wIN1o4h.jpg\nhttps://i.imgur.com/bjBPbNy.jpg</Message></Response>`
    );
  }

  // Mostrar imágenes por categoría
  if (mensaje.includes('pizza')) {
    return res.status(200).send(`<Response><Message>Acá tenés todas nuestras pizzas:\nhttps://i.imgur.com/bjBPbNy.jpg</Message></Response>`);
  }
  if (mensaje.includes('milanesa')) {
    return res.status(200).send(`<Response><Message>Estas son las milanesas que tenemos:\nhttps://i.imgur.com/wIN1o4h.jpg</Message></Response>`);
  }

  // Tartas
  if (mensaje.includes('tarta')) {
    const tartas = menuData.tartas.map(t => `• ${t.name} $${t.precio}`).join('\n');
    return res.status(200).send(`<Response><Message>Estas son nuestras tartas:\n${tartas}</Message></Response>`);
  }

  // Tortillas
  if (mensaje.includes('tortilla')) {
    const tortillas = menuData.tortillas.map(t => `• ${t.name} $${t.precio}`).join('\n');
    return res.status(200).send(`<Response><Message>Estas son nuestras tortillas:\n${tortillas}</Message></Response>`);
  }

  // Bebidas
  if (mensaje.includes('bebida') || mensaje.includes('coca') || mensaje.includes('agua') || mensaje.includes('cerveza')) {
    const bebidas = menuData.bebidas.map(b => `• ${b.name} $${b.precio}`).join('\n');
    return res.status(200).send(`<Response><Message>Estas son las bebidas disponibles:\n${bebidas}</Message></Response>`);
  }

  // Canastitas
  if (mensaje.includes('canastita')) {
    const canastitas = menuData.canastitas.map(c => `• ${c.name} $${c.precio}`).join('\n');
    return res.status(200).send(`<Response><Message>Estas son nuestras canastitas:\n${canastitas}</Message></Response>`);
  }

  // Calzones
  if (mensaje.includes('calzon')) {
    const calzones = menuData.calzones.map(c => `• ${c.name} $${c.precio}`).join('\n');
    return res.status(200).send(`<Response><Message>Estos son nuestros calzones:\n${calzones}</Message></Response>`);
  }

  // Fainá
  if (mensaje.includes('faina')) {
    const fainas = menuData.fainas.map(f => `• ${f.name} $${f.precio}`).join('\n');
    return res.status(200).send(`<Response><Message>Tenemos estas opciones:\n${fainas}</Message></Response>`);
  }

  // Respuesta si no entiende nada
  return res.status(200).send(
    `<Response><Message>No te entendí bien 🤔. Podés escribir:\n👉 *Ver menú*\n👉 *Quiero hacer un pedido*\nO preguntarme por ejemplo:\n• ¿Qué milanesas hay?\n• ¿Cuánto sale una tarta?\n• ¿Tienen empanadas?</Message></Response>`
  );
}
