import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import OpenAI from 'openai';
import axios from 'axios'; // ✅ 추가됨

const app = express();
app.use(cors());
app.use(bodyParser.json());

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// ✅ GPT 기능 그대로 유지
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

// ✅ 추가: 우편번호 API 프록시
app.get('/get-zipcode', async (req, res) => {
  const { addr } = req.query;
  if (!addr) return res.status(400).send("주소 입력 필요");

  const serviceKey = 'q6%2FwjlJ53TvYhwCZ5wbyDG28aIl96sURWIUSqj3oI%2FFqvYG8XuD1n59Toi0Ydo%2F6MsGrSSDhotATOFdL7NPAyg%3D%3D';
  const apiUrl = `http://openapi.epost.go.kr/postal/retrieveNewAdressAreaCdService/retrieveNewAdressAreaCdService/getNewAddressListAreaCd`;
  const url = `${apiUrl}?serviceKey=${serviceKey}&searchSe=road&srchwrd=${encodeURIComponent(addr)}&countPerPage=1&currentPage=1`;

  try {
    const response = await axios.get(url);
    res.setHeader('Content-Type', 'application/xml');
    res.send(response.data);
  } catch (err) {
    console.error(err);
    res.status(500).send("우편번호 조회 실패");
  }
});

app.listen(3000, () => {
  console.log('Server listening on port 3000');
});
