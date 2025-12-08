// api/message.js
let lastCommand = '';
let lastUpdated = 0;

const send = (res, obj) => {
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Cache-Control', 'no-store'); // <<< NGĂN 304
  res.status(200).send(JSON.stringify(obj));
};

export default function handler(req, res) {
  const url = new URL(req.url, 'http://localhost');

  const cmd = url.searchParams.get('cmd');
  const get = url.searchParams.get('get');

  // Web gửi lệnh
  if (cmd) {
    lastCommand = cmd;
    lastUpdated = Date.now();
    return send(res, { ok: true, received: cmd });
  }

  // ESP lấy lệnh
  if (get === '1') {
    const temp = lastCommand;
    lastCommand = '';
    return send(res, {
      cmd: temp,
      updated: lastUpdated
    });
  }

  return send(res, { error: 'No action' });
}
