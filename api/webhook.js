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

  // Saludo
  const saludos = ['hola', 'buenas', 'buenas noches', 'buen dia', 'buenos dias'];
  if (saludos.some(saludo => mensaje.includes(saludo))) {
    return res.status(200).send('<Response><Message>¡Hola! ¿En qué te puedo ayudar?</Message></Response>');
  }

  // Ver si el mensaje menciona "milanesa" o "pizza"
  const quiereMilanesa = mensaje.includes('milanesa');
  const quierePizza = mensaje.includes('pizza');

  for (const categoria in menuData) {
    for (const producto of menuData[categoria]) {
      const nombreNormalizado = normalizarTexto(producto.name);

      const coincide = mensaje.includes(nombreNormalizado);
      if (!coincide) continue;

      const esMilanesa = categoria === 'milanesas';
      const esPizza = categoria.startsWith('pizzas');

      // Si se pidió "milanesa" y el producto no es milanesa, lo salteamos
      if (quiereMilanesa && !esMilanesa) continue;

      // Si se pidió "pizza" y el producto no es pizza, lo salteamos
      if (quierePizza && !esPizza) continue;

      let respuesta = '';

      if (producto.chica && producto.grande && producto.gigante) {
        respuesta =
          `La ${producto.name} cuesta:\n` +
          `• Chica $${producto.chica}\n` +
          `• Grande $${producto.grande}\n` +
          `• Gigante $${producto.gigante}`;
      } else if (producto.grande && producto.mediana && producto.chica) {
        respuesta =
          `La ${producto.name} cuesta:\n` +
          `• Chica $${producto.chica}\n` +
          `• Mediana $${producto.mediana}\n` +
          `• Grande $${producto.grande}`;
      } else if (producto.grande) {
        respuesta = `La ${producto.name} cuesta $${producto.grande}.`;
      } else if (producto.precio) {
        respuesta = `La ${producto.name} cuesta $${producto.precio}.`;
      }

      return res.status(200).send(`<Response><Message>${respuesta}</Message></Response>`);
    }
  }

  return res
    .status(200)
    .send('<Response><Message>No encontré ese producto en el menú. Podés escribir por ejemplo: ¿Cuánto está la muzzarella?</Message></Response>');
}
