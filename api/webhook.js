import menuData from './menudata.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  const { Body } = req.body;
  const mensaje = Body?.toLowerCase().trim();

  if (!mensaje) {
    return res.status(200).json({ reply: 'No recibí ningún mensaje.' });
  }

  // Si el mensaje es un saludo
  const saludos = ['hola', 'buenas', 'buenas noches', 'buen día', 'buenas tardes'];
  if (saludos.some(s => mensaje.includes(s))) {
    return res.status(200).json({
      reply: '¡Hola! Bienvenido a Knockout. ¿Qué te gustaría pedir o consultar hoy?',
    });
  }

  // Buscar el producto en el menú
  for (const categoria in menuData) {
    for (const producto of menuData[categoria]) {
      const nombreProducto = producto.name.toLowerCase();
      if (mensaje.includes(nombreProducto)) {
        return res.status(200).json({
          reply: `La pizza ${producto.name} cuesta $${producto.grande}.`,
        });
      }
    }
  }

  return res.status(200).json({
    reply: 'No anoté ese producto en el menú. Podés escribir por ejemplo: ¿Cuánto está la muzzarella?',
  });
}
