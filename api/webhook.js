import menudata from './menudata.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  const { Body } = req.body;
  const mensaje = Body?.toLowerCase().trim();

  if (!mensaje) {
    return res.status(200).json({ reply: 'No recibí ningún mensaje.' });
  }

  // Buscar coincidencia exacta con algún producto del menú
  for (const categoria in menuData) {
    for (const producto of menuData[categoria]) {
      if (mensaje.includes(producto.name.toLowerCase())) {
        return res.status(200).json({
          reply: `${producto.name}: $${producto.grande}`,
        });
      }
    }
  }

  return res.status(200).json({
    reply: 'No anoté ese producto en el menú. Podés escribir por ejemplo: ¿Cuánto está la muzzarella?',
  });
}
