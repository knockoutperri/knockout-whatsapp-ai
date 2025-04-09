import menuData from './menuData.js';
import { MessagingResponse } from 'twilio/lib/twiml/MessagingResponse.js';

function normalizarTexto(texto) {
  return texto
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\w\s]/gi, '')
    .toLowerCase()
    .trim();
}

function getSaludo() {
  const hora = new Date().getHours();
  if (hora < 13) return 'Buen día';
  if (hora < 20.5) return 'Buenas tardes';
  return 'Buenas noches';
}

const delayPorCategoria = {
  pizzasComunes: '10 minutos',
  pizzasEspeciales: '10 minutos',
  pizzasRellenas: '20 a 25 minutos',
  milanesas: '15 minutos',
  tartas: '10 minutos',
  empanadas: '10 minutos',
  canastitas: '10 minutos',
  tortillas: '20 a 25 minutos',
  calzones: '20 a 25 minutos',
};

const linksImagenes = {
  pizzas: 'https://i.imgur.com/x4WZKXZ.jpg',
  milanesas: 'https://i.imgur.com/ZMZzPPW.jpg',
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).send('<Response><Message>Método no permitido</Message></Response>');
  }

  const twiml = new MessagingResponse();
  const { Body } = req.body;
  const mensajeOriginal = Body || '';
  const mensaje = normalizarTexto(mensajeOriginal);

  // Saludo inicial
  if (['hola', 'buenas', 'buen dia', 'buenos dias', 'buenas tardes', 'buenas noches'].some(s => mensaje.includes(s))) {
    const saludo = getSaludo();
    const msg = twiml.message();
    msg.body(`${saludo}, ¿querés ver el menú o ya sabés qué pedir?`);
    msg.addInteractiveMessage({
      type: 'button',
      body: 'Elegí una opción:',
      action: {
        buttons: [
          { type: 'reply', reply: { id: 'ver_menu', title: 'Ver menú' } },
          { type: 'reply', reply: { id: 'hacer_pedido', title: 'Quiero hacer un pedido' } }
        ]
      }
    });
    return res.status(200).send(twiml.toString());
  }

  // Mostrar menú completo
  if (mensaje.includes('ver menu') || mensaje.includes('menu')) {
    const msg = twiml.message();
    msg.body('Acá tenés el menú completo:');
    msg.media(linksImagenes.pizzas);
    msg.media(linksImagenes.milanesas);
    return res.status(200).send(twiml.toString());
  }

  // Categorías con imagen
  if (mensaje.includes('pizza')) {
    const msg = twiml.message();
    msg.body('Sí, tenemos muchas pizzas. Te dejo el menú:');
    msg.media(linksImagenes.pizzas);
    return res.status(200).send(twiml.toString());
  }

  if (mensaje.includes('milanesa') || mensaje.includes('pixanesa')) {
    const msg = twiml.message();
    msg.body('Sí, tenemos estas milanesas y más:');
    msg.media(linksImagenes.milanesas);
    return res.status(200).send(twiml.toString());
  }

  // Tartas
  if (mensaje.includes('tarta')) {
    const lista = menuData.tartas.map(t => `• ${t.name} - $${t.precio}`).join('\n');
    return res.status(200).send(`<Response><Message>Sí, tenemos estas tartas:\n${lista}</Message></Response>`);
  }

  // Tortillas
  if (mensaje.includes('tortilla')) {
    const lista = menuData.tortillas.map(t => `• ${t.name} - $${t.precio}`).join('\n');
    return res.status(200).send(`<Response><Message>Sí, tenemos estas tortillas:\n${lista}</Message></Response>`);
  }

  // Empanadas
  if (mensaje.includes('empanada')) {
    const cantidades = {};
    let total = 0;
    for (const emp of menuData.empanadas) {
      const nombre = normalizarTexto(emp.name);
      if (mensaje.includes(nombre)) {
        const coincidencias = mensaje.match(new RegExp(`(\\d+)\\s+(de\\s+)?${nombre}`, 'gi'));
        if (coincidencias) {
          for (const c of coincidencias) {
            const cantidad = parseInt(c.match(/\d+/)[0]);
            cantidades[emp.name] = (cantidades[emp.name] || 0) + cantidad;
            total += cantidad;
          }
        }
      }
    }

    if (mensaje.includes('empanada de carne') && !mensaje.includes('cuchillo') && !mensaje.includes('picada')) {
      return res.status(200).send('<Response><Message>¿Empanada de carne picada o carne a cuchillo?</Message></Response>');
    }

    if (total > 0) {
      let texto = `Llevás ${total} empanadas:\n`;
      for (const [nombre, cant] of Object.entries(cantidades)) {
        texto += `• ${cant} de ${nombre}\n`;
      }

      if (total >= 12) {
        texto += `\nTotal: $20000 (precio por docena).`;
      } else {
        texto += `\nTotal: $${total * 1800}`;
      }

      const msg = twiml.message();
      msg.body(`${texto}\n¿Querés agregar algo más al pedido?`);
      msg.addInteractiveMessage({
        type: 'button',
        body: '¿Agregás algo más?',
        action: {
          buttons: [
            { type: 'reply', reply: { id: 'agregar_si', title: 'Sí' } },
            { type: 'reply', reply: { id: 'agregar_no', title: 'No' } }
          ]
        }
      });
      return res.status(200).send(twiml.toString());
    }

    return res.status(200).send('<Response><Message>Las empanadas cuestan $1800 cada una o $20000 la docena.</Message></Response>');
  }

  // Producto exacto (pizza, milanesa, etc.)
  for (const categoria in menuData) {
    for (const producto of menuData[categoria]) {
      const nombreNormalizado = normalizarTexto(producto.name);
      if (mensaje.includes(nombreNormalizado)) {
        let respuesta = `La ${producto.name} cuesta`;

        if (producto.chica && producto.grande && producto.gigante) {
          respuesta += `:\n• Chica $${producto.chica}\n• Grande $${producto.grande}\n• Gigante $${producto.gigante}`;
        } else if (producto.chica && producto.mediana && producto.grande) {
          respuesta += `:\n• Chica $${producto.chica}\n• Mediana $${producto.mediana}\n• Grande $${producto.grande}`;
        } else if (producto.precio) {
          respuesta += ` $${producto.precio}`;
        }

        const demora = delayPorCategoria[categoria];
        if (demora) respuesta += `.\nDemora estimada: ${demora}.`;

        return res.status(200).send(`<Response><Message>${respuesta}</Message></Response>`);
      }
    }
  }

  return res.status(200).send('<Response><Message>No encontré eso en el menú. ¿Querés ver el menú?</Message></Response>');
}
