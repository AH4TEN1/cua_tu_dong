/** @format */
'use strict';

let latestCommand = 'Q';

export default function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  try {
    if (req.method === 'POST') {
      const { cmd } = req.body || {};
      if (cmd && 'AMOC'.includes(cmd)) {
        latestCommand = cmd;
        return res.status(200).json({ status: 'OK', cmd });
      }
      return res.status(400).json({ error: 'Invalid cmd' });
    }

    if (req.method === 'GET') {
      const cmd = latestCommand;
      if (latestCommand !== 'Q') latestCommand = 'Q';
      return res.status(200).json({ cmd });
    }

    res.status(405).end();
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}

export const config = {
  api: {
    bodyParser: true
  }
};
