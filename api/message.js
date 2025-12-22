/** @format */
'use strict';

import { MongoClient } from 'mongodb';
import { attachDatabasePool } from '@vercel/functions';

// ===== MongoDB =====
const client = new MongoClient(process.env.MONGODB_URI, {
  maxIdleTimeMS: 5000,
});
attachDatabasePool(client);

let latestCommand = 'Q';
let holdTimeSeconds = 5;

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  try {
    await client.connect();
    const db = client.db('smart_door');
    const logs = db.collection('logs');

    // ================= POST: Web gửi lệnh =================
    if (req.method === 'POST') {
      const { cmd, time } = req.body || {};

      if (cmd && 'AMOC'.includes(cmd)) {
        latestCommand = cmd;
      }

      if (time !== undefined) {
        const t = parseInt(time);
        if (Number.isInteger(t) && t >= 1 && t <= 30) {
          holdTimeSeconds = t;
        }
      }

      // ===== LOG WEB =====
      await logs.insertOne({
        source: 'WEB',
        cmd: latestCommand,
        time: holdTimeSeconds,
        ip: req.headers['x-forwarded-for'] || 'unknown',
        createdAt: new Date(),
      });

      return res.status(200).json({
        status: 'OK',
        cmd: latestCommand,
        time: holdTimeSeconds,
      });
    }

    // ================= GET: ESP polling =================
    if (req.method === 'GET') {
      const cmdToSend = latestCommand;

      // reset lệnh 1 lần
      if (!['Q', 'A', 'M'].includes(latestCommand)) {
        latestCommand = 'Q';
      }

      // ===== LOG ESP =====
      await logs.insertOne({
        source: 'ESP',
        cmd: cmdToSend,
        time: holdTimeSeconds,
        ip: req.headers['x-forwarded-for'] || 'esp32',
        createdAt: new Date(),
      });

      return res.status(200).json({
        cmd: cmdToSend,
        time: holdTimeSeconds,
      });
    }

    res.status(405).end();
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: e.message });
  }
}

export const config = {
  api: {
    bodyParser: true,
  },
};
