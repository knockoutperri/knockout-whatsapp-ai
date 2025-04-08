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

  // Buscar en pizzas comunes, especiales y rellenas
  const categoriasConTamanios = ['pizzasComunes', 'pizzasEspeciales', 'pizzasRellenas'];

  for (const categoria of categoriasConTamanios) {
    for (const producto of menuData[categoria]) {
      if (mensaje.includes(producto.name.toLowerCase())) {
        let respuesta = `La pizza ${producto.name} cuesta:`;
        if (producto.chica) respuesta += `\n• Chica $${producto.chica}`;
        if (producto.grande) respuesta += `\n• Grande $${producto.grande}`;
        if (producto.gigante) respuesta += `\n• Gigante $${producto.gigante}`;
        if (producto.paraCocinar) respuesta += `\n• Para Cocinar $${producto.paraCocinar}`;
        return res.status(200).json({ reply: respuesta });
      }
    }
  }

  // Buscar en fainas
  for (const faina of menuData.fainas) {
    if (mensaje.includes(faina.name.toLowerCase()))
