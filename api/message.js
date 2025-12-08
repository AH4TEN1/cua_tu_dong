// api/message.js

let lastCommand = '';
let lastUpdated = 0;
let lastMode = 'A';
let lastHold = 2000;
let lastStatus = '';

const sendJSON = (res, obj) => {
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Cache-Control', 'no-store, no-cache');
  res.status(200).json(obj);
};

export default function handler(req, res) {
  // ❌ Không dùng new URL → gây redirect
  // ✔ Dùng req.query chuẩn Vercel
  const { cmd, get, getmode } = req.query || {};

  // ==============================
  // 1) Web gửi lệnh: ?cmd=...
  // ==============================
  if (cmd) {
    if (cmd[0] === 'T') {
      const num = parseInt(cmd.slice(1));
      if (!isNaN(num) && num >= 500) lastHold = num;
    } else {
      if (cmd === 'A') lastMode = 'A';
      if (cmd === 'M') lastMode = 'M';
    }
    lastCommand = cmd;
    lastUpdated = Date.now();

    return sendJSON(res, { ok: true, received: cmd });
  }

  // ==========================================
  // 2) ESP8266 poll: ?get=1  (TRẢ PLAIN TEXT)
  // ==========================================
  if (get === '1') {
    const tmp = lastCommand;
    lastCommand = '';

    res.setHeader('Cache-Control', 'no-store');
    res.setHeader('Content-Type', 'text/plain');
    return res.status(200).send(tmp);
  }

  // ==========================================
  // 3) WEB hỏi trạng thái / mode
  // ==========================================
  if (getmode === '1') {
    return sendJSON(res, {
      mode: lastMode,
      hold: lastHold,
      status: lastStatus,
      updated: lastUpdated
    });
  }

  // ==========================================
  // 4) ESP POST status lên server
  // ==========================================
  if (req.method === 'POST') {
    let data = {};
    try {
      data = JSON.parse(req.body || '{}');
    } catch (e) {
      return sendJSON(res, { error: 'invalid json' });
    }

    if (data.type === 'status') {
      if (data.status) lastStatus = data.status;
      if (data.mode === 'A' || data.mode === 'M') lastMode = data.mode;
      if (data.hold && Number(data.hold) >= 500) lastHold = Number(data.hold);

      lastUpdated = Date.now();
      return sendJSON(res, { ok: true });
    }

    return sendJSON(res, { error: 'unknown type' });
  }

  // Default
  return sendJSON(res, { status: 'idle' });
}
