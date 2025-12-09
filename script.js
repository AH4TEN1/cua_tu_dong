// Edit BASE_API to your API project's domain, e.g. https://cua-api.vercel.app
const BASE_API = 'https://<YOUR_API_PROJECT>.vercel.app';

async function postJson(path, body) {
  const res = await fetch(BASE_API + path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
  return res.json();
}

async function sendCmd(cmd) {
  // push command to API queue
  const r = await postJson('/api/control', { cmd });
  console.log('sent', cmd, r);
  showStatus('Sent: ' + cmd);
}

async function setMode(m) {
  // we'll encode mode as 'AUTO' or 'MANUAL' as cmd A/M
  const cmd = m === 'A' ? 'AUTO' : 'MANUAL';
  await sendCmd(cmd);
}

function showStatus(t) {
  const el = document.getElementById('status');
  el.innerText = 'Status: ' + t;
}
