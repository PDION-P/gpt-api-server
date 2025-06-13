import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { OpenAI } from "openai";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

app.post("/parse-dm", async (req, res) => {
  const text = req.body.text;

  const prompt = `
다음 DM 내용을 JSON 형태로 파싱해줘. 다음 형식을 꼭 지켜줘:
{
  "name": "",
  "phone": "",
  "product": "",
  "opt1": "",
  "opt2": "",
  "qty": "",
  "addr": "",
  "zip": ""
}

DM 내용:
${text}
`;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [{ role: "user", content: prompt }],
    });

    const content = completion.choices[0].message.content;
    const json = JSON.parse(content);
    res.json(json);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "GPT 파싱 실패" });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`✅ Server running on ${PORT}`));
