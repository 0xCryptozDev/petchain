# features/admin — ผู้ดูแล/กรรมการโดยรัตนพล (branch `rattanapon/vet-admin`)

มี workspace สำหรับ owner evidence review, issue card, suspension, dispute screening,
resolution/governance voting (2 ใน 3), role management และ audit log แล้ว

ใช้ Tailwind CSS v3 จาก dependencies เดิมของโปรเจกต์สำหรับ layout, responsive,
controls และ state styling โดยมี config ในโมดูลที่ต่อจาก `web/tailwind.config.js`
ไฟล์ `workspace.css` จัดระบบ visual components, responsive และ motion ด้วย Tailwind `@apply`
ฟอนต์ Noto Sans Thai variable (Fontsource 5.3.0) เก็บในโมดูลพร้อม OFL license จึงไม่ต้องโหลดจากบริการภายนอก

ธีมล่าสุด Warm Care: ขาวอุ่น/น้ำตาล/ส้มอิฐ เมนูแนวนอน พร้อม custom controls ใน `controls.jsx`: checkbox, dropdown
แบบ combobox/listbox portal, search clear, textarea ที่ขยายตามเนื้อหา, tooltip และ Form
ที่แจ้ง validation ภายในหน้าเว็บ รองรับ keyboard และใช้ React/Tailwind เดิมโดยไม่เพิ่ม UI dependencies

เปิด entry แยกจาก `web/` โดยไม่แก้ router ของเพื่อน:

```powershell
node node_modules/vite/bin/vite.js --config src/features/admin/vite.config.js
```

Demo: `http://127.0.0.1:5174/?demo=1` — ข้อมูลใน memory, เปลี่ยนบทบาทจาก dropdown,
ไม่ใช่ Sepolia และไม่มี tx hash จำลอง สำหรับ live ใช้ `/` และตั้ง env ตาม manifest/API จริง

- [Integration/API handoff](../../../../docs/vet-admin-integration.md)
- [ผลทดสอบและข้อจำกัด](../../../../docs/test-report.md)
- [Demo checklist](../../../../docs/demo-checklist.md)

ทดสอบจาก root: `node --test test/e2e/*.test.mjs`; browser: เข้า `test/e2e`,
รัน `npm ci`, `npx playwright install chromium`, `npm run test:browser`

สิทธิ์ใน frontend เป็นตัวช่วย UI; Backend/Contract ต้องตรวจเอง การเชื่อมระบบจริงยังต้องทดสอบร่วมกับทีม
