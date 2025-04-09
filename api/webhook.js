import pkg from 'twilio/lib/twiml/MessagingResponse.js';
const { MessagingResponse } = pkg;

import menuData from './menuData.js';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

function normalizar(texto) {
  return texto
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
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

function contarEmpanadas(mensaje) {
  const tipos = menuData.empanadas.map(e => e.name.toLowerCase());
  const conteo = {};
  let total = 0;

  tipos.forEach(tipo => {
    const coincidencia = mensaje.match(new RegExp(`(\d+)\s+(de\s+)?${tipo}`, 'i'));
    if (coincidencia) {
      const cantidad = parseInt(coincidencia[1]);
      conteo[tipo] = cantidad;
      total += cantidad;
    }
  });

  return { total, conteo };
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    const twiml = new MessagingResponse();
    twiml.message('Método no permitido.');
    return res.status(405).send(twiml.toString());
  }

  const { Body } = req.body;
  const mensajeOriginal = Body || '';
  const mensaje = normalizar(mensajeOriginal);
  const twiml = new MessagingResponse();

  // Saludo inicial
  const saludos = ['hola', 'buenas', 'buen dia', 'buenos dias', 'buenas tardes', 'buenas noches'];
  if (saludos.some(s => mensaje.includes(s))) {
    const saludo = obtenerSaludo();
    const respuesta = twiml.message(`${saludo}! ¿Querés ver el menú o ya sabés qué pedir?`);
    respuesta.buttons()
      .button({ body: 'Ver menú' })
      .button({ body: 'Quiero hacer un pedido' });
    return res.status(200).send(twiml.toString());
  }

  // Manejo de empanadas
  if (mensaje.includes('empanada') || menuData.empanadas.some(e => mensaje.includes(normalizar(e.name)))) {
    const { total, conteo } = contarEmpanadas(mensaje);

    if (mensaje.includes('empanada de carne') && !mensaje.includes('carne a cuchillo')) {
      twiml.message('¿Empanada de carne picada o carne a cuchillo?');
      return res.status(200).send(twiml.toString());
    }

    if (mensaje.includes('picante')) {
      twiml.message('Ninguna empanada de carne es picante. Son todas suaves y sabrosas.');
      return res.status(200).send(twiml.toString());
    }

    if (total > 0) {
      let respuesta = `Perfecto, tenemos ${total} empanadas:
`;
      for (const tipo in conteo) {
        respuesta += `• ${conteo[tipo]} de ${tipo}\n`;
      }

      if (total === 12) {
        respuesta += `\nTotal: $20000 (docena)`;
      } else {
        respuesta += `\nTotal: $${total * 1800}`;
      }

      const boton = twiml.message(respuesta);
      boton.buttons()
        .button({ body: 'Sí, agregar algo más' })
        .button({ body: 'No, confirmar pedido' });
      return res.status(200).send(twiml.toString());
    }
  }

  // Categorías con imágenes o listado
  const categorias = {
    'pizzas': {
      productos: menuData.pizzasComunes.concat(menuData.pizzasEspeciales),
      imagen: 'https://knockout-imgs.s3.amazonaws.com/menus/pizzas_y_fainas.png'
    },
    'milanesas': {
      productos: menuData.milanesas,
      imagen: 'https://knockout-imgs.s3.amazonaws.com/menus/milanesas_y_tartas.png'
    },
    'tartas': { productos: menuData.tartas },
    'tortillas': { productos: menuData.tortillas },
    'faina': { productos: menuData.fainas },
    'calzones': { productos: menuData.calzones }
  };

  for (const categoria in categorias) {
    if (mensaje.includes(categoria)) {
      const data = categorias[categoria];
      if (data.imagen) {
        const respuesta = twiml.message(`Sí, estas son nuestras ${categoria}:`);
        respuesta.media(data.imagen);
        return res.status(200).send(twiml.toString());
      } else {
        const lista = data.productos.map(p => `${p.name} - $${p.precio}`).join('\n');
        twiml.message(`Estas son nuestras ${categoria}:
${lista}`);
        return res.status(200).send(twiml.toString());
      }
    }
  }

  twiml.message('No entendí bien tu mensaje. Podés escribir por ejemplo "quiero una napolitana" o "ver menú".');
  return res.status(200).send(twiml.toString());
}
