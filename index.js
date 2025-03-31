const express = require('express');
const app = express();

app.use(express.json());

app.post('/webhook', (req, res) => {
  const message = req.body.message || 'Hola! Soy la IA de Knockout.';
  return res.send({ reply: message });
});

app.get('/', (req, res) => {
  res.send('Knockout WhatsApp AI está funcionando.');
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Servidor escuchando en el puerto ${port}`);
});