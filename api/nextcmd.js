// ESP polls this endpoint to get next command (FIFO).
// Method: GET
// Response: { ok:true, item: { id, cmd } } or { ok:true, item: null }
let queue = global.__C_CMD_QUEUE || [];
global.__C_CMD_QUEUE = queue;

export default function handler(req, res) {
  // If queue has items, shift and return one
  if (queue.length > 0) {
    const item = queue.shift();
    return res.json({ ok: true, item });
  } else {
    return res.json({ ok: true, item: null });
  }
}
