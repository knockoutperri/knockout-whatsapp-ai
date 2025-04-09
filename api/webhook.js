import pkg from 'twilio/lib/twiml/MessagingResponse.js';
const { MessagingResponse } = pkg;

import menuData from './menuData.js';
import Fuse from 'fuse.js';

const fuseOptions = {
  keys: ['name'],
  threshold: 0.4,
};

function normalizarTexto(texto) {
  return texto
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\w\s]/gi, '')
    .toLowerCase()
    .trim();
}

function obtenerSaludo() {
  const hora = new Date().getHours();
  if (hora < 13) return 'Buen día';
  if (hora < 20.5) return 'Buenas tardes';
  return 'Buenas noches';
}

function crearBotones(res, texto, botones) {
  const twiml = new MessagingResponse();
  const msg = twiml.message();
  msg.body(texto);
  const interactive = msg.addChild('Interactive');
  interactive.addChild('ButtonReply').body(botones[0]).attribute('id', 'opcion_1');
  interactive.addChild('ButtonReply').body(botones[1]).attribute('id', 'opcion_2');
  res.set('Content-Type', 'text/xml');
  return res.status(200).send(twiml.toString());
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).send('<Response><Message>Método no permitido</Message></Response>');
  }

  const { Body } = req.body;
  const mensajeOriginal = Body || '';
  const mensaje = normalizarTexto(mensajeOriginal);

  // Saludo inicial
  const saludos = ['hola', 'buenas', 'buen dia', 'buenos dias', 'buenas tardes', 'buenas noches'];
  if (saludos.some(s => mensaje.includes(s))) {
    return crearBotones(res, `${obtenerSaludo()} 👋 ¿Querés ver el menú o ya sabés qué pedir?`, [
      'Ver el menú',
      'Quiero hacer un pedido',
    ]);
  }

  // Mostrar menú con imagen
  if (mensaje.includes('ver menu')) {
    const twiml = new MessagingResponse();
    const msg = twiml.message('Te dejo las imágenes del menú 👇');
    msg.media('https://link-de-tu-imagen-de-pizzas.com/pizzas.jpg');
    msg.media('https://link-de-tu-imagen-de-varios.com/otros.jpg');
    msg.body('¿Querés hacer un pedido ahora?');
    const buttons = msg.addChild('Interactive');
    buttons.addChild('ButtonReply').body('Sí, quiero hacer un pedido').attribute('id', 'hacer_pedido');
    buttons.addChild('ButtonReply').body('No por ahora').attribute('id', 'no_pedido');
    res.set('Content-Type', 'text/xml');
    return res.status(200).send(twiml.toString());
  }

  // Categorías → si preguntan por ejemplo "tenés tortillas", responder qué hay
  const categorias = {
    'tortilla': {
      lista: menuData.tortillas,
      respuesta: 'Sí, tenemos estas tortillas:\n',
    },
    'tarta': {
      lista: menuData.tartas,
      respuesta: 'Sí, tenemos estas tartas:\n',
    },
    'pizza rellena': {
      lista: menuData.pizzasRellenas,
      respuesta: 'Sí, tenemos estas pizzas rellenas:\n',
    },
  };

  for (const [clave, { lista, respuesta }] of Object.entries(categorias)) {
    if (mensaje.includes(clave)) {
      const listado = lista.map(p => `• ${p.name} $${p.precio || p.grande}`).join('\n');
      return res.status(200).send(`<Response><Message>${respuesta}${listado}</Message></Response>`);
    }
  }

  // Si pregunta "tenés pizzas" o "tenés milanesas", mandamos imagen
  if (mensaje.includes('pizza')) {
    const twiml = new MessagingResponse();
    const msg = twiml.message('Sí, tenemos muchas variedades de pizzas 🍕');
    msg.media('https://link-de-tu-imagen-de-pizzas.com/pizzas.jpg');
    return res.status(200).send(twiml.toString());
  }

  if (mensaje.includes('milanesa')) {
    const twiml = new MessagingResponse();
    const msg = twiml.message('Sí, tenemos muchas milanesas 🥩');
    msg.media('https://link-de-tu-imagen-de-varios.com/otros.jpg');
    return res.status(200).send(twiml.toString());
  }

  // Empanadas – si dicen “carne” sin especificar
  if (mensaje.includes('empanada de carne') || mensaje.includes('empanada carne')) {
    return res.status(200).send(
      `<Response><Message>¿Querés empanada de carne picada o de carne a cuchillo?</Message></Response>`
    );
  }

  if (mensaje.includes('carne picante')) {
    return res.status(200).send(
      `<Response><Message>No tenemos empanadas picantes. Las de carne son suaves y sabrosas 😊</Message></Response>`
    );
  }

  // Precio de empanadas
  if (mensaje.includes('cuanto') && mensaje.includes('empanada')) {
    return res.status(200).send(
      `<Response><Message>Las empanadas cuestan $1800 c/u. La docena cuesta $20000.</Message></Response>`
    );
  }

  // Demora por producto
  const demoras = {
    pizzasComunes: 10,
    pizzasEspeciales: 10,
    fainas: 10,
    calzones: 25,
    milanesas: 15,
    tartas: 10,
    tortillas: 25,
    empanadas: 10,
    canastitas: 10,
    pizzasRellenas: 25,
  };

  // Buscar el producto con Fuzzy
  const fuse = new Fuse(
    Object.values(menuData).flat(),
    fuseOptions
  );

  const resultado = fuse.search(mensaje)[0];

  if (resultado) {
    const producto = resultado.item;
    let respuesta = `✅ ${producto.name}:\n`;

    if (producto.chica && producto.grande && producto.gigante) {
      respuesta += `• Chica: $${producto.chica}\n• Grande: $${producto.grande}\n• Gigante: $${producto.gigante}`;
    } else if (producto.grande && producto.mediana && producto.chica) {
      respuesta += `• Chica: $${producto.chica}\n• Mediana: $${producto.mediana}\n• Grande: $${producto.grande}`;
    } else if (producto.precio) {
      respuesta += `$${producto.precio}`;
    } else {
      respuesta += `Precio: $${producto.grande}`;
    }

    // Buscar demora según categoría
    for (const [categoria, minutos] of Object.entries(demoras)) {
      if (menuData[categoria].some(p => p.name === producto.name)) {
        respuesta += `\n⏱️ Demora estimada: ${minutos} minutos.`;
        break;
      }
    }

    respuesta += `\n¿Querés agregar algo más al pedido?`;

    const twiml = new MessagingResponse();
    const msg = twiml.message(respuesta);
    const buttons = msg.addChild('Interactive');
    buttons.addChild('ButtonReply').body('Sí').attribute('id', 'agregar_si');
    buttons.addChild('ButtonReply').body('No').attribute('id', 'agregar_no');
    res.set('Content-Type', 'text/xml');
    return res.status(200).send(twiml.toString());
  }

  // Si no se encontró nada
  return res
    .status(200)
    .send('<Response><Message>No encontré ese producto. ¿Podés escribirlo de otra forma?</Message></Response>');
}
