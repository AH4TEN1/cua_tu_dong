/** @format */
'use strict';

import { MongoClient } from 'mongodb';

// ===== STATE =====
let latestCommand = 'Q'; // A, M, O, C
let holdTimeSeconds = 5;

// ===== MONGODB =====
const uri = process.env.MONGODB_URI; // URI KHÔNG CẦN DB NAME
let cachedClient = null;

async function getDB() {
  if (cachedClient) return cachedClient.db('smartdoor'); // 👈 DB đặt ở đây
  const client = new MongoClient(uri);
  await client.connect();
  cachedClient = client;
  return client.db('smartdoor');
}

async function logDB(data) {
  try {
    const db = await getDB();
    await db.collection('door_logs').insertOne({
      ...data,
      createdAt: new Date()
    });
  } catch (e) {
    console.error('Mongo error:', e.message);
  }
}

// ===== API =====
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  try {
    // ========= POST =========
    if (req.method === 'POST') {
      const { cmd, time } = req.body || {};

      if (cmd && 'AMOC'.includes(cmd)) {
        latestCommand = cmd;
        await logDB({ source: 'WEB', cmd });
      }

      if (time !== undefined) {
        const t = parseInt(time);
        if (Number.isInteger(t) && t >= 1 && t <= 30) {
          holdTimeSeconds = t;
          await logDB({ source: 'WEB', action: 'SET_TIME', time: t });
        }
      }

      return res.status(200).json({
        status: 'OK',
        cmd: latestCommand,
        time: holdTimeSeconds
      });
    }

    // ========= GET =========
    if (req.method === 'GET') {
      const cmdToSend = latestCommand;

      await logDB({
        source: 'ESP32',
        cmd: cmdToSend,
        time: holdTimeSeconds
      });

      if (!['Q', 'A', 'M'].includes(latestCommand)) {
        latestCommand = 'Q';
      }

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
  api: {
    bodyParser: true
  }
};
