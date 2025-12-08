// api/message.js
let lastCommand = ''; // lệnh chờ (chuỗi)
let lastUpdated = 0; // timestamp
let lastMode = 'A'; // 'A' hoặc 'M'
let lastHold = 2000; // ms
let lastStatus = ''; // chuỗi trạng thái do ESP/UNO gửi

const sendJSON = (res, obj) => {
  res.setHeader('Content-Type', 'application/json');
  res.setHeader(
    'Cache-Control',
    'no-store, no-cache, must-revalidate, max-age=0'
  );
  res.status(200).send(JSON.stringify(obj));
};

export default function handler(req, res) {
  const url = new URL(req.url, 'http://localhost');
  const cmd = url.searchParams.get('cmd');
  const get = url.searchParams.get('get');
  const getmode = url.searchParams.get('getmode');

  // 1) Web gửi lệnh: ?cmd=...
  if (cmd) {
    // Nếu cmd là Txxxx -> cập nhật lastHold luôn
    if (cmd[0] === 'T') {
      const num = parseInt(cmd.slice(1));
      if (!isNaN(num) && num >= 500) {
        lastHold = num;
      }
      lastCommand = cmd; // vẫn lưu để ESP lấy
    } else {
      // đặt lastMode khi nhận A/M
      if (cmd === 'A') lastMode = 'A';
      if (cmd === 'M') lastMode = 'M';
      lastCommand = cmd;
    }
    lastUpdated = Date.now();
    return sendJSON(res, { ok: true, received: cmd });
  }

  // 2) ESP poll lấy lệnh: ?get=1
  if (get === '1') {
    const temp = lastCommand;
    lastCommand = ''; // clear để tránh lặp
    return res.setHeader('Cache-Control', 'no-store').status(200).send(temp); // trả plain text (dễ cho ESP parse)
  }

  // 3) Web/Client hỏi mode/status hiện tại: ?getmode=1
  if (getmode === '1') {
    return sendJSON(res, {
      mode: lastMode,
      hold: lastHold,
      status: lastStatus,
      updated: lastUpdated
    });
  }

  // 4) ESP gửi status về (POST JSON): { type: "status", status: "OP_OK", mode:"A", hold:2000 }
  if (req.method === 'POST') {
    try {
      const body = JSON.parse(req.body || '{}');
      if (body.type === 'status') {
        if (body.status) lastStatus = body.status;
        if (body.mode && (body.mode === 'A' || body.mode === 'M'))
          lastMode = body.mode;
        if (body.hold && Number(body.hold) >= 500) lastHold = Number(body.hold);
        lastUpdated = Date.now();
        return sendJSON(res, { ok: true });
      } else {
        return sendJSON(res, { error: 'unknown post type' });
      }
    } catch (e) {
      return sendJSON(res, { error: 'invalid json' });
    }
  }

  // default
  return sendJSON(res, { status: 'idle' });
}
