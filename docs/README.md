# docs/ — เอกสารประกอบโปรเจกต์

ตาม checklist ก่อนส่ง (Team.md §10) ต้องมี:

- [ ] `architecture.md` — diagram จาก Project.md §8 + คำอธิบาย (รัตนพล/ฆนาการ)
- [ ] `erd.md` — ERD จาก prisma/schema.prisma (ฆนาการ)
- [ ] `contract-state-diagram.md` — state transition ของ enum ทั้ง 6 มิติ (jarukit)
- [ ] `api-spec.md` — endpoint ครบจาก Project.md §11 (ฆนาการ)
- [ ] `deployment.md` — วิธี deploy + contract address ตาม network + compiler settings (jarukit)
- [ ] `test-report.md` — รวบรวมจากทุกคนโดยรัตนพล เฉพาะผลรันจริง
- [ ] `limitations.md` — ข้อจำกัดที่ต้องตอบอาจารย์ (Project.md §16)

สเปกต้นทางอยู่ที่ root: [Project.md](../Project.md), [Team.md](../Team.md)
เขียนจากโค้ดและ artifact จริงเท่านั้น — ห้ามอ้าง deployment ก่อน deploy จริง
