# Demo checklist — Vet/Admin

## สาธิตด้วยข้อมูลจำลอง

- เปิด entry ตาม `vet-admin-integration.md` และใช้ `?demo=1` ตรวจป้ายโหมดสาธิตก่อนเริ่ม รีโหลดเพื่อ reset ข้อมูลได้
- บทบาทสัตวแพทย์: เปิดหลักฐานของมะลิ, ยืนยันตรวจตัวสัตว์/อ่านชิป, กรอกผลตรวจ, รับรองและยืนยัน action
- ทดลองถั่วแดงที่ไม่มีชิป: ต้องรับรองไม่ได้ และยังเป็นทะเบียนชั่วคราว
- เปลี่ยนเป็นผู้ตรวจหลักฐาน: รับรองหลักฐานเจ้าของมะลิ แล้วออกบัตร ต้องรับรองทั้งตัวสัตว์/เจ้าของก่อน
- เลือกโมจิในหน้าตรวจหลักฐาน: กรอกเหตุผล, ระงับทะเบียน, ตรวจสถานะ แล้วปลดระงับได้เฉพาะการรับรองยังครบ
- เปิดข้อพิพาท: Reviewer รับคัดกรองพร้อมเหตุผล, สถานะเจ้าของเป็น Disputed
- กรรมการ 1 เสนอผลตัดสิน, เปิดหน้ามติ, โหวตครั้งแรก ต้องขึ้น 1/2 และห้ามโหวตซ้ำ
- เปลี่ยนเป็นกรรมการ 2 และอนุมัติให้ครบ 2/2 ตรวจผลที่ข้อพิพาท; หลักฐานไม่พอต้องยังห้ามโอน
- ทดลองข้อเสนอเพิกถอนชิป หรือเปลี่ยนกรรมการในหน้ามติ ต้องได้รับสองเสียงเช่นกัน
- ผู้ดูแลสิทธิ์: มอบ/ถอน Vet หรือ Reviewer ให้ wallet ตัวอย่าง; ไม่มีปุ่มเปลี่ยนกรรมการโดยตรง
- เปลี่ยน Owner: ต้องดำเนินการรับรอง/โหวตไม่ได้
- เปิดประวัติและ audit log: มีผู้ดำเนินการและเวลา ไม่มี tx hash/explorer ปลอม
- ตรวจมือถือ, search empty state, Tab focus, การกลับไปแก้ก่อนยืนยัน

หมายเหตุ Owner registration และ transfer ใน automated workflow เป็น fixtures ของชุดทดสอบ ไม่ใช่หน้าจอ Owner ที่รัตนพลพัฒนาหรือผลทดสอบ Contract จริง

## Integration / Sepolia — ยังรอส่วนของทีม

- [ ] Backend ตกลง API และรันจริง รวม auth, evidence authorization, chip HMAC และ event sync
- [ ] Shared wallet/router งาน norawat รวมแล้ว; แก้ bigint network check ใน adapter โดยผู้รับผิดชอบ
- [ ] Contract compile/tests ผ่าน, มี manifest address/block/ABI และ source verified จริง
- [ ] บัญชี Owner A/B, Vet, Reviewer, Admin และ Committee 3 บัญชี มีสิทธิ์ตรงกันและ Test ETH
- [ ] Owner UI จริง → Vet → Reviewer → Card → transfer A/B → dispute → 2 approvals
- [ ] wrong network, account change, revoked role, duplicate chip, duplicate vote, expired proposal
- [ ] user rejection, insufficient gas, reverted/replaced tx, RPC outage และ reorg
- [ ] เทียบ tx hash, sender, contract address, event และเวลาใน Etherscan ทีละ action
- [ ] รวบรวม tx hashes/screenshots จริงใน test report โดยไม่ใช้ข้อมูลสาธิตแทน
