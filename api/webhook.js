import menuData from './menudata.js'; // ✅ CORRECTO: en minúscula

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
    return res.status(405).send('<Response><Message>Método no permitido</Message></Response>');
  }

  const { Body } = req.body;
  const mensajeOriginal = Body || '';
  const mensaje = normalizarTexto(mensajeOriginal);

  // Saludo básico
  const saludos = ['hola', 'buenas', 'buenas noches', 'buen dia', 'buenos dias'];
  if (saludos.some(saludo => mensaje.includes(saludo))) {
    return res
      .status(200)
      .send('<Response><Message>¡Hola! ¿En qué te puedo ayudar?</Message></Response>');
  }

  // Buscar en todas las categorías
  for (const categoria in menuData) {
    for (const producto of menuData[categoria]) {
      const nombreNormalizado = normalizarTexto(producto.name);
      if (mensaje.includes(nombreNormalizado)) {
        let respuesta = '';

        if (producto.chica && producto.grande && producto.gigante) {
          respuesta =
            `La ${producto.name} cuesta:\n` +
            `• Chica $${producto.chica}\n` +
            `• Grande $${producto.grande}\n` +
            `• Gigante $${producto.gigante}`;
        } else if (producto.grande) {
          respuesta = `La ${producto.name} cuesta $${producto.grande}.`;
        } else if (producto.precio) {
          respuesta = `La ${producto.name} cuesta $${producto.precio}.`;
        }

        return res
          .status(200)
          .send(`<Response><Message>${respuesta}</Message></Response>`);
      }
    }
  }

  // Si no encuentra nada
  return res.status(200).send(
    `<Response><Message>No encontré ese producto en el menú. Podés escribir por ejemplo: ¿Cuánto está la muzzarella?</Message></Response>`
  );
}
