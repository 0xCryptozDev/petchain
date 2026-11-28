---
target: Vet/Admin Warm Care หลัง Unslop
total_score: 26
max_score: 40
na_heuristics:
p0_count: 0
p1_count: 2
target_identity: "file:C:\\VSCODE\\petchain\\web\\src\\features\\admin\\Workspace.jsx"
target_fingerprint: "sha256:a7cf94962dfbd661fdd15c505c87c0f4fe32a4bc342a46861181b4b1913165a1"
target_path: "C:\\VSCODE\\petchain\\web\\src\\features\\admin\\Workspace.jsx"
timestamp: 2026-11-28T08-25-03Z
slug: web-src-features-admin-workspace-jsx
closed: true
---
Method: dual-agent (A: /root/warm_critique_a · B: /root/warm_critique_b)

# Vet/Admin Warm Care หลัง Unslop — 26/40

คะแนนนี้วัด UX ทั้งกระบวนการ รวมการรักษาร่าง การป้องกันการเลือกเป้าหมายผิด และการอธิบายสิทธิ์ Warm Care มีบุคลิกสอดคล้องกันทั้งสี ฟอนต์ และพื้นที่ตรวจหลักฐาน จุดที่ควรพัฒนาต่ออยู่ที่การทำงานข้ามหน้าและบริบทก่อนตัดสินใจ

## Design specificity

งาช้าง หมึกน้ำตาล ส้มอิฐ ฟอนต์ไทย และพื้นที่ตรวจแบบเอกสารเหมาะกับงานรับรองสัตว์ สถานะสามมิติ ตัวสัตว์/เจ้าของ/ทะเบียน ทำให้ composition มีเหตุผลเฉพาะ PetChain จุดอ่อนหลักคือความต่อเนื่องของ workflow และความชัดเจนของอำนาจตัดสินใจ

## Design health

| Nielsen heuristic | Score /4 | Evidence |
|---|---:|---|
| Visibility of system status | 3 | readiness ขั้นลงนาม ผลสำเร็จ และจำนวนเสียงชัด |
| Match with real world | 3 | ภาษาไทยชัด แต่รหัส PC กับเลขภายในยังต่างกัน |
| Control and freedom | 2 | กลับแก้ได้ แต่สลับหน้าแล้วร่างบันทึกหาย |
| Consistency | 3 | ภาพและคอนโทรลสม่ำเสมอ การแจ้งสิทธิ์ยังต่างกัน |
| Error prevention | 3 | มี confirmation แต่ข้อเสนอสำคัญยังให้พิมพ์ ID เอง |
| Recognition rather than recall | 2 | กรรมการต้องนำเลขและบริบทมาจากหน้าอื่น |
| Flexibility and efficiency | 2 | ค้นหาได้ แต่ proposal ไม่มีทางเปิดทะเบียนเป้าหมาย |
| Aesthetic and minimalist design | 3 | อ่านง่าย ที่1280pxเมนูสุดท้ายตกบรรทัด |
| Error recovery | 3 | validation/recovery มี; ไม่ได้ทดสอบ Wallet error จริง |
| Help and documentation | 2 | บางหน้าปิดปุ่มโดยไม่บอกบทบาทที่ต้องใช้ |
| Total | 26/40 | Acceptable |

## What's working

- สถานะตัวสัตว์ เจ้าของ และทะเบียนแยกกันชัด ช่วยให้เข้าใจว่าการรับรองแต่ละขั้นมีขอบเขตต่างกัน
- Desktop เปิดหลักฐานเทียบแบบบันทึกได้ มือถือแยกคิวกับรายละเอียดและย้าย focus ไปทะเบียนที่เลือกจริง
- ก่อนลงนามเห็นเป้าหมาย Wallet เหตุผล และผลของรายการ กรรมการเห็นจำนวนเสียงและวันหมดอายุ

## Priority issues

