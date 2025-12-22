'use strict';
import clientPromise from '../lib/mongodb.js';

let latestCommand = 'Q';
let holdTimeSeconds = 5;

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  try {
    const client = await clientPromise;
    const db = client.db('smart_door');
    const logs = db.collection('logs');

    if (req.method === 'POST') {
      const { cmd, time } = req.body || {};

      if (cmd && 'AMOC'.includes(cmd)) latestCommand = cmd;
      if (time >= 1 && time <= 30) holdTimeSeconds = time;

      await logs.insertOne({
        source: 'WEB',
        cmd,
        time: holdTimeSeconds,
        createdAt: new Date()
      });

      return res.json({ cmd: latestCommand, time: holdTimeSeconds });
    }

    if (req.method === 'GET') {
      const sendCmd = latestCommand;
      if (!['A', 'M', 'Q'].includes(latestCommand)) latestCommand = 'Q';

      await logs.insertOne({
        source: 'ESP32',
        cmd: sendCmd,
        time: holdTimeSeconds,
        createdAt: new Date()
      });

      return res.json({ cmd: sendCmd, time: holdTimeSeconds });
    }

    res.status(405).end();
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}
