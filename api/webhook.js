export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  const { Body } = req.body;
  const mensaje = Body?.toLowerCase().trim();

  const respuesta = `Hola! Tu mensaje fue: "${mensaje}"`;

  // Twilio espera este formato exacto
  return res.status(200).json({
    messages: [
      {
        text: {
          body: respuesta
        },
        type: 'text'
      }
    ]
  });
}
