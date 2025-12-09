// api-message.js – Serverless Function thuần Vercel
let latestCommand = 'Q';

export default function handler(req, res) {
  // CORS cho phép web gọi từ mọi nơi
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  try {
    if (req.method === 'POST') {
      const { cmd } = req.body || {};
      if (cmd && 'AMOC'.includes(cmd)) {
        latestCommand = cmd;
        return res.status(200).json({ status: 'OK', cmd });
      }
      return res.status(400).json({ error: 'Invalid cmd' });
    }

    if (req.method === 'GET') {
      const cmdToSend = latestCommand;
      if (latestCommand !== 'Q') latestCommand = 'Q'; // reset sau khi gửi
      return res.status(200).json({ cmd: cmdToSend });
    }

    res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
}

// Bắt buộc phải có dòng này để Vercel nhận là function
export const config = {
  api: {
    bodyParser: true
  }
};
