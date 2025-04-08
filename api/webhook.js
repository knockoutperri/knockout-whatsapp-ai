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

  // Recorrer todas las categorías del menú
  for (const categoria in menuData) {
    for (const producto of menuData[categoria]) {
      const nombreProducto = producto.name?.toLowerCase();

      if (nombreProducto && mensaje.includes(nombreProducto)) {
        // Si tiene tamaño "grande"
        if (producto.grande) {
          return res.status(200).json({
            reply: `${producto.name}: $${producto.grande}`,
          });
        }

        // Si tiene campo "precio" (como fainá o calzón)
        if (producto.precio) {
          return res.status(200).json({
            reply: `${producto.name}: $${producto.precio}`,
          });
        }
      }
    }
  }

  return res.status(200).json({
    reply: 'No anoté ese producto en el menú. Podés escribir por ejemplo: ¿Cuánto está la Muzzarella?',
  });
}
