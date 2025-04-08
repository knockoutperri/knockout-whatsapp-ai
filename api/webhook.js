import menuData from './menuData.js';
import Fuse from 'fuse.js';

function normalizarTexto(texto) {
  return texto
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\w\s]/gi, '')
    .toLowerCase()
    .trim();
}

const fuseOptions = {
  keys: ['name'],
  threshold: 0.4,
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res
      .status(405)
      .send('<Response><Message>Método no permitido</Message></Response>');
  }

  const { Body } = req.body;
  const mensajeOriginal = Body || '';
  const mensaje = normalizarTexto(mensajeOriginal);

  // Saludo básico
  const saludos = ['hola', 'buenas', 'buenas noches', 'buen dia', 'buenos dias'];
  if (saludos.some(saludo => mensaje.includes(saludo))) {
    return res
      .status(200)
      .send('<Response><Message>¡Hola! ¿En qué te puedo ayudar?</Message></Response>');
  }

  // Distinguir entre pizza y milanesa si se llaman igual
  const nombresAmbiguos = ['napolitana', 'fugazzeta', 'roquefort', 'calabresa'];
  for (const nombre of nombresAmbiguos) {
    if (mensaje.includes(nombre)) {
      if (mensaje.includes('milanesa') || mensaje.includes('pixanesa')) {
        const fuse = new Fuse(menuData.milanesas, fuseOptions);
        const resultado = fuse.search(mensaje);
        if (resultado.length > 0) {
          const producto = resultado[0].item;
          return res.status(200).send(
            `<Response><Message>${producto.name}:\n• Chica $${producto.chica}\n• Mediana $${producto.mediana}\n• Grande $${producto.grande}\n¿La querés de carne o de pollo?</Message></Response>`
          );
        }
      } else if (mensaje.includes('pizza')) {
        const fuse = new Fuse(menuData.pizzasComunes.concat(menuData.pizzasEspeciales), fuseOptions);
        const resultado = fuse.search(mensaje);
        if (resultado.length > 0) {
          const producto = resultado[0].item;
          return res.status(200).send(
            `<Response><Message>La pizza ${producto.name} cuesta:\n• Chica $${producto.chica}\n• Grande $${producto.grande}\n• Gigante $${producto.gigante}</Message></Response>`
          );
        }
      } else {
        return res.status(200).send(
          `<Response><Message>¿Querías una pizza o una milanesa ${nombre}?</Message></Response>`
        );
      }
    }
  }

  // Buscar en todas las categorías
  for (const categoria in menuData) {
    const fuse = new Fuse(menuData[categoria], fuseOptions);
    const resultado = fuse.search(mensaje);

    if (resultado.length > 0) {
      const producto = resultado[0].item;

      if (categoria === 'milanesas') {
        return res.status(200).send(
          `<Response><Message>${producto.name}:\n• Chica $${producto.chica}\n• Mediana $${producto.mediana}\n• Grande $${producto.grande}\n¿La querés de carne o de pollo?</Message></Response>`
        );
      }

      if (producto.chica && producto.grande && producto.gigante) {
        return res.status(200).send(
          `<Response><Message>La pizza ${producto.name} cuesta:\n• Chica $${producto.chica}\n• Grande $${producto.grande}\n• Gigante $${producto.gigante}</Message></Response>`
        );
      } else if (producto.grande) {
        return res.status(200).send(
          `<Response><Message>La ${producto.name} cuesta $${producto.grande}.</Message></Response>`
        );
      } else if (producto.precio) {
        return res.status(200).send(
          `<Response><Message>La ${producto.name} cuesta $${producto.precio}.</Message></Response>`
        );
      }
    }
  }

  // No encontró el producto
  return res.status(200).send(
    '<Response><Message>No encontré ese producto en el menú. Podés escribir por ejemplo: ¿Cuánto está la muzzarella?</Message></Response>'
  );
}
