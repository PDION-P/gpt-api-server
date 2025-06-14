const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const OpenAI = require('openai');
const fetch = require('node-fetch'); // ← 여기 수정

const app = express();
app.use(cors());
app.use(bodyParser.json());

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// DM 파싱 API
app.post('/parse-dm', async (req, res) => {
  const { text } = req.body;
  if (!text) return res.status(400).json({ error: 'text 필드가 필요합니다.' });

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "사용자의 DM 내용을 분석하여 JSON 형식으로 반환하세요. 예: {\"name\":\"홍길동\", \"phone\":\"010-1234-5678\", \"addr\":\"서울시 강남구...\", \"product\":\"청바지\", \"opt1\":\"화이트\", \"opt2\":\"M\", \"qty\":1}"
        },
        { role: "user", content: text }
      ]
    });

    const json = completion.choices[0].message.content.trim();
    const result = JSON.parse(json);
    res.json(result);
  } catch (err) {
    console.error('parse-dm 오류:', err);
    res.status(500).json({ error: 'GPT 파싱 실패 또는 JSON 오류' });
  }
});

// 우편번호 API 프록시
app.get('/get-zipcode', async (req, res) => {
  const { addr } = req.query;
  if (!addr) return res.status(400).send("주소 입력 필요");

  const serviceKey = 'q6%2FwjlJ53TvYhwCZ5wbyDG28aIl96sURWIUSqj3oI%2FFqvYG8XuD1n59Toi0Ydo%2F6MsGrSSDhotATOFdL7NPAyg%3D%3D';
  const apiUrl = `http://openapi.epost.go.kr/postal/retrieveNewAdressAreaCdService/retrieveNewAdressAreaCdService/getNewAddressListAreaCd`;
  const url = `${apiUrl}?serviceKey=${serviceKey}&searchSe=road&srchwrd=${encodeURIComponent(addr)}&countPerPage=1&currentPage=1`;

  try {
    const response = await fetch(url);
    const data = await response.text();
    res.setHeader('Content-Type', 'application/xml');
    res.send(data);
  } catch (err) {
    console.error('zipcode 오류:', err);
    res.status(500).send("우편번호 조회 실패");
  }
});

// 기본 확인용 루트
app.get('/', (req, res) => {
  res.send('GPT API Server is running');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
