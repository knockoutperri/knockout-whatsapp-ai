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

  // Respuesta si el cliente dice hola o algo parecido
  const saludos = ['hola', 'buenas', 'holaaa', 'buenas noches', 'buenos días'];
  if (saludos.some(s => mensaje.includes(s))) {
    return res.status(200).json({
      reply: '¡Hola! 😊 ¿Qué querés pedir hoy? Podés preguntarme el precio de una pizza, empanada o lo que necesites.',
    });
  }

  // Buscar coincidencia exacta con algún producto del menú
  for (const categoria in menuData) {
    for (const producto of menuData[categoria]) {
      if (mensaje.includes(producto.name.toLowerCase())) {
        const precio = producto.grande ?? producto.precio;
        return res.status(200).json({
          reply: `${producto.name}: $${precio}`,
        });
      }
    }
  }

  return res.status(200).json({
    reply: 'No encontré ese producto en el menú. Podés escribir por ejemplo: ¿Cuánto está la Muzzarella?',
  });
}
