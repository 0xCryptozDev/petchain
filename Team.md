# PetChain — แผนแบ่งงานสำหรับทีม 4 คน

## 1. ข้อตกลงทีม
สมาชิกทั้ง 4 คนพัฒนางานของตนเองให้ครบทุกฟีเจอร์ในครั้งเดียวโดยทำคู่ขนานกัน ไม่แบ่งตามวันหรือสัปดาห์ ทุกคนเขียนโค้ด ทดสอบ และจัดทำเอกสารส่วนที่ตนรับผิดชอบ ขอบเขตอ้างอิง PetChain_Project.md

## 2. จารุกิตติ์(jarukit) — Blockchain Developer
รับผิดชอบ `contracts/`, `deployments/`, `test/contracts/`
- ออกแบบ struct, enum, roles, state transition, events
- ลงทะเบียน ตรวจชิป token ซ้ำ รับรองตัวสัตว์/เจ้าของ ออกบัตร
- โอนทะเบียนสองฝ่าย หมดอายุ ยกเลิก และระงับเมื่อสัตว์หาย
- ข้อพิพาท การอนุมัติ 2 ใน 3 การเพิกถอนและ governance
- ทดสอบ unauthorized calls, duplicate chip, replay, double vote, transfer during dispute
- ทดสอบ Remix VM และ Deploy Sepolia ผ่าน MetaMask, verify source บน Etherscan และส่ง ABI, deployment manifest, addresses, event schema ให้ทีม

ส่งมอบ: Solidity source, ABI, Remix compiler settings และ deployment manifest, contract tests, role matrix, รายงานผลทดสอบ
เกณฑ์ผ่าน: ทุก transition สำคัญตรวจสิทธิ์ใน Contract และทดสอบทั้งสำเร็จ/ล้มเหลว

## 3. ฆนาการ(kanakarn) — Backend Developer
รับผิดชอบ `server/`, `prisma/`, `test/api/`
- Express API, Prisma, PostgreSQL, migrations และ seed
- Wallet authentication ด้วย nonce, session และ authorization
- Pet profile, private evidence storage, digest, chip token HMAC และ unique constraint
- API สำหรับ Vet/Admin/Dispute และ public verification แบบจำกัดข้อมูล
- Sepolia RPC event indexer, sync transaction, idempotency, reorg handling และตรวจ receipt จาก contract จริง
- ทดสอบการเข้าถึงเอกสารข้ามบัญชี, nonce replay, duplicate chip, event ซ้ำ

ส่งมอบ: API source, schema, migrations, seed, API documentation, integration tests
เกณฑ์ผ่าน: ไม่เปิดเผยข้อมูลส่วนตัว และไม่แสดงธุรกรรมสำเร็จก่อนยืนยันบน Chain

## 4. นรวัฒน์(norawat) — Owner & Public Frontend Developer
รับผิดชอบ `web/src/features/owner/`, `public/`, `shared/`
- Design system, routing, shared MetaMask connection, ethers v6 integration, Sepolia chain guard และ Etherscan links
- Owner dashboard, Register Pet, My Pets, Pet Details, evidence upload
- Digital Pet Card, QR Code, public verification และแสดงบัตรรุ่นเก่า
- Transfer request/accept/cancel, Missing/Found, ยื่นข้อพิพาท
- UI สำหรับ pending, rejected, suspended, expired, wrong network, failed transaction
- ทดสอบ Owner A/B และ public visitor

ส่งมอบ: Owner/Public pages, shared components, wallet adapter, UI tests
เกณฑ์ผ่าน: สาธิตลงทะเบียน ตรวจบัตร โอนทะเบียน และแจ้งหายได้ครบ

## 5. รัตนพล(rattanapon) — Vet/Admin Frontend & Integration Developer
รับผิดชอบ `web/src/features/vet/`, `admin/`, `test/e2e/`, `docs/`
- Vet dashboard, verification queue, inspection form และรับรองชิป
- Admin dashboard, owner evidence review, issue card
- Dispute queue, evidence review, committee proposal/voting, audit log
- Role management UI และแสดงผลการเพิกถอน/ระงับ
- Integration tests ครบเส้นทาง Owner → Vet → Reviewer → Card → Transfer → Dispute
- จัดทำ test matrix และรวบรวมรายงานจากสมาชิกทุกคน

ส่งมอบ: Vet/Admin pages, E2E tests, test report, demo checklist
เกณฑ์ผ่าน: ผู้ไม่มีสิทธิ์ไม่สามารถรับรองได้ และผลตัดสินพิเศษต้องครบ 2 ผู้อนุมัติที่แตกต่างกัน

## 6. รูปแบบการทำงานคู่ขนาน
แต่ละคนรับผิดชอบโมดูลทั้งหมดตามหัวข้อของตน พัฒนาและทดสอบด้วย mock API/ABI หรือข้อมูลจำลองได้โดยไม่ต้องรอส่วนอื่นเสร็จ จากนั้นรวมระบบและทดสอบร่วมกัน ไม่มีการกำหนดวันหรือระยะเวลา

## 7. จุดเชื่อมงาน
- ตกลง Pet ID, enum, role, API payload, ABI, error codes และ public/private fields ร่วมกันก่อนเชื่อมระบบ
- จารุกิตติ์ส่ง interface/ABI ให้ทีม และส่ง deployment manifest หลัง deploy จริง
- ฆนาการส่ง API contract และ seed accounts ให้ทีม frontend
- นรวัฒน์ส่ง shared wallet adapter และ design components ให้รัตนพล
- รัตนพลประสาน E2E โดยทุกคนแก้ bug ในส่วนของตนเอง
- เปลี่ยน schema หรือ ABI ต้องแจ้งทีมและปรับ integration tests ให้สอดคล้องกัน

