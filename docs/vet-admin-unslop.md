# Vet/Admin — Unslop refinement of Warm Care

ขอบเขต rattanapon: admin/vet เท่านั้น คงฟังก์ชัน เนื้อหา ลำดับส่วนงาน สิทธิ์ และ service boundaries ใช้ polish mode เพราะพบ light slop ไม่เปลี่ยน visual world ที่ผู้ใช้เลือก

ใช้แนวทาง **Unslop by Damir Sokolovsky ([@heydamir](https://x.com/heydamir)), CC BY 4.0** ([ต้นฉบับ](https://heydamir.design/unslop))

## Audit

- Workspace typography: โลโก้น้ำหนัก 700 พร้อม tracking แน่น; หัวเรื่อง 600 มีโอกาสลดน้ำหนักโดยยังอ่านลำดับได้
- Navigation: ช่องไฟและพื้นที่ brand/account ดันบางชุดเมนูขึ้นสองบรรทัด ขนาดตรวจที่แคบลงยังอนุญาตให้ wrap โดยไม่ซ่อนรายการ
- Controls: กฎรวมบังคับคอนโทรลเกือบทั้งหมดโค้ง 12px เท่ากัน
- Depth: navigation และปุ่มยืนยันมีเงาติดสี; dropdown มีเงาติดโทนเย็นจากโลกภาพเก่า
- Evidence: พื้นที่ก่อนเปิดหลักฐานมีข้อความแนะนำยาวและซ้ำกับบริบทแบบตรวจ
- Reviewer: คำอธิบายเงื่อนไขออกบัตรซ้ำทั้งใน readiness และใต้ action
- Motion: CSS และ WAAPI ใช้ easing มากกว่าหนึ่งแบบ

ไม่พบเหตุให้ใส่ภาพสัตว์ กราฟ สถิติ หรือ generated hero เพิ่ม และไม่พบ gradient/glow/emoji ที่ต้องเปลี่ยนโลกภาพ พื้นอุ่นและ Noto Sans Thai เป็นทิศทางที่ผู้ใช้เลือกไว้จึงคงไว้

## Direction

- Product: พื้นที่ตรวจรับรองสัตว์และหลักฐานสำหรับ Vet/Admin
- Character: สุขุม แม่นยำ เป็นมิตร
- World: Warm Care ในบริบทงานคลินิก
- Moments: หลักฐานจริงและผลตรวจของทะเบียนที่เลือก
- Signature: เลข PC-xxxx และสถานะรับรองเชื่อมคิวกับแบบตรวจ

## Nine passes

1. **Spacing:** desktop nav สูงอย่างน้อย 36px, padding 6px 8px; ลดพื้นที่ brand/account เป็น 160px ต่อฝั่ง; คิวที่ 1536px ขึ้นไปเป็น 264px; พื้นก่อนเปิดหลักฐาน min-height 128px โดยคง touch targets มือถือ 44px
2. **Color:** คง palette Warm Care; เงา navigation เป็น 0 4px 16px rgba(0,0,0,.04), dropdown เป็น neutral .08; เอาเงาติดสีปุ่มออก และใช้ action-deep กับลิงก์ข้อความ
3. **Icons:** คงชุด SVG เดิมและความหมายสถานะ ไม่แทนที่ด้วย emoji หรือเพิ่มไอคอนตกแต่ง
4. **Copy:** ย่อคำแนะนำพื้นที่หลักฐานเป็น “เปิดเอกสารเพื่อตรวจเทียบข้อมูลทะเบียน”; ตัด hint ออกบัตรที่ซ้ำ แต่คง checklist และคำอธิบายเงื่อนไขหลัก
5. **Type:** โลโก้ 24px/600, หัวเรื่อง 32px/500, tracking 0; คง Noto Sans Thai และ tabular figures
6. **Layout:** คงเมนูแนวนอน คิว และคู่หลักฐาน/แบบตรวจ; ไม่เปลี่ยนลำดับส่วนงาน
7. **Details:** คอนโทรลหลักโค้ง 10px ต่างจากแผง 16px; dropdown บทบาทสาธิตคง 12px ตามองค์ประกอบเฉพาะ
8. **Visuals:** ใช้ข้อมูลและเอกสารจากระบบเดิม ไม่สร้างภาพหรือข้อมูลใหม่ ไม่มี image prompt
9. **Motion:** ใช้ cubic-bezier(.22,1,.36,1) ใน CSS และ WAAPI; คง reveal 220ms และ feedback ที่มีหน้าที่ พร้อม reduced motion

## Verification

Production build ผ่าน 194 modules; Node 14/14 และ browser 15/15 ผ่าน ตรวจภาพจริงหลังแก้ที่ desktop 1440/1280/1024 และ mobile 390px พร้อม workflow หลัก ไม่พบ page error ใน capture batch

ภาพก่อนรอบนี้: .impeccable/review/unslop-before.png ภาพหลัง: .impeccable/review/desktop.png และชุด capture ของหน้าอื่น รายละเอียดคำสั่ง/ข้อจำกัดอยู่ docs/test-report.md ผลนี้ไม่ยืนยัน Backend/MetaMask/Sepolia จริงครบวงจร
