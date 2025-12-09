// ESP posts status or sensor data
// POST { type: "status"|"dht", data: {...} }
let statuses = global.__C_STATUSES || [];
global.__C_STATUSES = statuses;

export default function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  const body = req.body || {};
  const rec = {
    ts: Date.now(),
    body
  };
  statuses.push(rec);
  // keep last N
  if (statuses.length > 200) statuses.splice(0, statuses.length - 200);
  return res.json({ ok: true });
}
