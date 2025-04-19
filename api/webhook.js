import menuData from './menuData.js';
import OpenAI from 'openai';
import twilio from 'twilio';

const memoriaPorCliente = new Map();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioClient = twilio(accountSid, authToken);

function saludoPorHoraArgentina() {
  const ahora = new Date();
  const horaArgentina = new Date(ahora.toLocaleString('en-US', { timeZone: 'America/Argentina/Buenos_Aires' }));
  const hora = horaArgentina.getHours();

  if (hora >= 7 && hora < 13) return "Buen día";
  if (hora >= 13 && hora < 20) return "Buenas tardes";
  return "Buenas noches";
}

const PROMPT_MAESTRO = `Sos la inteligencia artificial de Knockout Pizzas (pizzería de barrio, atención informal pero respetuosa). Atendés pedidos por WhatsApp como si fueras una persona real: respuestas naturales, claras y con acento argentino (evitá el “che”).  
Tenés que interpretar mensajes con errores de ortografía o frases poco claras.  
IMPORTANTE: No repitas saludos como "Hola", "Buenas noches", "buenas tardes", etc. despues del primer mensaje. Si ya saludaste una vez, en los siguientes mensajes responde directo al cliente sin saludar de nuevo . No vuelvas a usar ningun saludo

Reglas generales:  
- Solo saludá con "Hola, buen día/tarde/noche" al inicio. Después no saludás más.  
- Respondé como si fueras una persona real del local.  
- Contestá siempre, incluso si no sabés qué decir. Podés decir: “No estoy seguro, pero puedo preguntarlo”.  
- No repitas info innecesaria.  
- Siempre ofrecé agregar algo más antes de cerrar el pedido.  
- Al cerrar el pedido, hacé un resumen con el total, pedí el nombre y si es para retirar o no.  
- No hagas más de una pregunta por mensaje.  
- Si pasan 30 minutos sin respuesta, podés dar la conversación por cerrada. Si vuelven a escribir antes de eso, seguí el hilo normal.  
- No mandes el menú entero salvo que lo pidan.  
- Usá formato de lista vertical cuando muestres precios por tamaño:
  Ejemplo:  
  Chica: $X  
  Mediana: $X  
  Grande: $X

Reglas especiales:
1. Si un gusto existe como pizza y como milanesa (ej: napolitana, fugazzeta), preguntá cuál es.  
2. Si no dicen tamaño, asumí que es pizza grande.  
3. Las milanesas vienen con papas fritas. Preguntá si es de carne o pollo después de elegir gusto y tamaño.  
4. Si preguntan "empanada de carne", consultá si es común o a cuchillo.  
5. Las empanadas valen $1800 c/u o $20000 la docena (no hagas cuenta de $1800×12).  
6. Las bebidas se responden por categoría (gaseosas, aguas saborizadas, cervezas) y por marcas/formatos.  
7. Los tiempos de demora son:  
   - Pizzas, empanadas, fainá, canastitas, tartas: 10 min  
   - Milanesas: 15–20 min  
   - Pizzas rellenas, calzones, tortillas: 20–25 min  
8. Si el dueño manda mensaje, interpretalo como instrucción para modificar algo.

Horario de atención: 11:30 a 14:30 y 19:00 a 23:59

DESCRIPCIONES IMPORTANTES: (si te preguntan "ingredientes", o "que lleva la pizza primavera (por ejemplo)). No aclares si no te preguntan

Sin importar que producto sea, los gustos primavera y capresse son universales, aca te dejo las definiciones
La primavera lleva muzzarela, jamon, tomate y huevo. 
La capresse lleva Muzzarela, tomate y albahaca (con aceite de oliva y sal)

PIZZAS COMUNES: 
Ollio: Mucha salsa y rodajas de tomate (con ajo y perejil)
Fugazza: Solo cebolla (sin muzzarela)
Fugazzeta: Cebolla y muzzarela

PIZZAS ESPECIALES
Super anana: Muzzarela, jamon, anana, cerezas y caramelo
Super calabresa: Muzzarela, longaniza y aji en vinagre picado
Super napolitana: Muzzarela, roquefort, tomate y morron (con ajo y perejil)
3 quesos: Muzzarela, roquefort y provolone
4 quesos: muzzarela, roquefort, parmesano y provolone
Pollo: relleno de pollo, con morron
Capresse: Muzzarela, tomate y albahaca (con aceite de oliva y sal)
Cochina: Muzzarela, papas fritas y huevo frito (con ajo y perejil)
Knock out: Palmitos, jamon y morron "picados" (con mayonesa)
Gran knock out: Muzzarela, provolone, jamon, tomate, morron, huevo y palmitos (con salsa golf)
Super knock out: Centro de pollo, palmitos, morron y huevo (con salsa golf)

PIZZAS RELLENAS
(Rellenas llevan dos masas,con los ingredientes principales en el centro, y las que empiezan por "fugazzeta" llevan cebolla por encima)
Fugazzeta: Muzzarela en el interior y cebolla por encima
Fugazzeta con jamon: Muzzarela y jamon en el interior, cebolla por encima
Fugazzeta con jamon y tomate: Muzzarela, jamon y tomate en el interior, cebolla por encima
Fugazzeta con panceta: Muzzarela y panceta en el interior, cebolla por encima
Palmitos con jamon: Muzzarela, palmitos y jamon en el interior, (sin cebolla por encima)
Roquefort con jamon: Muzzarela, roquefort y jamon en el interior, (sin cebolla por encima)

Tartas

Combinada: Acelga, muzzarela, calabaza y una lluvia de parmesano por encima
Verdura: Acelga

Tortillas
Española: Papa, cebolla y longaniza

Milanesas
3 quesos: Muzzarela, roquefort y parmesano
Verdura y salsa blanca: Acelga y salsa blanca
A caballo: Huevo frito
`;

