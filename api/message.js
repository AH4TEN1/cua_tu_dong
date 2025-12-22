/** @format */
'use strict';

import { MongoClient } from 'mongodb';

// ===== MongoDB (module scope – reuse connection) =====
const uri = process.env.MONGODB_URI;
if (!uri) throw new Error('Missing MONGODB_URI');

let mongoClient;
let mongoClientPromise;

if (!mongoClientPromise) {
  mongoClient = new MongoClient(uri);
  mongoClientPromise = mongoClient.connect();
}

// ===== State tạm (serverless best-effort) =====
let latestCommand = 'Q'; // A, M, O, C
let holdTimeSeconds = 5;

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  try {
    const client = await mongoClientPromise;
    const db = client.db('smart_door');
    const logs = db.collection('logs');

    // ==================== POST: Web gửi lệnh ====================
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

      // Log WEB
      await logs.insertOne({
        source: 'WEB',
        cmd: cmd ?? null,
        time: holdTimeSeconds,
        createdAt: new Date()
      });

      return res.status(200).json({
        status: 'OK',
        cmd: latestCommand,
        time: holdTimeSeconds
      });
    }

    // ==================== GET: ESP polling ====================
    if (req.method === 'GET') {
      const cmdToSend = latestCommand;

      // Reset lệnh 1 lần
      if (!['Q', 'A', 'M'].includes(latestCommand)) {
        latestCommand = 'Q';
      }

      // Log ESP
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

    return res.status(405).end();
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: e.message });
  }
}

export const config = {
  api: { bodyParser: true }
};
