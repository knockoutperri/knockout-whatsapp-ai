import menuData from './menuData.js';

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

  const saludos = ['hola', 'buenas', 'buenas noches', 'buen dia', 'buenos dias'];
  if (saludos.some(saludo => mensaje.includes(saludo))) {
    return res.status(200).send('<Response><Message>¡Hola! ¿En qué te puedo ayudar?</Message></Response>');
  }

  for (const categoria in menuData) {
    for (const producto of menuData[categoria]) {
      const nombreNormalizado = normalizarTexto(producto.name);
      if (mensaje.includes(nombreNormalizado)) {
        if (producto.chica && producto.mediana && producto.grande) {
          // MILANESAS: muestra los 3 tamaños y pregunta si es de carne o pollo
          return res.status(200).send(
            `<Response><Message>La ${producto.name} cuesta:\n• Chica $${producto.chica}\n• Mediana $${producto.mediana}\n• Grande $${producto.grande}\n¿La querés de carne o de pollo?</Message></Response>`
          );
        }

        if (producto.chica && producto.grande && producto.gigante) {
          // PIZZAS
          return res.status(200).send(
            `<Response><Message>La pizza ${producto.name} cuesta:\n• Chica $${producto.chica}\n• Grande $${producto.grande}\n• Gigante $${producto.gigante}</Message></Response>`
          );
        }

        if (producto.grande) {
          return res.status(200).send(
            `<Response><Message>La ${producto.name} cuesta $${producto.grande}.</Message></Response>`
          );
        }

        if (producto.precio) {
          return res.status(200).send(
            `<Response><Message>La ${producto.name} cuesta $${producto.precio}.</Message></Response>`
          );
        }
      }
    }
  }

  return res.status(200).send(
    `<Response><Message>No encontré ese producto en el menú. Podés escribir por ejemplo: ¿Cuánto está la muzzarella?</Message></Response>`
  );
}
