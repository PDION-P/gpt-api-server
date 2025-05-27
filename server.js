import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import OpenAI from 'openai';

const app = express();
app.use(cors());
app.use(bodyParser.json());

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

app.post('/generate', async (req, res) => {
  try {
    const { prompt } = req.body;
    const chat = await openai.chat.completions.create({
      model: "gpt-4o",  
      messages: [{ role: "user", content: prompt }]
    });
    res.json({ result: chat.choices[0].message.content });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error generating response.' });
  }
});

app.listen(3000, () => {
  console.log('Server listening on port 3000');
});
