import { getChatCompletion } from './openaiUtils.js';
import menuData from './menuData.js';

// Utilidad para normalizar texto
function normalizarTexto(texto) {
  return texto
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\w\s]/gi, '')
    .toLowerCase()
    .trim();
}

let ultimoProductoAmbiguo = null;
let seMostroMenu = false;

function getSaludoPorHora() {
  const ahora = new Date();
  const hora = ahora.getHours();

  if (hora < 13) return 'Buen día';
  if (hora < 20.5) return 'Buenas tardes';
  return 'Buenas noches';
}

function esPalabraAmbigua(texto) {
  const ambiguos = ['napolitana', 'fugazzeta', 'roquefort', '3 quesos', '4 quesos', 'rúcula', 'parmesano'];
  return ambiguos.includes(normalizarTexto(texto));
}

function generarRespuestaProducto(nombreProducto, tipo) {
  const productos = tipo === 'milanesa'
    ? menuData.milanesas
    : [...menuData.pizzasComunes, ...menuData.pizzasEspeciales, ...menuData.pizzasRellenas];

  const encontrado = productos.find(p => normalizarTexto(p.name).includes(normalizarTexto(nombreProducto)));
  if (!encontrado) return null;

  if (tipo === 'milanesa') {
    return `Perfecto, milanesa ${encontrado.name}. Los precios son:
• Chica $${encontrado.chica}
• Mediana $${encontrado.mediana}
• Grande $${encontrado.grande}`;
  } else {
    return `Perfecto, pizza ${encontrado.name}. Los precios son:
• Chica $${encontrado.chica}
• Grande $${encontrado.grande}
• Gigante $${encontrado.gigante}`;
  }
}

function contienePalabra(mensaje, lista) {
  return lista.some(p => mensaje.includes(normalizarTexto(p)));
}

function generarMensajeMenu() {
  return 'Te paso una imagen del menú para que puedas verla tranquilo:';
}

// URL de las imágenes
const imagenPizzas = 'https://i.imgur.com/YxDHo49.jpeg';
const imagenMilanesas = 'https://i.imgur.com/bPFMK3o.jpeg';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).send('<Response><Message>Método no permitido</Message></Response>');
  }

  const { Body, From } = req.body;
  const mensajeOriginal = Body || '';
  const mensaje = normalizarTexto(mensajeOriginal);
  const saludo = getSaludoPorHora();

  // SALUDO INICIAL
  if (mensaje === 'hola' || mensaje === 'buenas' || mensaje === 'buen dia' || mensaje === 'buenas tardes' || mensaje === 'buenas noches') {
    seMostroMenu = false;
    return res.status(200).send(`<Response><Message>Hola, ${saludo}. ¿En qué puedo ayudarte hoy?</Message></Response>`);
  }

  // MOSTRAR MENÚ SOLO UNA VEZ
  if (mensaje.includes('ver el menu') || mensaje.includes('menu') || mensaje.includes('ver precios')) {
    if (!seMostroMenu) {
      seMostroMenu = true;
      return res.status(200).send(`
<Response>
  <Message>${generarMensajeMenu()}</Message>
  <Message><Media>${imagenPizzas}</Media></Message>
  <Message><Media>${imagenMilanesas}</Media></Message>
</Response>`);
    } else {
      return res.status(200).send('<Response><Message>Ya te envié el menú, si querés te lo vuelvo a mandar.</Message></Response>');
    }
  }

  // CATEGORÍA MILANESAS
  if (mensaje.includes('milanesa')) {
    const lista = menuData.milanesas.map(p => `• ${p.name} (chica $${p.chica}, mediana $${p.mediana}, grande $${p.grande})`).join('\n');
    return res.status(200).send(`
<Response>
  <Message>Estas son las milanesas que tenemos:\n${lista}</Message>
  <Message><Media>${imagenMilanesas}</Media></Message>
</Response>`);
  }

  // PRODUCTO AMBIGUO
  if (esPalabraAmbigua(mensaje)) {
    ultimoProductoAmbiguo = mensaje;
    return res.status(200).send('<Response><Message>¿Estás hablando de pizza o de milanesa?</Message></Response>');
  }

  // RESPUESTA A PRODUCTO AMBIGUO
  if (ultimoProductoAmbiguo && (mensaje.includes('pizza') || mensaje.includes('milanesa'))) {
    const tipo = mensaje.includes('milanesa') ? 'milanesa' : 'pizza';
    const respuesta = generarRespuestaProducto(ultimoProductoAmbiguo, tipo);
    ultimoProductoAmbiguo = null;

    if (respuesta) {
      return res.status(200).send(`<Response><Message>${respuesta}</Message></Response>`);
    }
  }

  // INTELIGENCIA ARTIFICIAL (OPENAI)
  const mensajes = [
    { role: 'system', content: 'Sos un asistente de una pizzería llamado Knockout Pizzas. Respondé como si fueras parte del negocio, de forma cordial pero natural, y tomá pedidos como si estuvieras atendiendo.' },
    { role: 'user', content: mensajeOriginal }
  ];

  try {
    const respuesta = await getChatCompletion(mensajes);
    return res.status(200).send(`<Response><Message>${respuesta}</Message></Response>`);
  } catch (error) {
    console.error('Error al generar respuesta:', error);
    return res.status(500).send('<Response><Message>Hubo un error procesando tu mensaje. Probá más tarde.</Message></Response>');
  }
}
