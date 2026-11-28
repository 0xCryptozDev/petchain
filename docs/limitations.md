# ข้อจำกัดที่ตรวจพบ — Vet/Admin delivery

- Backend ปัจจุบันเป็น skeleton; proposed endpoints/payload ใน `vet-admin-integration.md` ต้องตกลงกับ kanakarn ก่อนเชื่อมจริง ยังไม่มีผล live API integration หรือการทดสอบข้ามบัญชีของ backend
- ไม่มี deployment จริงที่ตั้งค่าในงานนี้ จึงยังไม่มี Sepolia receipt, tx hashes หรือ source verification ที่นำมาอ้างได้
- สถานะ Confirmed ที่ 2 confirmations ไม่ใช่ finality; reorg/event reconciliation เป็นหน้าที่ backend indexer ต้องทดสอบร่วมกัน
- Shared `connect()` ปัจจุบันเทียบ `network.chainId` (bigint) กับ number ทำให้ปฏิเสธ Sepolia; ส่วน Vet/Admin ใช้ shared helpers อื่นและ BrowserProvider ที่ตรวจ chain ด้วย bigint โดยไม่แก้ไฟล์ของ norawat
- Minimal ABI อ้างอิง Contract ณ `a309b08`; ABI เปลี่ยนต้องปรับและทดสอบ adapter ใหม่ การรู้ address และมี bytecode ยังไม่ใช่การตรวจ code identity ต้องใช้ manifest จากทีม
- พบความต่างระหว่างสเปกกับ Contract เดิม: `issueCard` สามารถตั้ง Active โดยไม่ปฏิเสธ Suspended/Revoked/Deceased โดยตรง, resolution proposal เก่าของข้อพิพาทเดียวกันอาจยัง execute ได้หลัง proposal อื่นตัดสินแล้ว, และ `getCardStatus` ไม่ตรวจ ownership disputed/lost ทุกมิติ UI ส่วนนี้กันการออกบัตรในสถานะระงับและตรวจสถานะ dispute ก่อนโหวต แต่การเรียก Contract โดยตรงยังต้องให้ jarukit พิจารณา ไม่ได้แก้ Contract ข้ามขอบเขตหรืออ้างว่าปัญหาปิดแล้ว
- Committee vote counts และ proposal state ยืนยันจาก Chain ส่วน notes/evidence เป็นข้อมูล off-chain ที่ backend ต้องรับประกันว่าผูกกับ digest canonical bundle/nonce ถูกต้อง
- Queue ยังไม่มี pagination; ใช้กับ MVP ชุดเล็ก เพิ่ม pagination/error isolation ร่วมกับ backend ก่อนใช้ข้อมูลจำนวนมาก
- Demo อยู่ใน memory, reload แล้วหาย, มี fixtures และ role switch เพื่อทดสอบ ไม่ใช่ระบบยืนยันตัวตน และไม่ใช่หลักฐานว่าการตรวจชิปหรือกรรมสิทธิ์จริงถูกต้อง
- E2E ยังใช้ fixtures แทน Owner registration/transfer ไม่ได้พัฒนาหรือทดสอบ Owner/Public UI ของ norawat
- ตรวจหน้าจอด้วย Chromium เท่านั้น ไม่ได้อ้างผล Safari/Firefox/มือถือจริงหรือ accessibility audit ทุกข้อ
- npm install ของ web dependencies เดิมรายงาน 4 vulnerabilities (3 moderate, 1 high) ณ 28 พ.ย. 2026 ไม่มีการแก้ dependency ของเพื่อนหรือใช้ `npm audit fix --force` ในงานนี้ ส่วนแพ็กเกจทดสอบที่เพิ่ม npm รายงาน 0 vulnerabilities ตอนติดตั้ง ต้องให้ทีมตรวจ dependency ก่อนเปิดใช้งานจริง

ข้อจำกัดผลิตภัณฑ์ต้นทางยังเป็นไปตาม Project.md §16: บัตรนี้ไม่ใช่หลักฐานกรรมสิทธิ์ตามกฎหมาย และ Blockchain ไม่พิสูจน์ความจริงของหลักฐานนอกระบบ
