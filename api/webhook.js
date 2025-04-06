import menudata from './menudata.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  const { Body } = req.body;
  const mensaje = Body?.toLowerCase().trim();

  let respuesta = 'No anoté ese producto en el menú. Podés escribir por ejemplo: ¿Cuánto está la muzzarella?';

  for (const categoria in menudata) {
    for (const producto of menudata[categoria]) {
      if (mensaje.includes(producto.name.toLowerCase())) {
        respuesta = `${producto.name}: $${producto.grande}`;
        break;
      }
    }
  }

  return res.status(200).json({
    messages: [
      {
        type: 'text',
        text: {
          body: respuesta,
        },
      },
    ],
  });
}
