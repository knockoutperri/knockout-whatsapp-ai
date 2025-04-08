import menuData from './menuData.js';
import Fuse from 'fuse.js';

function normalizarTexto(texto) {
  return texto
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // acentos
    .replace(/[^\w\s]/gi, '') // signos de puntuación
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

  const saludos = ['hola', 'buenas', 'buenas noches', 'buen dia', 'buenos dias'];
  if (saludos.some(s => mensaje.includes(s))) {
    return res.status(200).send('<Response><Message>¡Hola! ¿En qué te puedo ayudar?</Message></Response>');
  }

  let todosLosProductos = [];

  for (const categoria in menuData) {
    todosLosProductos = todosLosProductos.concat(menuData[categoria]);
  }

  const fuse = new Fuse(todosLosProductos, {
    keys: ['name'],
    threshold: 0.4, // cuanto más bajo, más exacto (0.4 funciona bien)
  });

  const resultado = fuse.search(mensaje);

  if (resultado.length > 0) {
    const producto = resultado[0].item;

    if (producto.chica && producto.grande && producto.gigante) {
      return res.status(200).send(`<Response><Message>
La ${producto.name} cuesta:
• Chica $${producto.chica}
• Grande $${producto.grande}
• Gigante $${producto.gigante}
</Message></Response>`);
    } else if (producto.grande) {
      return res.status(200).send(`<Response><Message>La ${producto.name} cuesta $${producto.grande}.</Message></Response>`);
    } else if (producto.precio) {
      return res.status(200).send(`<Response><Message>La ${producto.name} cuesta $${producto.precio}.</Message></Response>`);
    }
  }

  return res.status(200).send(`<Response><Message>No encontré ese producto en el menú. Podés escribir por ejemplo: ¿Cuánto está la muzzarella?</Message></Response>`);
}
