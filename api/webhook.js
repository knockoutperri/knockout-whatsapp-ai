import menuData from './menudata.js';

function normalizarTexto(texto) {
  return texto
    .normalize('NFD') // separa acentos de letras
    .replace(/[\u0300-\u036f]/g, '') // remueve acentos
    .replace(/[^\w\s]/gi, '') // elimina signos de puntuación
    .toLowerCase()
    .trim();
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).send(`<Response><Message>Método no permitido</Message></Response>`);
  }

  const { Body } = req.body;
  const mensajeOriginal = Body || '';
  const mensaje = normalizarTexto(mensajeOriginal);

  // Saludo básico
  const saludos = ['hola', 'buenas', 'buenas noches', 'buen dia', 'buenos dias'];
  if (saludos.some(saludo => mensaje.includes(saludo))) {
    return res.status(200).send(`<Response><Message>¡Hola! ¿En qué te puedo ayudar?</Message></Response>`);
  }

  // Buscar producto
  for (const categoria in menuData) {
    for (const producto of menuData[categoria]) {
      const nombreNormalizado = normalizarTexto(producto.name);
      if (mensaje.includes(nombreNormalizado)) {
        if (producto.chica && producto.grande && producto.gigante) {
          return res.status(200).send(`<Response><Message>La pizza ${producto.name} cuesta:
• Chica $${producto.chica}
• Grande $${producto.grande}
• Gigante $${producto.gigante}</Message></Response>`);
        } else if (producto.grande) {
          return res.status(200).send(`<Response><Message>La ${producto.name} cuesta $${producto.grande}.</Message></Response>`);
        } else if (producto.precio) {
          return res.status(200).send(`<Response><Message>La ${producto.name} cuesta $${producto.precio}.</Message></Response>`);
        }
      }
    }
  }

  // No encontró el producto
  return res.status(200).send(`<Response><Message>No encontré ese producto en el menú. Podés escribir por ejemplo: ¿Cuánto está la muzzarella?</Message></Response>`);
}
