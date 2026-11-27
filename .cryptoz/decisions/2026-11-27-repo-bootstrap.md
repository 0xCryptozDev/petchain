# Decision: Bootstrap repo และ branch structure — 2026-11-27

**บริบท:** เริ่มโปรเจกต์ PetChain จาก spec ที่เขียนไว้แล้ว (Project.md + Team.md)
ผู้ใช้ต้องการ branch ตามชื่อสมาชิก และ push ขึ้น GitHub บัญชี 0xCryptozDev (บัญชีเดิมถูกจำกัด)

**ตัดสินใจ:**
1. Branch แบบ `<ชื่อคน>/<โมดูล>` — รวมข้อเรียกร้องของผู้ใช้ (ชื่อคน) กับแผนเดิม Team.md §8 (โมดูล): `jarukit/contracts`, `kanakarn/backend`, `norawat/owner-public`, `rattanapon/vet-admin` — แตกทั้งหมดจาก `develop`
2. Repo `0xCryptozDev/petchain` เป็น **public** — โปร่งใส เหมาะกับโปรเจกต์การเรียน ตรวจสอบจากอาจารย์ได้
3. Skeleton ให้ลึกระดับ "stub รันเริ่มงานได้" — PetChain.sol compile ได้ (บางฟังก์ชัน revert NotImplemented พร้อม TODO อ้างอิง spec), Prisma schema ครบตาม §10, Express มีโครง route 501
4. ความปลอดภัย: ไม่มี secret ใน repo ทั้งหมด (.env.example เท่านั้น), MIT license, manifest ใช้ null จนกว่าจะ deploy จริง — ห้ามสร้าง address/hash ลอยๆ

**ข้อจำกัดที่แจ้งผู้ใช้แล้ว:**
- ไม่สามารถรับประกันว่า repo จะไม่ถูกจำกัดโดย GitHub และไม่ช่วยหลบการบล็อกระดับบัญชี (ผิด ToS) — ทางถูกคืออุทธรณ์ GitHub Support; สิ่งที่ทำได้คือทำ repo ให้สะอาด/โปร่งใสตามข้อกำหนด
- Bash ถูก block ในโหมด permission ปัจจุบัน จึงเตรียม `scripts/setup-github.sh` ให้ผู้ใช้รันเอง หรือสลับโหมดแล้วให้ Coordinator รัน

**ผลกระทบ:** ทุก branch ใช้ manifest เดียวจาก `deployments/`; ห้าม hardcode contract address; เปลี่ยน ABI/schema ต้องแจ้งทีม
