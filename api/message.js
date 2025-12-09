// /api/message.js
import Cors from 'cors';

const cors = Cors({
  methods: ['GET', 'POST']
});

function runMiddleware(req, res, fn) {
  return new Promise((resolve, reject) => {
    fn(req, res, (result) => {
      if (result instanceof Error) reject(result);
      resolve(result);
    });
  });
}

export default async function handler(req, res) {
  await runMiddleware(req, res, cors);

  // Chỉ cho POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { cmd } = req.body || {};

  if (!cmd) {
    return res.status(400).json({ error: 'Missing cmd' });
  }

  // HÀM KẾT NỐI ESP8266
  const ESP_URL = 'http://YOUR_ESP8266_LOCAL_IP/message';
  // VD: 192.168.1.55/message

  try {
    const espResponse = await fetch(ESP_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ cmd })
    });

    const data = await espResponse.json();
    res.status(200).json({ ok: true, esp: data });
  } catch (e) {
    res.status(500).json({ error: 'ESP8266 unreachable', detail: e.message });
  }
}
