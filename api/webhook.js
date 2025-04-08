import menuData from './menuData.js';

function normalizarTexto(texto) {
  return texto
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\w\s]/gi, '')
    .toLowerCase()
    .trim();
}

function extraerEmpanadasYCalcular(mensaje) {
  const gustosValidos = menuData.empanadas.map(e => normalizarTexto(e.name));
  const regexCantidadGusto = /(\d+)\s+de\s+([a-zA-Z\s]+)/g;
  let match;
  let totalEmpanadas = 0;
  let desglose = [];

  while ((match = regexCantidadGusto.exec(mensaje)) !== null) {
    const cantidad = parseInt(match[1]);
    const gusto = normalizarTexto(match[2]);
    const gustoReal = gustosValidos.find(g => gusto.includes(g));
    if (gustoReal) {
      desglose.push({ cantidad, gusto: gustoReal });
      totalEmpanadas += cantidad;
    }
  }

  if (totalEmpanadas === 0) return null;

  const total = (totalEmpanadas === 12) ? 20000 : totalEmpanadas * 1800;

  return {
    texto: `Pediste ${totalEmpanadas} empanadas:\n` +
           desglose.map(e => `• ${e.cantidad} de ${e.gusto}`).join('\n') +
           `\nTotal: $${total}`,
    total
  };
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).send('<Response><Message>Método no permitido</Message></Response>');
  }

  const { Body } = req.body;
  const mensajeOriginal = Body || '';
  const mensaje = normalizarTexto(mensajeOriginal);

  const saludos = ['hola', 'buenas', 'buenas noches', 'buen dia', 'buenos dias'];
  if (saludos.some(s => mensaje.includes(s))) {
    return res.status(200).send('<Response><Message>¡Hola! ¿En qué te puedo ayudar?</Message></Response>');
  }

  const resultadoEmpanadas = extraerEmpanadasYCalcular(mensaje);
  if (resultadoEmpanadas) {
    return res.status(200).send(`<Response><Message>${resultadoEmpanadas.texto}</Message></Response>`);
  }

  for (const categoria in menuData) {
    for (const producto of menuData[categoria]) {
      const nombreNormalizado = normalizarTexto(producto.name);
      if (mensaje.includes(nombreNormalizado)) {
        if (producto.chica && producto.mediana && producto.grande) {
          // Milanesa
          return res.status(200).send(
            `<Response><Message>La milanesa ${producto.name} cuesta:\n• Chica $${producto.chica}\n• Mediana $${producto.mediana}\n• Grande $${producto.grande}\n¿La querés de carne o de pollo?</Message></Response>`
          );
        } else if (producto.chica && producto.grande && producto.gigante) {
          // Pizza
          return res.status(200).send(
            `<Response><Message>La pizza ${producto.name} cuesta:\n• Chica $${producto.chica}\n• Grande $${producto.grande}\n• Gigante $${producto.gigante}</Message></Response>`
          );
        } else if (producto.precio) {
          // Producto con precio único
          return res.status(200).send(
            `<Response><Message>La ${producto.name} cuesta $${producto.precio}.</Message></Response>`
          );
        }
      }
    }
  }

  return res.status(200).send('<Response><Message>No encontré ese producto en el menú. Podés escribir por ejemplo: ¿Cuánto está la muzzarella?</Message></Response>');
}
