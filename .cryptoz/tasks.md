# PetChain — Task Board (CryptozDev)

## ✅ เสร็จแล้ว
- [x] **bootstrap-skeleton** (Coordinator) — โครง repo ครบทั้ง contracts/server/prisma/web/test/docs + stubs, README, LICENSE, .gitignore, .env.example (ไม่มี secret)
- [x] **contract-skeleton** — PetChain.sol: roles, enums, struct, events ครบตาม Project.md §9, implement แล้ว 5 ฟังก์ชัน (registerPet, verifyAnimal, verifyOwnership, issueCard, suspendRegistration, getPet, getCardStatus), ที่เหลือ stub + TODO
- [x] **git-setup-script** — scripts/setup-github.sh: init → main → develop → 4 branches (jarukit/contracts, kanakarn/backend, norawat/owner-public, rattanapon/vet-admin) → push 0xCryptozDev/petchain (public)

## ⏳ รอผู้ใช้ (Bash ถูก block ในโหมด permission ปัจจุบัน)
- [ ] **push-to-github** — รัน `bash scripts/setup-github.sh` (ต้อง `gh auth login` ก่อน) — *ทางเลือก: สลับ permission mode แล้วให้ Coordinator รันเอง*

## 📋 งานทีมถัดไป (แตกจาก Team.md)
- [ ] **jarukit**: implement ฟังก์ชัน stub ใน PetChain.sol (transfer, lost/found, dispute, committee 2-in-3, governance) + ทดสอบ Remix VM + deploy Sepolia + verify Etherscan
- [ ] **kanakarn**: auth nonce/signature, pets/evidence API, chip HMAC, event indexer (idempotent + reorg), migrations/seed
- [ ] **norawat**: routing, design system, shared wallet adapter ฉบับเต็ม, Owner dashboard, public QR verify
- [ ] **rattanapon**: Vet/Admin pages, dispute/voting UI, E2E test matrix, docs รวบรวม
