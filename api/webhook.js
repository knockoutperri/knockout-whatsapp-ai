import twilio from 'twilio';
const MessagingResponse = twilio.twiml.MessagingResponse;
import menuData from './menuData.js';

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

function crearBotones(twiml, texto, opciones = []) {
  const message = twiml.message();
  message.body(texto);
  const interactive = message.interactive('button');
  opciones.forEach(opcion => {
    interactive.button({ type: 'reply', reply: { id: opcion, title: opcion } });
  });
}

function obtenerDemora(nombreProducto) {
  const normales = ['pizza', 'empanada', 'tarta', 'canastita'];
  const medianas = ['milanesa'];
  const largas = ['rellena', 'calzon', 'tortilla'];
  const texto = normalizarTexto(nombreProducto);

  if (largas.some(e => texto.includes(e))) return '20 a 25 minutos';
  if (medianas.some(e => texto.includes(e))) return '15 minutos';
  if (normales.some(e => texto.includes(e))) return '10 minutos';
  return null;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).send('Método no permitido');
  }

  const { Body } = req.body;
  const mensajeOriginal = Body || '';
  const mensaje = normalizarTexto(mensajeOriginal);
  const twiml = new MessagingResponse();

  // Saludo inicial con botones
  const saludos = ['hola', 'buenas', 'buen dia', 'buenos dias', 'buenas tardes', 'buenas noches'];
  if (saludos.some(s => mensaje.includes(s))) {
    crearBotones(twiml, `${obtenerSaludo()}, ¿querés ver el menú o ya sabés qué pedir?`, ['Ver menú', 'Quiero hacer un pedido']);
    return res.status(200).send(twiml.toString());
  }

  // Envío de menú por imagen
  if (mensaje.includes('pizza')) {
    twiml.message().media('https://i.imgur.com/HqKEm1m.jpg'); // Pizzas, calzones, fainá
    return res.status(200).send(twiml.toString());
  }

  if (mensaje.includes('milanesa') || mensaje.includes('empanada') || mensaje.includes('tarta') || mensaje.includes('canastita') || mensaje.includes('bebida') || mensaje.includes('tortilla')) {
    twiml.message().media('https://i.imgur.com/eyOZgyH.jpg'); // Milanesas, tartas, tortillas, empanadas, canastitas
    return res.status(200).send(twiml.toString());
  }

  // Consulta por categoría
  const categorias = {
    tortillas: menuData.tortillas,
    tartas: menuData.tartas,
    milanesas: menuData.milanesas,
    fainas: menuData.fainas,
    calzones: menuData.calzones,
    canastitas: menuData.canastitas,
    bebidas: menuData.bebidas
  };

  for (const cat in categorias) {
    if (mensaje.includes(cat.slice(0, -1))) {
      const lista = categorias[cat].map(p => `${p.name} - $${p.precio || p.grande}`).join('\n');
      twiml.message(`Sí, tenemos estas opciones:\n${lista}`);
      return res.status(200).send(twiml.toString());
    }
  }

  // Empanadas - cálculo por docena
  const empanadas = menuData.empanadas.map(e => normalizarTexto(e.name));
  const pedido = mensaje.split(' ').filter(p => empanadas.some(e => p.includes(e)));
  if (mensaje.includes('empanada')) {
    const cantidades = mensaje.match(/\d+/g)?.map(n => parseInt(n)) || [];
    const total = cantidades.reduce((a, b) => a + b, 0);
    let respuesta = `Tenemos ${total} empanadas.`;
    if (total === 12) {
      respuesta += `\nPrecio por docena: $20000.`;
    } else {
      respuesta += `\nPrecio por unidad: $1800 cada una.`;
    }
    respuesta += `\n¿Querés agregar algo más al pedido?`;
    crearBotones(twiml, respuesta, ['Sí', 'No']);
    return res.status(200).send(twiml.toString());
  }

  // Carne o cuchillo
  if (mensaje.includes('empanada de carne')) {
    twiml.message('¿La empanada de carne la querés de carne picada o de carne a cuchillo?');
    return res.status(200).send(twiml.toString());
  }

  if (mensaje.includes('carne picante')) {
    twiml.message('Ninguna empanada es picante. Todas son suaves, pero sabrosas.');
    return res.status(200).send(twiml.toString());
  }

  // Respuesta por producto
  for (const categoria in menuData) {
    for (const producto of menuData[categoria]) {
      const nombre = normalizarTexto(producto.name);
      if (mensaje.includes(nombre)) {
        let respuesta = `✅ ${producto.name}:\n`;
        if (producto.chica || producto.mediana || producto.grande) {
          if (producto.chica) respuesta += `• Chica: $${producto.chica}\n`;
          if (producto.mediana) respuesta += `• Mediana: $${producto.mediana}\n`;
          if (producto.grande) respuesta += `• Grande: $${producto.grande}\n`;
        } else {
          respuesta += `• Precio: $${producto.precio}\n`;
        }

        const demora = obtenerDemora(producto.name);
        if (demora) {
          respuesta += `🕒 Tiempo estimado: ${demora}`;
        }

        twiml.message(respuesta.trim());
        return res.status(200).send(twiml.toString());
      }
    }
  }

  // Pedido general
  if (mensaje.includes('hacer un pedido') || mensaje.includes('quiero pedir') || mensaje.includes('encargar')) {
    twiml.message('Perfecto, decime qué querés pedir y te paso el total.');
    return res.status(200).send(twiml.toString());
  }

  // Respuesta genérica si no reconoce nada
  twiml.message('Disculpá, no entendí bien. ¿Querés ver el menú o hacer un pedido?');
  return res.status(200).send(twiml.toString());
}
