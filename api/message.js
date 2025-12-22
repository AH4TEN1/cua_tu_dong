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

    // ===== POST =====
    if (req.method === 'POST') {
      const { cmd, time } = req.body || {};

      if (cmd && 'AMOC'.includes(cmd)) {
        latestCommand = cmd;
      }

      if (time !== undefined) {
        const t = parseInt(time);
        if (t >= 1 && t <= 30) holdTimeSeconds = t;
      }

      await logs.insertOne({
        source: 'WEB',
        cmd: cmd || null,
        time: holdTimeSeconds,
        createdAt: new Date()
      });

      return res.status(200).json({
        status: 'OK',
        cmd: latestCommand,
        time: holdTimeSeconds
      });
    }

    // ===== GET =====
    if (req.method === 'GET') {
      const cmdToSend = latestCommand;

      if (!['Q', 'A', 'M'].includes(latestCommand)) {
        latestCommand = 'Q';
      }

      await logs.insertOne({
        source: 'ESP32',
        cmd: cmdToSend,
        time: holdTimeSeconds,
        createdAt: new Date()
      });

      return res.status(200).json({
        cmd: cmdToSend,
        time: holdTimeSeconds
      });
    }

    res.status(405).end();
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: e.message });
  }
}

export const config = {
  api: { bodyParser: true }
};
