const express = require('express');
const axios = require('axios');
const cors = require('cors');
const bodyParser = require('body-parser');
const { OpenAI } = require('openai');

const app = express();
app.use(cors());
app.use(bodyParser.json());

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// GPT 응답 생성
app.post('/generate', async (req, res) => {
  try {
    const { prompt } = req.body;
    const chat = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [{ role: 'user', content: prompt }],
    });
    res.json({ result: chat.choices[0].message.content });
  } catch (err) {
    console.error('GPT 응답 오류:', err);
    res.status(500).json({ error: 'Error generating response.' });
  }
});

// DM 파싱
app.post('/parse-dm', async (req, res) => {
  const { text } = req.body;
  if (!text) return res.status(400).json({ error: 'text 필드가 필요합니다.' });

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: '사용자의 DM 내용을 분석하여 JSON 형식으로 반환하세요. 예시: {"name":"홍길동","phone":"010-1234-5678","addr":"서울시 강남구 ...","product":"청바지","opt1":"화이트","opt2":"M","qty":1}',
        },
        { role: 'user', content: text },
      ],
    });

    const parsed = completion.choices[0].message.content;

    try {
      const json = JSON.parse(parsed);
      res.json(json);
    } catch (e) {
      console.error('JSON 파싱 오류:', e);
      res.status(500).json({ error: 'GPT 응답 JSON 파싱 실패' });
    }
  } catch (err) {
    console.error('GPT 파싱 실패:', err);
    res.status(500).json({ error: 'GPT 파싱 실패 또는 서버 오류' });
  }
});

// 우편번호 API 프록시
app.get('/get-zipcode', async (req, res) => {
  const { addr } = req.query;
  if (!addr) return res.status(400).send('주소 입력 필요');

  const serviceKey = 'q6%2FwjlJ53TvYhwCZ5wbyDG28aIl96sURWIUSqj3oI%2FFqvYG8XuD1n59Toi0Ydo%2F6MsGrSSDhotATOFdL7NPAyg%3D%3D';
  const apiUrl = 'https://openapi.epost.go.kr/postal/retrieveNewAdressAreaCdService/retrieveNewAdressAreaCdService/getNewAddressListAreaCd';
  const fullUrl = `${apiUrl}?serviceKey=${serviceKey}&searchSe=road&srchwrd=${encodeURIComponent(addr)}&countPerPage=1&currentPage=1`;

  try {
    const response = await axios.get(fullUrl, { responseType: 'text' });
    res.setHeader('Content-Type', 'application/xml');
    res.send(response.data);
  } catch (err) {
    console.error('우편번호 조회 실패:', err.message || err);
    res.status(500).send('우편번호 조회 실패');
  }
});

// 루트 확인용
app.get('/', (req, res) => {
  res.send('GPT API Server is running');
});

// 서버 실행
const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});