1. **P1 — สลับหน้าแล้วร่างบันทึกหาย**: ยืนยันเพิ่มด้วย fresh demo context แล้ว กรอกบันทึก → เปิดประวัติการรับรอง → กลับคิว ช่องบันทึกกลับเป็นค่าว่าง ผู้ตรวจที่ออกไปเทียบข้อมูลจะเสียงานที่พิมพ์ไว้ แก้โดยเก็บร่างตามทะเบียนและประเภทงานระดับ workspace พร้อมแจ้งก่อน reset ที่ล้างร่าง เช่น เปลี่ยนบัญชี คำสั่ง harden
2. **P1 — ข้อเสนอสำคัญแสดงบริบทสัตว์เป้าหมายน้อย**: หน้ากรรมการให้กรอกเลขภายใน เช่น2 และ proposal แสดงทะเบียน#2 แต่คิวใช้โมจิ·PC-0002 ผู้ลงมติต้องจำและแปลงข้อมูลเอง แก้โดย searchable registry picker แสดงชื่อ+PC+สถานะ และทางเปิดดูทะเบียนจาก proposal คำสั่ง clarify
3. **P2 — ปุ่มที่ไม่มีสิทธิ์ใช้งานอธิบายไม่ครบ**: ใช้ Vet แล้วหน้าข้อพิพาทและจัดการสิทธิ์แสดงฟอร์มกับปุ่ม disabled แต่ไม่บอกว่าต้องใช้ Reviewer/Admin ต่างจาก Review/Committee แก้โดยระบุบทบาทที่ต้องใช้ติด action และแสดงสถานะดูข้อมูลอย่างเดียว คำสั่ง clarify
4. **P2 — เมนูเสียจังหวะที่1280px**: บันทึกการดำเนินการตกเป็นบรรทัดสองรายการเดียว ทั้ง A/B พบตรงกัน เมนู7รายการระดับเดียวเพิ่มภาระในการเลือก แก้โดยจัดหมวดหรือ overflow เพิ่มเติมก่อนเกิด lone wrap คำสั่ง adapt

## Cognitive load and emotional journey

ภาระระดับปานกลาง มี3จุดที่ควรลด: chunking ของเมนู7รายการ, minimal choices, working-memory contextของกรรมการ ส่วน single focus, grouping, hierarchy, one decision at a time และ progressive disclosure ทำได้ดี Demo role selector มี7ตัวเลือกเมื่อเปิด เป็นภาระเฉพาะสาธิต

เริ่มสงบและควบคุมงานได้ แต่สะดุดเมื่อปุ่มเทาไม่มีเหตุผลหรือกลับมาแล้วร่างหาย Signing summary เป็นจุดมั่นใจ ตอนจบยังพัฒนาให้ระบุชื่องานที่สำเร็จและขั้นถัดไปแทนข้อความสำเร็จทั่วไปได้

## Persona red flags

- เจ้าหน้าที่ตรวจงานประจำ: สลับไปอ่านข้อมูลอีกหน้ากระทบร่างที่กำลังเขียน ไม่มีทางลัดจาก proposal กลับทะเบียน
- กรรมการที่ใช้ไม่บ่อย: เลขทะเบียนภายในอย่างเดียวให้บริบทไม่พอก่อนลงมติ และบางหน้าปุ่มเทาไม่ระบุสิทธิ์ที่ต้องใช้
- ผู้ใช้ตัวอักษรใหญ่/คีย์บอร์ด: มี focus/reduced motion แล้ว แต่ metadata12–13px ควรตรวจ zoom เพิ่ม ยังไม่มีหลักฐานว่าผิด WCAG และไม่อ้าง screen-reader pass

## Minor observations

- Audit empty state ใช้เมื่อมีคำขอใหม่ ควรเป็นเมื่อมีการดำเนินการ
- มือถือ Roles วางข้อมูลบทบาทก่อนฟอร์มมาก ช่อง Wallet เริ่มประมาณy650 ควรย่อข้อมูลรอง
- Shield ของ reconnect ไม่สื่อการเชื่อมใหม่โดยตรง แม้ tooltip ช่วยได้

## Questions to consider

เหตุใดผู้ตรวจจึงเสียร่างเมื่อไปดูประวัติ? กรรมการควรเห็นชื่อสัตว์และรหัส PC ก่อนลงมติได้โดยไม่ต้องจำเลขภายในหรือไม่? ทุกบทบาทจำเป็นต้องเห็นทั้ง7เมนูด้วยน้ำหนักเท่ากันหรือไม่?

## Deterministic scan

Detector admin+vet exit0 JSON[] count0 rules[] locations[] ไม่พบ rule ที่เครื่องมือตรวจ แต่ไม่ยืนยันว่า workflow ไม่มีปัญหา ไม่พบ horizontal overflow ในหน้าที่ตรวจที่1440/1280/390px ยังไม่ได้ตรวจ contrast ทั้งระบบหรือ keyboard-only end-to-end รอบนี้
