export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).send("Method Not Allowed");
  }

  const { Body } = req.body;
  const mensaje = Body?.toLowerCase();

  let respuesta = "";

  if (!mensaje) {
    respuesta = "No recibí ningún mensaje.";
  } else if (mensaje.includes("muzzarella")) {
    respuesta = "La pizza Muzzarella cuesta $9500.";
  } else if (mensaje.includes("napolitana")) {
    respuesta = "La pizza Napolitana cuesta $9900.";
  } else {
    respuesta = "No anoté ese producto en el menú. Podés escribir por ejemplo: ¿Cuánto está la muzzarella?";
  }

  const twimlResponse = `
    <Response>
      <Message>${respuesta}</Message>
    </Response>
  `;

  res.setHeader("Content-Type", "text/xml");
  res.status(200).send(twimlResponse.trim());
}
