import { twiml } from "twilio";

export default function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).send("Method Not Allowed");
  }

  const { Body } = req.body;
  const mensaje = Body?.toLowerCase();

  const twimlResponse = new twiml.MessagingResponse();

  if (!mensaje) {
    twimlResponse.message("No recibí ningún mensaje.");
  } else if (mensaje.includes("muzzarella")) {
    twimlResponse.message("La pizza Muzzarella cuesta $9500.");
  } else if (mensaje.includes("napolitana")) {
    twimlResponse.message("La pizza Napolitana cuesta $9900.");
  } else {
    twimlResponse.message("No anoté ese producto en el menú. Podés escribir por ejemplo: ¿Cuánto está la muzzarella?");
  }

  res.setHeader("Content-Type", "text/xml");
  res.status(200).send(twimlResponse.toString());
}
