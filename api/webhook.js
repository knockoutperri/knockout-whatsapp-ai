import menudata from './menudata.js';

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
    return res.status(405).json({ error: 'Método no permitido' });
  }

  const { Body } = req.body;
  const mensajeOriginal = Body || '';
  const mensaje = normalizarTexto(mensajeOriginal);

  // Saludo básico
  const saludos = ['hola', 'buenas', 'buenas noches', 'buen dia', 'buenos dias'];
  if (saludos.some(saludo => mensaje.includes(saludo))) {
    return res.status(200).json({ reply: '¡Hola! ¿En qué te puedo ayudar?' });
  }

  // Buscar en todas las categorías
  for (const categoria in menuData) {
    for (const producto of menuData[categoria]) {
      const nombreNormalizado = normalizarTexto(producto.name);
      if (mensaje.includes(nombreNormalizado)) {
        if (producto.chica && producto.grande && producto.gigante) {
          return res.status(200).json({
            reply:
              `La pizza ${producto.name} cuesta:\n` +
              `• Chica $${producto.chica}\n` +
              `• Grande $${producto.grande}\n` +
              `• Gigante $${producto.gigante}`
          });
        } else if (producto.grande) {
          return res.status(200).json({
            reply: `La ${producto.name} cuesta $${producto.grande}.`
          });
        } else if (producto.precio) {
          return res.status(200).json({
            reply: `La ${producto.name} cuesta $${producto.precio}.`
          });
        }
      }
    }
  }

  // Si no encuentra nada
  return res.status(200).json({
    reply: 'No encontré ese producto en el menú. Podés escribir por ejemplo: ¿Cuánto está la muzzarella?'
  });
}
