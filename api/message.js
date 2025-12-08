export default async function handler(req, res) {
  const body = req.body;

  // Truy vấn mode
  if (body.query === 'mode') {
    // Lấy từ DB hoặc cache
    return res.status(200).json({
      mode: global.currentMode ?? 'A'
    });
  }

  // Truy vấn thời gian giữ cửa
  if (body.query === 'hold') {
    return res.status(200).json({
      hold: global.holdTime ?? 2000
    });
  }

  // Lưu thời gian giữ mở
  if (body.hold) {
    global.holdTime = Number(body.hold);
    return res.status(200).json({ ok: true });
  }

  // Gửi lệnh (Lưu vào biến global để ESP đến lấy)
  if (body.cmd) {
    global.lastCmd = body.cmd.charAt(0);
    global.currentMode =
      body.cmd === 'AUTO'
        ? 'A'
        : body.cmd === 'MANUAL'
        ? 'M'
        : global.currentMode;

    return res.status(200).json({ ok: true });
  }

  res.status(400).json({ error: 'Invalid request' });
}
