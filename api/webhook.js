import menuData from './menudata.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  const { Body, From } = req.body;
  const mensaje = Body?.toLowerCase().trim();

  if (!mensaje) {
    return res.status(200).json({ reply: 'No recibí ningún mensaje.' });
  }

  let respuesta = null;

  for (const categoria in menuData) {
    for (const producto of menuData[categoria]) {
      const nombre = producto.name.toLowerCase();
      if (mensaje.includes(nombre)) {
        respuesta = `La pizza ${producto.name} cuesta:\n• Chica $${producto.chica}\n• Grande $${producto.grande}\n• Gigante $${producto.gigante}`;
        break;
      }
    }
    if (respuesta) break;
  }

  if (!respuesta) {
    respuesta = 'No anoté ese producto en el menú. Podés escribir por ejemplo: ¿Cuánto está la Muzzarella?';
  }

  return res.status(200).send(`<Response><Message>${respuesta}</Message></Response>`);
}
