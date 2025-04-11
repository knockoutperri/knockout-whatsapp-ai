import { OpenAI } from "openai";
import menuData from "./menuData.js";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

let conversacion = {};

export default async function handler(req, res) {
  const incomingMsg = req.body.Body?.trim();
  const from = req.body.From;
  const hora = new Date().getHours();

  if (!conversacion[from]) conversacion[from] = { imagenesEnviadas: false };

  let saludo = "Hola";
  if (hora < 13) saludo = "Hola, buen día";
  else if (hora >= 13 && hora < 20) saludo = "Hola, buenas tardes";
  else saludo = "Hola, buenas noches";

  let respuesta = "";

  // SALUDO
  if (/^hola$/i.test(incomingMsg)) {
    return res.status(200).send(`<Response><Message>${saludo}, ¿en qué puedo ayudarte hoy?</Message></Response>`);
  }

  // VER EL MENÚ
  if (/menu|carta|ver los precios|ver opciones/i.test(incomingMsg)) {
    conversacion[from].imagenesEnviadas = true;
    return res.status(200).send(`
      <Response>
        <Message>¡Claro! Acá te paso las imágenes del menú para que puedas verlo tranquilo.</Message>
        <Message><Media>https://i.imgur.com/YxDHo49.jpeg</Media></Message>
        <Message><Media>https://i.imgur.com/bPFMK3o.jpeg</Media></Message>
      </Response>
    `);
  }

  // RESPUESTA SI YA ENVIÓ EL MENÚ ANTES
  if (!conversacion[from].imagenesEnviadas && /milanesa|pizza|tarta|empanada/i.test(incomingMsg)) {
    conversacion[from].imagenesEnviadas = true;
    return res.status(200).send(`
      <Response>
        <Message>Te paso el menú así podés ver todas las opciones tranquilamente.</Message>
        <Message><Media>https://i.imgur.com/YxDHo49.jpeg</Media></Message>
        <Message><Media>https://i.imgur.com/bPFMK3o.jpeg</Media></Message>
      </Response>
    `);
  }

  // SI PIDE MUZZARELLA
  if (/muzzarella/i.test(incomingMsg) && /cu[aá]nto|precio|vale/i.test(incomingMsg)) {
    const producto = menuData.pizzas.find(p => p.nombre.toLowerCase().includes("muzzarella"));
    if (producto) {
      return res.status(200).send(`<Response><Message>La Muzzarella grande está $${producto.precios.grande}. Si querés otra medida, también tenemos chica y gigante.</Message></Response>`);
    }
  }

  // DETECCIÓN AMBIGUA (NAPO, ROQUEFORT, ETC.)
  const ambiguos = ["napolitana", "roquefort", "fugazzeta", "primavera", "capresse"];
  const coincidenciaAmbigua = ambiguos.find(p => incomingMsg.toLowerCase().includes(p));

  if (coincidenciaAmbigua) {
    return res.status(200).send(`<Response><Message>¿Estás hablando de pizza o de milanesa?</Message></Response>`);
  }

  // DEFAULT (IA responde lo que pueda)
  const prompt = `Actuá como el asistente de una pizzería. Respondé de forma amable pero natural. Contestá esto: "${incomingMsg}"`;

  const completion = await openai.chat.completions.create({
    messages: [{ role: "user", content: prompt }],
    model: "gpt-3.5-turbo"
  });

  respuesta = completion.choices[0].message.content;

  return res.status(200).send(`<Response><Message>${respuesta}</Message></Response>`);
}
