# PetChain — Task Board (CryptozDev)

## ✅ เสร็จแล้ว
- [x] **bootstrap-skeleton** (Coordinator) — โครง repo ครบทั้ง contracts/server/prisma/web/test/docs + stubs, README, LICENSE, .gitignore, .env.example (ไม่มี secret)
- [x] **contract-skeleton** — PetChain.sol: roles, enums, struct, events ครบตาม Project.md §9, implement แล้ว 5 ฟังก์ชัน (registerPet, verifyAnimal, verifyOwnership, issueCard, suspendRegistration, getPet, getCardStatus), ที่เหลือ stub + TODO
- [x] **git-setup-script** — scripts/setup-github.sh: init → main → develop → 4 branches (jarukit/contracts, kanakarn/backend, norawat/owner-public, rattanapon/vet-admin) → push 0xCryptozDev/petchain (public)

## ⏳ รอผู้ใช้ (Bash ถูก block ในโหมด permission ปัจจุบัน)
- [ ] **push-to-github** — รัน `bash scripts/setup-github.sh` (ต้อง `gh auth login` ก่อน) — *ทางเลือก: สลับ permission mode แล้วให้ Coordinator รันเอง*

## 📋 งานทีมถัดไป (แตกจาก Team.md)
- [x] **jarukit (implement)** — PetChain.sol ครบทุกฟังก์ชัน: transfer 2 ฝ่าย, lost/found, dispute + freeze, resolution 2-in-3, governance 2-in-3, revoke verification, suspension ยกเลิกคำขอโอน (2026-11-27) — ⚠️ ยังไม่ compile/test จริง (Bash ถูก block) ต้องรัน testplan T01–T24 ใน Remix ก่อน deploy
- [ ] **jarukit**: รัน test matrix ใน test/contracts/remix-testplan.md บน Remix VM ให้ครบ + deploy Sepolia + verify Etherscan
- [ ] **kanakarn**: auth nonce/signature, pets/evidence API, chip HMAC, event indexer (idempotent + reorg), migrations/seed
- [ ] **norawat**: routing, design system, shared wallet adapter ฉบับเต็ม, Owner dashboard, public QR verify
- [ ] **rattanapon**: Vet/Admin pages, dispute/voting UI, E2E test matrix, docs รวบรวม
