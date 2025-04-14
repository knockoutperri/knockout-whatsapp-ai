import { OpenAI } from 'openai';
import twilio from 'twilio';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const twilioClient = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

const promptBase = `
Sos una inteligencia artificial que atiende pedidos para Knockout Pizzas. Atendés como una persona real: con buena onda, pero sin exagerar. No repetís "hola" en cada mensaje. Usás buen criterio. Algunas reglas que tenés que seguir:

1. Si dicen "hola", respondé con "Hola, buen día"/"buenas tardes"/"buenas noches" según la hora en Argentina (UTC-3), y agregá: "¿En qué puedo ayudarte hoy?"
2. Si piden ver el menú, enviá las imágenes de los menús usando los templates de Twilio.
3. Si preguntan por un producto que existe tanto en pizza como en milanesa (como Napolitana o Roquefort), preguntá: "¿Estás hablando de pizza o de milanesa?"
4. Si te dicen milanesa, mostrales los gustos y precios, y después preguntales si la quieren de carne o pollo.
5. Asumí que si no aclaran tamaño de pizza, es grande. pero si te preguntan los tamaños aclara que tenemos la chica (4 porciones), la mediana (8 porciones) y la gigante (12 porciones)
6. Si piden precios, respondé solo el producto pedido (no todo el menú).
7. No uses emojis a menos que el cliente los use.
8. Sé claro, directo, no digas "claro que sí" o "excelente elección" como un vendedor exagerado.

Contestá siempre con una respuesta natural. Si no entendés, pedí que lo repita, pero no digas "no entendí tu mensaje".
`;

export default async function handler(req, res) {
  const incomingMsg = req.body.Body?.trim() || '';
  const from = req.body.From;
  const to = req.body.To;

  // Definimos hora actual en Argentina (UTC-3)
  const ahora = new Date(new Date().toLocaleString("en-US", { timeZone: "America/Argentina/Buenos_Aires" }));
  const hora = ahora.getHours();

  let saludo = "";
  if (hora < 13) saludo = "buen día";
  else if (hora < 20) saludo = "buenas tardes";
  else saludo = "buenas noches";

  // Si piden ver el menú o algo similar
  const msgLower = incomingMsg.toLowerCase();
  if (msgLower.includes("ver el menú") || msgLower.includes("ver menu") || msgLower.includes("quiero el menú") || msgLower.includes("pasame el menú") || msgLower.includes("menu")) {
    // Enviamos las dos imágenes por templates desde Twilio
    await twilioClient.messages.create({
      from,
      to,
      contentSid: 'menu_pizzas'
    });
    await twilioClient.messages.create({
      from,
      to,
      contentSid: 'menu_milanesas'
    });

    res.status(200).send('<Response><Message><Body>Te paso nuestro menú. Cualquier duda, escribinos.</Body></Message></Response>');
    return;
  }

  // Armamos el mensaje a enviar a la IA
  const completion = await openai.chat.completions.create({
    messages: [
      { role: "system", content: promptBase },
      { role: "user", content: incomingMsg }
    ],
    model: "gpt-4",
  });

  const respuestaIA = completion.choices[0]?.message?.content || 'Disculpá, no entendí. ¿Podés repetirlo?';

  res.status(200).send(`
    <Response>
      <Message>
        <Body>${respuestaIA}</Body>
      </Message>
    </Response>
  `);
}
