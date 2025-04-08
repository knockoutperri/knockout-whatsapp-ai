import menuData from './menuData.js';

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
    return res
      .status(405)
      .send('<Response><Message>Método no permitido</Message></Response>');
  }

  const { Body } = req.body;
  const mensajeOriginal = Body || '';
  const mensaje = normalizarTexto(mensajeOriginal);

  // Saludos
  const saludos = ['hola', 'buenas', 'buenas noches', 'buen dia', 'buenos dias'];
  if (saludos.some(saludo => mensaje.includes(saludo))) {
    return res
      .status(200)
      .send('<Response><Message>¡Hola! ¿En qué te puedo ayudar?</Message></Response>');
  }

  // Buscar en el menú
  for (const categoria in menuData) {
    for (const producto of menuData[categoria]) {
      const nombreNormalizado = normalizarTexto(producto.name);

      if (mensaje.includes(nombreNormalizado)) {
        // Si es una pizza con tres tamaños
        if (producto.chica && producto.grande && producto.gigante) {
          return res.status(200).send(
            `<Response><Message>La ${producto.name} cuesta:\n• Chica $${producto.chica}\n• Grande $${producto.grande}\n• Gigante $${producto.gigante}</Message></Response>`
          );
        }

        // Si es milanesa con tres tamaños
        if (producto.chica && producto.mediana && producto.grande) {
          return res.status(200).send(
            `<Response><Message>La ${producto.name} cuesta:\n• Chica $${producto.chica}\n• Mediana $${producto.mediana}\n• Grande $${producto.grande}\n\n¿La querés de carne o de pollo?</Message></Response>`
          );
        }

        // Si tiene solo grande
        if (producto.grande) {
          return res
            .status(200)
            .send(`<Response><Message>La ${producto.name} cuesta $${producto.grande}</Message></Response>`);
        }

        // Si tiene solo precio fijo
        if (producto.precio) {
          return res
            .status(200)
            .send(`<Response><Message>La ${producto.name} cuesta $${producto.precio}</Message></Response>`);
        }
      }
    }
  }

  // No encontrado
  return res
    .status(200)
    .send('<Response><Message>No encontré ese producto en el menú. Podés escribir por ejemplo: ¿Cuánto está la muzzarella?</Message></Response>');
}
