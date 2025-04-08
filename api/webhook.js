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

function buscarProducto(mensaje, productos) {
  const fuse = new Fuse(productos, fuseOptions);
  const resultado = fuse.search(mensaje);
  return resultado.length > 0 ? resultado[0].item : null;
}

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

  const esMilanesa = mensaje.includes('milanesa') || mensaje.includes('pixanesa');

  if (esMilanesa) {
    const gusto = buscarProducto(mensaje, menuData.milanesas);
    if (gusto) {
      return res.status(200).send(`<Response><Message>La ${gusto.name} cuesta:
• Chica $${gusto.chica}
• Mediana $${gusto.mediana}
• Grande $${gusto.grande}

¿Querés que sea de carne o de pollo?</Message></Response>`);
    }
  } else {
    for (const categoria in menuData) {
      if (categoria === 'milanesas') continue;
      const producto = buscarProducto(mensaje, menuData[categoria]);
      if (producto) {
        if (producto.chica && producto.grande && producto.gigante) {
          return res.status(200).send(`<Response><Message>La pizza ${producto.name} cuesta:
• Chica $${producto.chica}
• Grande $${producto.grande}
• Gigante $${producto.gigante}</Message></Response>`);
        } else if (producto.grande) {
          return res.status(200).send(`<Response><Message>La ${producto.name} cuesta $${producto.grande}.</Message></Response>`);
        } else if (producto.precio) {
          return res.status(200).send(`<Response><Message>La ${producto.name} cuesta $${producto.precio}.</Message></Response>`);
        }
      }
    }
  }

  return res.status(200).send('<Response><Message>No encontré ese producto en el menú. Podés escribir por ejemplo: ¿Cuánto está la muzzarella?</Message></Response>');
}
