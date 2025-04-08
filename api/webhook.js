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

  try {
    for (const categoria in menuData) {
      const productos = menuData[categoria];

      for (const producto of productos) {
        if (!producto.name) continue;

        const nombreProducto = producto.name.toLowerCase();

        if (mensaje.includes(nombreProducto)) {
          if ('grande' in producto) {
            return res.status(200).json({
              reply: `${producto.name}: $${producto.grande}`,
            });
          }

          if ('precio' in producto) {
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

  } catch (error) {
    return res.status(500).json({ error: 'Error interno del servidor.' });
  }
}
