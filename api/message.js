// api/message.js
let latestCommand = 'Q'; // mặc định hỏi mode

export default function handler(req, res) {
  if (req.method === 'POST') {
    const { cmd } = req.body;
    if ('AMOC'.includes(cmd)) {
      latestCommand = cmd;
      res.status(200).json({ status: 'OK', cmd });
    } else {
      res.status(400).json({ error: 'Invalid cmd' });
    }
  } else if (req.method === 'GET') {
    // ESP sẽ gọi liên tục để lấy lệnh mới
    res.status(200).json({ cmd: latestCommand });
    // Sau khi ESP lấy rồi thì reset về Q (tránh lặp lệnh)
    if (latestCommand !== 'Q') latestCommand = 'Q';
  } else {
    res.status(405).end();
  }
}

// Vercel Edge Config – không cần database gì cả
export const config = {
  runtime: 'edge'
};
