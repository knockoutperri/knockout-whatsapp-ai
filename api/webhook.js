// webhook.js actualizado según indicaciones de Gastón

import { OpenAI } from 'openai';
import menuData from './menuData.js';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Normaliza texto: saca tildes, mayúsculas, puntuación
function normalizar(texto) {
  return texto
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .replace(/[.,;:!?\-()"']/g, '')
    .toLowerCase()
    .trim();
}

// Categorías sensibles a identificar (para imagen o listado)
const categorias = {
  pizzas: ['pizza', 'pizzas'],
  milanesas: ['milanesa', 'milanesas'],
  empanadas: ['empanada', 'empanadas'],
  tartas: ['tarta', 'tartas'],
  tortillas: ['tortilla', 'tortillas'],
  calzones: ['calzon', 'calzones'],
  bebidas: ['bebida', 'bebidas'],
  faina: ['faina', 'fainá']
};

// Imagenes por categoría
const imagenes = {
  pizzas: 'https://cdn.knockout.ai/img/pizzas-menu.jpg',
  otras: 'https://cdn.knockout.ai/img/otros-menu.jpg'
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).send('<Response><Message>Método no permitido</Message></Response>');
  }

  const mensaje = normalizar(req.body.Body || '');

  // 1. Saludo inicial con horario
  const hora = new Date().getHours();
  let saludo = 'Hola';
  if (hora < 13) saludo = 'Buen día';
  else if (hora < 20.5) saludo = 'Buenas tardes';
  else saludo = 'Buenas noches';
  if (['hola', 'buenas', 'buen dia', 'buenos dias', 'buenas tardes', 'buenas noches'].includes(mensaje)) {
    return res.status(200).send(`<Response><Message>${saludo}, ¿en qué puedo ayudarte hoy?</Message></Response>`);
  }

  // 2. Detectar ambigüedad "napolitana"
  if (mensaje.includes('napolitana') && !mensaje.includes('pizza') && !mensaje.includes('milanesa')) {
    return res.status(200).send('<Response><Message>¿Estás hablando de pizza o de milanesa?</Message></Response>');
  }

  // 3. Si el cliente dice "milanesa napolitana"
  if (mensaje.includes('milanesa napolitana')) {
    const producto = menuData.milanesas.find(p => p.name.toLowerCase().includes('napolitana'));
    if (producto) {
      return res.status(200).send(
        `<Response><Message>Tenemos Milanesa Napolitana:
• Chica: $${producto.chica}
• Mediana: $${producto.mediana}
• Grande: $${producto.grande}
¿La querés de carne o de pollo?</Message></Response>`
      );
    }
  }

  // 4. Si pregunta por milanesas (sin gusto)
  if (categorias.milanesas.some(c => mensaje.includes(c))) {
    return res.status(200).send('<Response><Message>Claro, tenemos milanesas con diferentes gustos. ¿Cuál querés?
Ej: napolitana, fugazzeta, sola, etc.</Message></Response>');
  }

  // 5. Si pregunta por pizzas, mandar imagen
  if (categorias.pizzas.some(c => mensaje.includes(c))) {
    return res.status(200).send(
      `<Response><Message><Media>${imagenes.pizzas}</Media></Message></Response>`
    );
  }

  // 6. Si pregunta por tartas, tortillas, bebidas u otros
  if (categorias.tartas.some(c => mensaje.includes(c))) {
    const lista = menuData.tartas.map(t => `• ${t.name} - $${t.precio}`).join('\n');
    return res.status(200).send(`<Response><Message>Sí, estas son nuestras tartas:\n${lista}</Message></Response>`);
  }

  if (categorias.tortillas.some(c => mensaje.includes(c))) {
    const lista = menuData.tortillas.map(t => `• ${t.name} - $${t.precio}`).join('\n');
    return res.status(200).send(`<Response><Message>Sí, estas son nuestras tortillas:\n${lista}</Message></Response>`);
  }

  if (categorias.milanesas.some(c => mensaje.includes(c)) || categorias.empanadas.some(c => mensaje.includes(c)) || categorias.bebidas.some(c => mensaje.includes(c))) {
    return res.status(200).send(
      `<Response><Message><Media>${imagenes.otras}</Media></Message></Response>`
    );
  }

  // 7. Fallback si no entiende
  return res.status(200).send('<Response><Message>Disculpá, no entendí bien. Podés escribirme "quiero una muzzarella" o "qué tartas tenés" y te ayudo.</Message></Response>');
}
