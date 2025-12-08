// api/message.js
let lastCommand = ''; // Lưu lệnh mới nhất từ Web UI
let lastUpdated = 0; // Thời gian cập nhật gần nhất (ms)

// Hàm trả JSON nhanh
function send(res, msg) {
  res.setHeader('Content-Type', 'application/json');
  res.status(200).send(JSON.stringify(msg));
}

export default function handler(req, res) {
  const { cmd, get } = req.query;

  // === Web UI gửi lệnh ===
  if (cmd) {
    lastCommand = cmd;
    lastUpdated = Date.now();
    return send(res, { ok: true, received: cmd });
  }

  // === ESP8266 lấy lệnh ===
  if (get == '1') {
    let temp = lastCommand;
    lastCommand = ''; // ESP đọc xong thì xóa để tránh lặp
    return send(res, {
      cmd: temp,
      updated: lastUpdated
    });
  }

  return send(res, { error: 'No action' });
}
