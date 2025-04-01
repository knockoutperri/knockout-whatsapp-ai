const express = require('express');
const { OpenAI } = require('openai');
const app = express();
app.use(express.json());

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

app.post('/webhook', async (req, res) => {
    const message = req.body.message || '';
    try {
        const completion = await openai.chat.completions.create({
            model: 'gpt-3.5-turbo',
            messages: [{ role: 'system', content: 'Tu mensaje' }, { role: 'user', content: message }]
        });
        const reply = completion.choices[0].message.content;
        return res.send({ reply });
    } catch (err) {
        console.error('Error con OpenAI:', err);
        return res.send({ reply: 'Hubo un error, ¿podés repetir eso?' });
    }
});

app.get('/', (req, res) => {
    res.send('Knockout WhatsApp AI está funcionando.');
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Servidor escuchando en el puerto ${port}`);
});

app.get('/restart', (req, res) => {
    return res.send('IA reiniciada');
});