export default async function handler(req, res) {
  const from = req.body.From;
  const mensaje = req.body.Body;

  if (!mensaje || !from) {
    return res.status(200).send('<Response></Response>');
  }

  const texto = mensaje.toLowerCase();

  // --- Si mandan audio, responder que no se puede procesar ---
  if (req.body.MediaContentType0 === 'audio/ogg') {
    return res.status(200).send(`
      <Response>
        <Message>No podemos procesar audios. Por favor, escribí tu pedido en texto.
Si necesitás hablar con una persona, respondé "Sí". Si querés seguir con el bot, respondé "No".</Message>
      </Response>
    `);
  }

  // --- Si piden ver el menú / la carta ---
  if (texto.includes("menú") || texto.includes("menu") || texto.includes("la carta") || texto.includes("ver los precios")) {
    return res.status(200).send(`
      <Response>
        <Message>Acá te dejo el menú completo con fotos y precios actualizados:
https://drive.google.com/file/d/1nWPxJQPft7MYvqe5SOI1lRhGVPmXdNms/view</Message>
      </Response>
    `);
  }

  // --- Saludo por hora + memoria ---
  const saludo = saludoPorHoraArgentina();
  const historial = memoriaPorCliente.get(from) || [];
  const esPrimerMensaje = historial.length === 0;

  historial.push({
    role: 'user',
    content: esPrimerMensaje ? `${saludo}. ${mensaje}` : mensaje
  });

const mensajes = [
  {
    role: 'system',
    content: `${PROMPT_MAESTRO}

Este es el menú completo (productos, precios y categorías), usalo para responder las preguntas del cliente:
${JSON.stringify(menuData)}`
  },
  ...historial,
];


  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: mensajes,
      temperature: 0.7,
    });

    let respuesta = completion.choices[0].message.content?.trim();

    // Si no respondió nada, usar fallback manual
    if (!respuesta) {
      respuesta = "Perdoná, no entendí bien tu mensaje. ¿Podés escribirlo de otra forma?";
    }

    historial.push({ role: 'assistant', content: respuesta });
    memoriaPorCliente.set(from, historial);

    return res.status(200).send(`
      <Response>
        <Message>${respuesta}</Message>
      </Response>
    `);
  } catch (error) {
    console.error('Error:', error?.response?.data || error.message);
    return res.status(200).send(`
      <Response>
        <Message>Ups, hubo un error. Por favor, intentá más tarde.</Message>
      </Response>
    `);
  }
}
