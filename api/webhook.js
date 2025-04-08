import menuData from './menuData.js';

function normalizarTexto(texto) {
  return texto
    .normalize('NFD')
    .replace(/[̀-\u036f]/g, '')
    .replace(/[^\w\s]/gi, '')
    .toLowerCase()
    .trim();
}

// Variable para almacenar el contexto de la conversación actual
let ultimoProductoMencionado = null;

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).send('<Response><Message>Método no permitido</Message></Response>');
  }

  const { Body } = req.body;
  const mensajeOriginal = Body || '';
  const mensaje = normalizarTexto(mensajeOriginal);

  const saludos = ['hola', 'buenas', 'buenas noches', 'buen dia', 'buenos dias'];
  if (saludos.some(saludo => mensaje.includes(saludo))) {
    return res.status(200).send('<Response><Message>¡Hola! ¿En qué te puedo ayudar?</Message></Response>');
  }

  // Si detecta una palabra ambigua como "napolitana", pregunta y guarda el producto
  const ambiguos = ['napolitana', 'fugazzeta', 'roquefort'];
  if (ambiguos.some(amb => mensaje.includes(amb))) {
    ultimoProductoMencionado = ambiguos.find(amb => mensaje.includes(amb)); // Guardar "napolitana", "fugazzeta" o "roquefort"
    return res.status(200).send('<Response><Message>¿Te referís a pizza o a milanesa?</Message></Response>');
  }

  // Si el cliente responde con "milanesa" o "pizza" y hay un producto guardado
  if (ultimoProductoMencionado && (mensaje.includes('milanesa') || mensaje.includes('pizza'))) {
    const tipoProducto = mensaje.includes('milanesa') ? 'milanesa' : 'pizza';
    // Busca en la categoría correspondiente
    const categoria = tipoProducto === 'milanesa' ? menuData.milanesas : menuData.pizzasComunes.concat(menuData.pizzasEspeciales, menuData.pizzasRellenas);
    for (const producto of categoria) {
      const nombreNormalizado = normalizarTexto(producto.name);
      if (nombreNormalizado.includes(ultimoProductoMencionado)) {
        // Encontrado, responder con el detalle del producto
        if (tipoProducto === 'milanesa') {
          return res.status(200).send(
            `<Response><Message>La milanesa ${producto.name} cuesta:\n• Chica $${producto.chica}\n• Mediana $${producto.mediana}\n• Grande $${producto.grande}</Message></Response>`
          );
        } else {
          return res.status(200).send(
            `<Response><Message>La pizza ${producto.name} cuesta:\n• Chica $${producto.chica}\n• Grande $${producto.grande}\n• Gigante $${producto.gigante}</Message></Response>`
          );
        }
      }
    }
    // Si no encuentra el producto, responde con un mensaje genérico
    return res.status(200).send('<Response><Message>No encontré ese producto en el menú.</Message></Response>');
  }

  // Borrar el último producto mencionado si el mensaje es diferente
  ultimoProductoMencionado = null;

  // Lógica para buscar en tartas
  for (const tarta of menuData.tartas) {
    const nombreNormalizado = normalizarTexto(tarta.name);
    if (mensaje.includes(nombreNormalizado)) {
      return res.status(200).send(
        `<Response><Message>La ${tarta.name} cuesta $${tarta.precio}.</Message></Response>`
      );
    }
  }

  // Lógica para buscar en tortillas
  for (const tortilla of menuData.tortillas) {
    const nombreNormalizado = normalizarTexto(tortilla.name);
    if (mensaje.includes(nombreNormalizado)) {
      return res.status(200).send(
        `<Response><Message>La ${tortilla.name} cuesta $${tortilla.precio}.</Message></Response>`
      );
    }
  }

  // Si no encuentra nada
  return res.status(200).send('<Response><Message>No encontré ese producto en el menú. Podés escribir por ejemplo: ¿Cuánto está la muzzarella?</Message></Response>');
}
