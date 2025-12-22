'use strict';

import { MongoClient } from 'mongodb';

const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri);

let latestCommand = 'Q'; // A M O C
let holdTimeSeconds = 5;
let doorState = 'CLOSE'; // OPEN | CLOSE

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  try {
    await client.connect();
    const db = client.db('smart_door');
    const logs = db.collection('logs');

    // ===== POST =====
    if (req.method === 'POST') {
      const { cmd, time, event } = req.body || {};

      // ESP báo trạng thái thực
      if (event === 'DOOR_OPENED') doorState = 'OPEN';
      if (event === 'DOOR_CLOSED') doorState = 'CLOSE';

      if (cmd && 'AMOC'.includes(cmd)) {
        latestCommand = cmd;
        if (cmd === 'O') doorState = 'OPEN';
        if (cmd === 'C') doorState = 'CLOSE';
      }

      if (time !== undefined) {
        const t = parseInt(time);
        if (t >= 1 && t <= 30) holdTimeSeconds = t;
      }

      await logs.insertOne({
        source: 'WEB/ESP',
        action: cmd || event || 'POST',
        cmd: cmd ?? null,
        doorState,
        holdTime: holdTimeSeconds,
        createdAt: new Date()
      });

      return res.json({ status: 'OK' });
    }

    // ===== GET =====
    if (req.method === 'GET') {
      const cmdToSend = latestCommand;

      let action = 'POLL';
      if (cmdToSend === 'O') action = 'OPEN_CMD';
      if (cmdToSend === 'C') action = 'CLOSE_CMD';
      if (cmdToSend === 'A') action = 'AUTO';
      if (cmdToSend === 'M') action = 'MANUAL';

      await logs.insertOne({
        source: 'ESP32',
        action,
        cmd: cmdToSend,
        doorState,
        holdTime: holdTimeSeconds,
        createdAt: new Date()
      });

      if (!['Q', 'A', 'M'].includes(latestCommand)) {
        latestCommand = 'Q';
      }

      return res.json({
        cmd: cmdToSend,
        time: holdTimeSeconds
      });
    }

    res.status(405).end();
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}

export const config = {
  api: { bodyParser: true }
};
