import menuData from './menudata.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Content-Type', 'text/xml');
    return res.send(`<Response><Message>Método no permitido</Message></Response>`);
  }

  const { Body } = req.body;
  const mensaje = Body?.toLowerCase().trim();

  if (!mensaje) {
    res.setHeader('Content-Type', 'text/xml');
    return res.send(`<Response><Message>No recibí ningún mensaje.</Message></Response>`);
  }

  for (const categoria in menuData) {
    for (const producto of menuData[categoria]) {
      if (mensaje.includes(producto.name.toLowerCase())) {
        res.setHeader('Content-Type', 'text/xml');
        return res.send(
          `<Response><Message>La pizza ${producto.name} cuesta $${producto.chica}.</Message></Response>`
        );
      }
    }
  }

  res.setHeader('Content-Type', 'text/xml');
  return res.send(
    `<Response><Message>No anoté ese producto en el menú. Podés escribir por ejemplo: ¿Cuánto está la muzzarella?</Message></Response>`
  );
}