## 8. Git workflow
```text
main
└── develop
    ├── feature/contracts
    ├── feature/backend
    ├── feature/owner-public
    └── feature/vet-admin
```
เปิด Pull Request เข้า develop มีสมาชิกอื่น review อย่างน้อยหนึ่งคน ไม่ commit .env, private key หรือหลักฐานจริง ใช้ .env.example และ seed ข้อมูลจำลอง

## 9. โครงสร้าง Repository
```text
petchain/
├── contracts/
├── deployments/
├── server/
├── prisma/
├── web/src/features/
│   ├── owner/
│   ├── public/
│   ├── vet/
│   ├── admin/
│   └── shared/
├── test/
│   ├── contracts/
│   ├── api/
│   └── e2e/
├── docs/
├── .env.example
└── README.md
```

## 10. Checklist ก่อนส่ง
- [ ] Contract tests ผ่านและ deploy ได้
- [ ] API tests ผ่านและ seed ใช้งานได้
- [ ] Owner/Public flow ครบ
- [ ] Vet/Admin/Committee flow ครบ
- [ ] ทดสอบสัตว์เหมือนกัน ชิปซ้ำ ไม่มีชิป ขโมยสัตว์ ข้อพิพาท และผู้รับรองผิด
- [ ] ทดสอบ Wallet ผิดสิทธิ์ ธุรกรรมล้มเหลว โหวตซ้ำ และโอนระหว่างระงับ
- [ ] ตรวจว่าไม่มีข้อมูลส่วนตัวหรือ private key หลุด
- [ ] README, Architecture, ERD, Contract state diagram, API spec, Test report
- [ ] ซ้อมนำเสนอด้วยข้อมูลจำลอง

## 11. แบ่งการนำเสนอ
จารุกิตติ์: เหตุผลที่ใช้ Blockchain, Contract และ security
ฆนาการ: Architecture, ข้อมูลและหลักฐาน, privacy
นรวัฒน์: สาธิต Owner, บัตรและการโอน
รัตนพล: สาธิต Vet/Admin, ข้อพิพาทและผลทดสอบ

## 12. การควบคุมขอบเขต
ให้แยก UI ตกแต่งและฟีเจอร์อนาคตออกจากขอบเขตหลัก ห้ามตัดการตรวจสิทธิ์ การตรวจชิปซ้ำ การรับรองแยกสองส่วน และการระงับโอนเมื่อมีข้อพิพาท หากการอนุมัติ 2 ใน 3 ยังไม่เสร็จ ต้องระบุว่าเป็นข้อจำกัดของต้นแบบและห้ามอ้างว่ารองรับแล้ว


## 13. งานเพิ่มเติมสำหรับ Remix IDE + Sepolia + MetaMask + Etherscan
| สมาชิก | งานเพิ่มเติม | หลักฐานส่งมอบ |
|---|---|---|
| จารุกิตติ์ / Blockchain | Remix IDE compiler settings, Sepolia deploy, Etherscan source verification, role setup, ABI/manifest | Contract URL, deployment tx, verified source, compiler settings, test report |
| ฆนาการ / Backend | Sepolia RPC, chain ID validation, receipt/event sync, reorg, read-only API, secret management | API tests, sync log, .env.example ไม่มี secret |
| นรวัฒน์ / Owner/Public | MetaMask connect/switch, ethers v6, account change, transaction status, View on Etherscan, QR read-only | UI และ demo Owner A/B, public verification |
| รัตนพล / Vet/Admin & QA | ใช้ shared wallet adapter, Etherscan links ทุก action, test matrix และ demo บน Sepolia | E2E report, tx hashes จริง, screenshots ของ explorer |

### Integration handoff
- จารุกิตติ์ ส่ง chain ID 11155111, contract address, ABI, deployment block และ deployment tx hash ให้ทีมหลัง deploy จริง
- ฆนาการและนรวัฒน์ ใช้ manifest เดียวกัน ตรวจ chain ID และ contract address ไม่ hardcode address สมมติ
- นรวัฒน์ ส่ง wallet adapter และ transaction status component ให้รัตนพล ใช้ร่วมกัน
- ทุกคนเตรียม Wallet ทดสอบและ Test ETH ตามบทบาท ห้ามแชร์ private key หรือ seed phrase; ใช้หลายบัญชีแยกสำหรับ Owner A/B, Vet, Reviewer และ Committee
- รัตนพล รวบรวมหลักฐาน Etherscan จากธุรกรรมจริง ไม่สร้าง hash จำลองเพื่ออ้างผล

### Checklist เพิ่มเติม
- [ ] Sepolia chain ID 11155111 และ MetaMask switch network ทำงาน
- [ ] Contract deploy และ source verified บน https://sepolia.etherscan.io/
- [ ] Etherscan links ตรงกับ tx hash จริงและ contract address จริง
- [ ] Pending/rejected/reverted/replaced และ wrong network แสดงสถานะถูกต้อง
- [ ] Public verification ไม่ต้องเชื่อม Wallet
- [ ] ทดสอบทุกบทบาทและกรณีข้อพิพาทบน Sepolia
- [ ] ไม่มี secret ใน Git หรือ frontend bundle และไม่มีข้อมูลจริงใน calldata/events
- [ ] ระบุข้อจำกัดหาก RPC, faucet, Test ETH หรือ source verification ยังไม่พร้อม

ยังเป็นแผนงาน ไม่ใช่ผล deployment หรือผลทดสอบที่เสร็จแล้ว
