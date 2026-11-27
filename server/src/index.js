/**
 * PetChain API — skeleton (scaffold only)
 * ผู้รับผิดชอบ: kanakarn (branch kanakarn/backend)
 * สเปก endpoint ฉบับเต็ม: Project.md §11
 *
 * หลักการสำคัญ (Project.md §8, §11):
 * - API เตรียมข้อมูล/หลักฐานเท่านั้น — การเปลี่ยนสถานะบน Chain ต้องลงนามผ่าน Wallet
 *   ดังนั้น "API success" ไม่เท่ากับ "transaction success" ต้องรอ receipt จริง
 * - Auth ด้วย nonce แบบใช้ครั้งเดียว + ข้อความลงนามที่ผูก domain, chain ID, expiry
 * - ไม่เชื่อ role ที่ส่งมาจาก frontend — ตรวจจาก session + ฐานข้อมูล
 * - ห้ามเปิดเผยข้อมูลส่วนตัวใน API สาธารณะ
 */
const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// --- Health ---
app.get('/health', (_req, res) => {
  res.json({ ok: true, chainId: process.env.CHAIN_ID || null, contract: process.env.CONTRACT_ADDRESS || null });
});

// --- Auth (wallet signature, nonce ครั้งเดียว) ---
// TODO(kanakarn): POST /auth/nonce, POST /auth/verify — ผูก domain + chainId + expiry
app.post('/auth/nonce', (_req, res) => res.status(501).json({ error: 'not implemented' }));
app.post('/auth/verify', (_req, res) => res.status(501).json({ error: 'not implemented' }));

// --- Pets ---
// TODO(kanakarn): POST /pets, GET /pets/me, GET /pets/:id, POST /pets/:id/evidence
app.post('/pets', (_req, res) => res.status(501).json({ error: 'not implemented' }));

// --- Vet / Admin / Dispute ---
// TODO(kanakarn): GET/POST /vet/requests, /admin/requests, /disputes ตาม Project.md §11

// --- Public (ข้อมูลขั้นต่ำ ไม่มีข้อมูลส่วนตัว) ---
// TODO(kanakarn): GET /public/cards/:petId/:version
app.get('/public/cards/:petId/:version', (_req, res) => res.status(501).json({ error: 'not implemented' }));

// --- Transaction status ---
// TODO(kanakarn): GET /transactions/:hash — อ่าน receipt จริง, sync event idempotent (chainId+txHash+logIndex), รองรับ reorg
app.get('/transactions/:hash', (_req, res) => res.status(501).json({ error: 'not implemented' }));

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`PetChain API (skeleton) listening on http://localhost:${port}`);
});
