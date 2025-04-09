import menuData from './menuData.js';

function normalizarTexto(texto) {
  return texto
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\w\s]/gi, '')
    .toLowerCase()
    .trim();
}

function obtenerSaludoPorHora() {
  const ahora = new Date();
  const hora = ahora.getHours();
  const minutos = ahora.getMinutes();

  if (hora < 13) return "Buen día";
  if (hora < 20 || (hora === 20 && minutos < 30)) return "Buenas tardes";
  return "Buenas noches";
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).send('<Response><Message>Método no permitido</Message></Response>');
  }

  const { Body } = req.body;
  const mensajeOriginal = Body || '';
  const mensaje = normalizarTexto(mensajeOriginal);

  const saludos = ['hola', 'buenas', 'buenas noches', 'buen dia', 'buenos dias'];
  if (saludos.some(saludo => mensaje.includes(saludo))) {
    const saludo = obtenerSaludoPorHora();
    return res.status(200).send(`
      <Response>
        <Message>
          ${saludo}. ¿Querés ver el menú o ya sabés qué pedir?
        </Message>
        <Message>
          <Body>Elegí una opción:</Body>
          <Buttons>
            <Button>
              <Body>Ver el menú</Body>
            </Button>
            <Button>
              <Body>Quiero hacer un pedido</Body>
            </Button>
          </Buttons>
        </Message>
      </Response>
    `);
  }

  // Acá seguís con el resto de la lógica del webhook...
}
