# docs/ — เอกสารประกอบโปรเจกต์

ตาม checklist ก่อนส่ง (Team.md §10) ต้องมี:

- [x] `architecture.md` — ภาพรวมและขอบเขตที่มีจริง; backend/indexer ยังรอทีม
- [ ] `erd.md` — ERD จาก prisma/schema.prisma (ฆนาการ)
- [ ] `contract-state-diagram.md` — state transition ของ enum ทั้ง 6 มิติ (jarukit)
- [ ] `api-spec.md` — endpoint ครบจาก Project.md §11 (ฆนาการ)
- [ ] `deployment.md` — วิธี deploy + contract address ตาม network + compiler settings (jarukit)
- [x] `test-report.md` — ผลรันจริงส่วน Vet/Admin; ยังรอผล Backend/Contract/Owner จากเพื่อน
- [x] `limitations.md` — ข้อจำกัดของงานส่งมอบและจุดเชื่อมทีม

ส่วนรัตนพลเพิ่มเติม: `vet-admin-integration.md` (proposed API contract),
`test-matrix.md`, `demo-checklist.md` และ `rattanapon-plan.md`

สเปกต้นทางอยู่ที่ root: [Project.md](../Project.md), [Team.md](../Team.md)
เขียนจากโค้ดและ artifact จริงเท่านั้น — ห้ามอ้าง deployment ก่อน deploy จริง
