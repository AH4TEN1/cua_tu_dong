const API = 'https://cua-tu-dong.vercel.app/'; // đổi IP của ESP8266 tại đây

function sendCmd(cmd) {
  fetch(`${API}/control?cmd=${cmd}`);
}

function setMode(m) {
  fetch(`${API}/control?cmd=${m}`);
  updateUI(m);
}

function updateUI(m) {
  let a = document.getElementById('auto-btn');
  let b = document.getElementById('manu-btn');
  let c = document.getElementById('manual-controls');
  let s = document.getElementById('status');

  a.classList.remove('active');
  b.classList.remove('active');

  if (m === 'AUTO') {
    a.classList.add('active');
    c.style.display = 'none';
    s.innerText = 'Mode: AUTO';
  } else {
    b.classList.add('active');
    c.style.display = 'block';
    s.innerText = 'Mode: MANUAL';
  }
}

// Load mode khi mở web
fetch(`${API}/getmode`)
  .then((r) => r.text())
  .then((mode) => {
    updateUI(mode === 'A' ? 'AUTO' : 'MANUAL');
  });
