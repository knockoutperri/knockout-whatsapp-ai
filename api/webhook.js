import menuData from './menudata.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).send('Método no permitido');
  }

  const { Body } = req.body;
  const mensaje = Body?.toLowerCase().trim();

  if (!mensaje) {
    return res.setHeader('Content-Type', 'text/plain').status(200).send('No recibí ningún mensaje.');
  }

  const saludos = ['hola', 'buenas', 'buenas noches', 'buenas tardes', 'buen día', 'buenos días'];
  if (saludos.some(saludo => mensaje.includes(saludo))) {
    return res.setHeader('Content-Type', 'text/plain').status(200).send(
      '¡Hola! ¿En qué te puedo ayudar? Podés preguntarme por una pizza, por ejemplo: "¿Cuánto cuesta la napolitana?"'
    );
  }

  for (const categoria in menuData) {
    for (const producto of menuData[categoria]) {
      if (mensaje.includes(producto.name.toLowerCase())) {
        return res.setHeader('Content-Type', 'text/plain').status(200).send(
          `La pizza ${producto.name} cuesta:\n• Chica $${producto.chica}\n• Grande $${producto.grande}\n• Gigante $${producto.gigante}`
        );
      }
    }
  }

  return res.setHeader('Content-Type', 'text/plain').status(200).send(
    'No anoté ese producto en el menú. Podés escribir por ejemplo: ¿Cuánto está la muzzarella?'
  );
}
