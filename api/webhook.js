export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { Body } = req.body;
  const mensaje = Body?.toLowerCase();

  if (!mensaje) {
    return res.status(200).json({ reply: "No recibí ningún mensaje." });
  }

  if (mensaje.includes("muzzarella")) {
    return res.status(200).json({ reply: "La pizza Muzzarella cuesta $9500." });
  }

  if (mensaje.includes("napolitana")) {
    return res.status(200).json({ reply: "La pizza Napolitana cuesta $9900." });
  }

  return res.status(200).json({
    reply: "No anoté ese producto en el menú. Podés escribir por ejemplo: ¿Cuánto está la muzzarella?",
  });
}
