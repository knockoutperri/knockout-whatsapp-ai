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
  includeScore: true,
  threshold: 0.4,
  keys: ['name']
};

const fuse = new Fuse(
  Object.values(menuData).flat(),
  fuseOptions
);

let ultimoProductoAmbiguo = null;

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).send('<Response><Message>Método no permitido</Message></Response>');
  }

  const { Body } = req.body;
  const mensajeOriginal = Body || '';
  const mensaje = normalizarTexto(mensajeOriginal);

  const saludos = ['hola', 'buenas', 'buenas noches', 'buen dia', 'buenos dias', 'buenas tardes'];
  if (saludos.some(saludo => mensaje.includes(saludo))) {
    return res.status(200).send('<Response><Message>¡Hola! ¿En qué te puedo ayudar?</Message></Response>');
  }

  // Si detecta palabras ambiguas (como napolitana), pregunta si es pizza o milanesa
  const ambiguos = ['napolitana', 'fugazzeta', 'roquefort'];
  for (const palabra of ambiguos) {
    if (mensaje.includes(palabra)) {
      ultimoProductoAmbiguo = palabra;
      return res.status(200).send('<Response><Message>¿Te referís a pizza o a milanesa?</Message></Response>');
    }
  }

  // Si aclara que era milanesa o pizza después de ambigüedad
  if (ultimoProductoAmbiguo && (mensaje.includes('milanesa') || mensaje.includes('pizza'))) {
    const tipo = mensaje.includes('milanesa') ? 'milanesa' : 'pizza';
    const categoria = tipo === 'milanesa' ? menuData.milanesas : [...menuData.pizzasComunes, ...menuData.pizzasEspeciales, ...menuData.pizzasRellenas];
    const resultado = categoria.find(p => normalizarTexto(p.name).includes(ultimoProductoAmbiguo));
    ultimoProductoAmbiguo = null;
    if (resultado) {
      if (tipo === 'milanesa') {
        return res.status(200).send(`<Response><Message>La milanesa ${resultado.name} cuesta:
• Chica $${resultado.chica}
• Mediana $${resultado.mediana}
• Grande $${resultado.grande}
¿La querés de carne o de pollo?</Message></Response>`);
      } else {
        return res.status(200).send(`<Response><Message>La pizza ${resultado.name} cuesta:
• Chica $${resultado.chica}
• Grande $${resultado.grande}
• Gigante $${resultado.gigante}</Message></Response>`);
      }
    }
  }

  // Si piden empanada de carne, preguntar cuál
  if (mensaje.includes('empanada de carne')) {
    return res.status(200).send('<Response><Message>¿Querés empanada de carne picada o de carne a cuchillo?</Message></Response>');
  }

  // Si pregunta por carne picante
  if (mensaje.includes('empanada de carne picante')) {
    return res.status(200).send('<Response><Message>Las empanadas de carne son suaves, sabrosas, pero no picantes.</Message></Response>');
  }

  // Detectar empanadas pedidas
  const gustosEmpanadas = menuData.empanadas.map(e => e.name.toLowerCase());
  let empanadasPedidas = [];
  let totalEmpanadas = 0;

  for (const gusto of gustosEmpanadas) {
    const regex = new RegExp(`(\\d+)\\s+de\\s+${gusto}`, 'i');
    const match = mensajeOriginal.match(regex);
    if (match) {
      const cantidad = parseInt(match[1]);
      empanadasPedidas.push({ gusto, cantidad });
      totalEmpanadas += cantidad;
    }
  }

  if (empanadasPedidas.length > 0) {
    const listado = empanadasPedidas.map(e => `• ${e.cantidad} de ${e.gusto}`).join('\n');
    const precio = totalEmpanadas >= 12 ? 20000 : totalEmpanadas * 1800;
    return res.status(200).send(`
<Response>
<Message>
Llevás ${totalEmpanadas} empanadas:
${listado}
Total: $${precio}
¿Querés agregar algo más al pedido?
</Message>
<Options>
<Option>Si</Option>
<Option>No</Option>
</Options>
</Response>
`.trim());
  }

  // Buscar cualquier producto con Fuse.js
  const resultado = fuse.search(mensaje)[0];
  if (resultado && resultado.score < 0.4) {
    const producto = resultado.item;
    if (producto.chica && producto.grande && producto.gigante) {
      return res.status(200).send(`<Response><Message>La pizza ${producto.name} cuesta:
• Chica $${producto.chica}
• Grande $${producto.grande}
• Gigante $${producto.gigante}</Message></Response>`);
    }
    if (producto.chica && producto.mediana && producto.grande) {
      return res.status(200).send(`<Response><Message>La milanesa ${producto.name} cuesta:
• Chica $${producto.chica}
• Mediana $${producto.mediana}
• Grande $${producto.grande}
¿La querés de carne o de pollo?</Message></Response>`);
    }
    if (producto.precio) {
      return res.status(200).send(`<Response><Message>La ${producto.name} cuesta $${producto.precio}.</Message></Response>`);
    }
  }

  return res.status(200).send(`<Response><Message>No encontré ese producto en el menú. Podés escribir por ejemplo: "¿Cuánto está la Muzzarella?"</Message></Response>`);
}
