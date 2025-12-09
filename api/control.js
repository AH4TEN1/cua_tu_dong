// POST { cmd: "OPEN" }  -> push to queue
// GET  -> get last queued commands (for debug)
let queue = global.__C_CMD_QUEUE || [];
global.__C_CMD_QUEUE = queue;

export default function handler(req, res) {
  if (req.method === 'POST') {
    const { cmd } = req.body || {};
    if (!cmd) return res.status(400).json({ ok: false, error: 'No cmd' });
    // normalize
    const c = String(cmd).toUpperCase();
    const id = Date.now() + '-' + Math.floor(Math.random() * 1000);
    queue.push({ id, cmd: c, created: Date.now() });
    return res.json({ ok: true, id });
  } else if (req.method === 'GET') {
    return res.json({ ok: true, queue });
  } else {
    res.status(405).end();
  }
}
