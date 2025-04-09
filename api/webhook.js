import { MessagingResponse } from 'twilio/lib/twiml/MessagingResponse.js';
import Fuse from 'fuse.js';
import { parse } from 'url';
import { readFileSync } from 'fs';
import { join } from 'path';

// Datos del menú
const menuData = {
  tartas: [
    { name: "Tarta de Verdura", precio: 7000 },
    { name: "Tarta de Jamón y Queso", precio: 8000 },
    { name: "Tarta de Zapallito", precio: 7500 },
    { name: "Tarta de Calabaza", precio: 7500 },
    { name: "Tarta Combinada", precio: 8000 },
    { name: "Tarta de Choclo", precio: 7500 },
    { name: "Tarta Primavera", precio: 8500 },
  ],
  tortillas: [
    { name: "Tortilla de Papa", precio: 6500 },
    { name: "Tortilla de Papa, Cebolla y Morrón", precio: 7000 },
    { name: "Tortilla de Papa, Cebolla, Morrón y Muzarella", precio: 7500 },
    { name: "Tortilla de Papa, Jamón y Muzarella", precio: 7500 },
    { name: "Tortilla Española", precio: 7500 },
  ],
  empanadas: [
    { name: "Carne", precio: 1800 },
    { name: "Pollo", precio: 1800 },
    { name: "Jamón y Queso", precio: 1800 },
    { name: "Caprese", precio: 1800 },
    { name: "Humita", precio: 1800 },
    { name: "Carne Picante", precio: 1800 },
  ],
  canastitas: [
    { name: "Roquefort y Apio", precio: 2800 },
    { name: "Caprese", precio: 2800 },
    { name: "Jamón y Queso", precio: 2800 },
    { name: "Pollo al Verdeo", precio: 2800 },
    { name: "Espinaca y Ricota", precio: 2800 },
  ],
};

// Normalizar texto para búsqueda flexible
const normalize = (text) =>
  text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[.,!¡¿?\-]/g, '')
    .toLowerCase()
    .trim();

// Crear botones interactivos
const crearBotones = () => {
  const response = new MessagingResponse();
  const message = response.message();
  message.body('¿Querés ver el menú o ya sabés qué pedir?');
  message.action({
    buttons: [
      { text: 'Ver menú', action: 'ver_menu' },
      { text: 'Quiero hacer un pedido', action: 'hacer_pedido' },
    ],
  });
  return response.toString();
};

// Crear respuesta con imagen
const crearRespuestaConImagen = (texto, urlImagen) => {
  const response = new MessagingResponse();
  const message = response.message();
  message.body(texto);
  message.media(urlImagen);
  return response.toString();
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).send('<Response><Message>Método no permitido</Message></Response>');
  }

  const msg = normalize(req.body.Body || '');
  const response = new MessagingResponse();

  // Saludos y menú inicial
  const saludos = ['hola', 'buenas', 'buenas tardes', 'buenas noches', 'buen dia', 'buenos dias'];
  if (saludos.includes(msg)) {
    return res.status(200).send(crearBotones());
  }

  if (msg.includes('ver menu')) {
    return res.status(200).send(crearRespuestaConImagen('Aquí está nuestro menú completo:', 'https://tu-servidor.com/menu_completo.jpg'));
  }

  if (msg.includes('hacer pedido') || msg.includes('quiero pedir')) {
    response.message('Perfecto, contame qué querés pedir y te confirmo al toque.');
    return res.status(200).send(response.toString());
  }

  // Respuestas por categoría
  if (msg.includes('pizza')) {
    return res.status(200).send(crearRespuestaConImagen('Estas son nuestras pizzas:', 'https://tu-servidor.com/menu_pizzas.jpg'));
  }

  if (msg.includes('milanesa')) {
    return res.status(200).send(crearRespuestaConImagen('Estas son nuestras milanesas:', 'https://tu-servidor.com/menu_milanesas.jpg'));
  }

  if (msg.includes('tarta')) {
    const tartas = menuData.tartas.map((t) => `${t.name}: $${t.precio}`).join('\n');
    response.message(`Tenemos estas tartas individuales:\n${tartas}`);
    return res.status(200).send(response.toString());
  }

  if (msg.includes('tortilla')) {
    const tortillas = menuData.tortillas.map((t) => `${t.name}: $${t.precio}`).join('\n');
    response.message(`Estas son las tortillas que tenemos:\n${tortillas}`);
    return res.status(200).send(response.toString());
  }

  if (msg.includes('empanada')) {
    const empanadas = menuData.empanadas.map((e) => e.name).join(', ');
    response.message(`Tenemos estas empanadas:\n${empanadas}\nUnidad: $1800\nDocena: $20000`);
    return res.status(200).send(response.toString());
  }

  if (msg.includes('canastita')) {
    const canastitas = menuData.canastitas.map((e) => e.name).join(', ');
    response.message(`Tenemos estas canastitas:\n${canastitas}\nTodas cuestan $2800`);
    return res.status(200).send(response.toString());
  }

  // Respuesta genérica
  response.message('No entendí bien. Podés escribirme por ejemplo:\n- ¿Qué milanesas hay?\n- ¿Cuánto está una tarta?\n- ¿Tienen empanadas?\n- Ver menú\n- Quiero hacer un pedido');
  return res.status(200).send(response.toString());
}
