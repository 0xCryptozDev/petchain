# features/vet — สัตวแพทย์โดยรัตนพล (branch `rattanapon/vet-admin`)

`VetPanel.jsx` มี verification queue, ค้นหา, animal inspection, เปิดหลักฐาน,
ยืนยันตรวจตัวสัตว์/ชิป, no-chip state, verification history และ reportFound

ใช้จาก workspace ที่ `features/admin` ซึ่งมี demo/live service แยกกัน
shared wallet helpers ถูกนำมาใช้โดยไม่แก้ไฟล์ของ norawat
ธุรกรรมจริงแสดง Etherscan link จาก hash ที่ wallet คืนเท่านั้น

ดูวิธีเปิดและข้อตกลง API ที่ [Integration handoff](../../../../docs/vet-admin-integration.md)
และผลรันจริงที่ [Test report](../../../../docs/test-report.md)
