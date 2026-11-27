# deployments/

ที่เก็บ **deployment manifest** — บันทึกผล deploy จริงบน Sepolia เท่านั้น

## กติกา

- ค่าทุกตัวใน manifest ต้องมาจากธุกรรมจริง — **ห้ามเดาหรือสร้าง address/hash ขึ้นเอง**
  (Team.md §13: "ไม่สร้าง hash จำลองเพื่ออ้างผล")
- ตั้งชื่อไฟล์ตาม deployment: `sepolia-YYYYMMDD.json`
- หลัง deploy ให้ jarukit อัปเดต manifest แล้วแจ้งทีม — ฆนาการ/นรวัฒน์/รัตนพล ใช้ค่าจาก
  manifest เดียวกัน **ไม่ hardcode address สมมติ** ใน backend หรือ frontend
- ไฟล์ template: `deployment-manifest.template.json`

## ลิงก์ที่ต้องแนบ (Project.md §17.4)

- Contract: `https://sepolia.etherscan.io/address/{contractAddress}#code`
- Deployment tx: `https://sepolia.etherscan.io/tx/{txHash}`
