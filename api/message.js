/** @format */
'use strict';

// Lưu trạng thái toàn cục (Vercel serverless vẫn giữ được giữa các request)
let latestCommand = 'Q'; // A, M, O, C
let holdTimeSeconds = 5; // Mặc định 5 giây (có thể thay đổi bằng slider)

export default function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  try {
    // ==================== POST: Nhận lệnh từ web ====================
    if (req.method === 'POST') {
      const { cmd, time } = req.body || {};

      // Xử lý lệnh điều khiển
      if (cmd && 'AMOC'.includes(cmd)) {
        latestCommand = cmd;
      }

      // Xử lý thay đổi thời gian giữ cửa (từ slider)
      if (time !== undefined) {
        const t = parseInt(time);
        if (Number.isInteger(t) && t >= 1 && t <= 30) {
          holdTimeSeconds = t;
        }
      }

      return res.status(200).json({
        status: 'OK',
        cmd: latestCommand,
        time: holdTimeSeconds
      });
    }

    // ==================== GET: ESP polling ====================
    if (req.method === 'GET') {
      const cmdToSend = latestCommand;
      // Reset lệnh dùng một lần (O, C) để không bị lặp lại
      if (
        latestCommand !== 'Q' &&
        latestCommand !== 'A' &&
        latestCommand !== 'M'
      ) {
        latestCommand = 'Q';
      }

      return res.status(200).json({
        cmd: cmdToSend,
        time: holdTimeSeconds
      });
    }

    // Phương thức không cho phép
    res.status(405).end();
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: e.message });
  }
}

// Bắt buộc để Vercel parse JSON body
export const config = {
  api: {
    bodyParser: true
  }
};
