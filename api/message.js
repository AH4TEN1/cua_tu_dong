// api/message.js – Đã fix để tránh 500
let latestCommand = 'Q'; // Lệnh mới nhất

export default function handler(req, res) {
  try {
    console.log(`Request: ${req.method} from ${req.headers['user-agent']}`); // Log để debug

    if (req.method === 'POST') {
      // Nhận lệnh từ web (cmd: A, M, O, C)
      const { cmd } = req.body || {};
      if (cmd && 'AMOC'.includes(cmd)) {
        latestCommand = cmd;
        console.log(`Set command: ${cmd}`);
        res.status(200).json({ status: 'OK', cmd });
      } else {
        res.status(400).json({ error: 'Invalid cmd' });
      }
    } else if (req.method === 'GET') {
      // ESP polling: Trả lệnh + reset nếu không phải Q
      console.log(`GET: Returning ${latestCommand}`);
      res.status(200).json({ cmd: latestCommand });
      if (latestCommand !== 'Q') latestCommand = 'Q'; // Reset để tránh lặp
    } else {
      res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('API Error:', error); // Log full error
    res
      .status(500)
      .json({ error: 'Internal server error', details: error.message });
  }
}

// Config chuẩn cho Vercel (runtime edge nếu cần, nhưng Node.js mặc định OK)
export const config = {
  api: {
    bodyParser: true, // Tự parse JSON body
    externalResolver: true // Nếu dùng edge runtime (tùy chọn)
  }
};
