const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());

app.get('/api/zipcode', async (req, res) => {
  const { query } = req.query;
  const regkey = 'c7196b27c8aaf7f851749916763755';
  const url = `https://biz.epost.go.kr/KpostPortal/openapi2?regkey=${regkey}&target=postNew&query=${encodeURIComponent(query)}&countPerPage=1&currentPage=1`;

  try {
    const response = await fetch(url);
    const xml = await response.text();
    res.send(xml);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch from epost API' });
  }
});

app.listen(PORT, () => {
  console.log(`Proxy server running on port ${PORT}`);
});
