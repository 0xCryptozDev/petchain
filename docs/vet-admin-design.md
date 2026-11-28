# Vet/Admin design — Warm Care

เอกสารนี้สรุปหน้าที่สร้างแล้วเฉพาะ Vet/Admin ของ rattanapon ตาม PRODUCT.md ผู้ใช้เลือก Warm Care เพื่อเปลี่ยน visual world ทั้งหมดโดยคงฟังก์ชันเดิม และอนุมัติ Refresh เอกสารไว้แล้ว DESIGN.md เป็นแหล่ง token หลัก โค้ดปัจจุบันเป็นต้นทางการบันทึก

## Visual system

- Creative North Star: **ศูนย์ตรวจรับรองดิจิทัล** บุคลิก **สุขุม แม่นยำ และเป็นมิตร** แสดงผ่าน visual world **Warm Care**
- พื้นงาช้างอุ่น ตัวอักษรน้ำตาล ส้มอิฐสำหรับการกระทำ เมนูแนวนอนขาวและแผ่นงานเปิดโล่ง แยกข้อมูลด้วยช่องไฟและเส้นบาง สถานะใช้สีตามความหมายพร้อมข้อความ
- Noto Sans Thai แบบ self-host Thai/Latin variable font 100–900 จาก @fontsource-variable/noto-sans-thai 5.3.0 พร้อม NOTO-LICENSE.txt และ Tahoma/sans-serif fallback; หัวข้อหน้า desktop 32px ชื่อสัตว์ 27px
- คอนโทรลนุ่มนวล เป็นมิตร และอ่านง่าย มุมโค้ง 12px แผ่นงานและ navigation 16px เงาอุ่นบางที่ navigation และปุ่มพร้อมยืนยัน ส่วน dropdown/tooltip มีเงาตามชั้นลอย

## Composition

แถบนำทางขาวแนวนอนมีทั้งเจ็ดปลายทาง: คิวตรวจสัตว์ หลักฐานเจ้าของ ประวัติ ข้อพิพาท กรรมการ สิทธิ์ และ Audit แยกพื้นที่บัญชีและ notice สาธิตให้เห็นชัด Header desktop มี margin แนวนอน 32px ด้านบน 24px กว้างสูงสุด 1376px พื้นที่หลัก max-width 1440px และขอบแนวนอน 40px

ตั้งแต่ 1280px คิวเปิดกว้าง 252px อยู่ข้างแผ่นงานขาว เว้นช่อง 28px ตั้งแต่ 1536px คิวเพิ่มเป็น 264px แผ่นงานไม่มีกรอบรอบนอก หัวทะเบียนแสดงชื่อย่อจากตัวอักษรแรกของชื่อสัตว์จริง ชื่อ ประเภท และ PC ID สถานะสามส่วนอยู่ทางขวาบน desktop: ตัวสัตว์ เจ้าของ ทะเบียน ไม่สร้างภาพสัตว์ขึ้นแทนข้อมูล

ปุ่มข้อมูลทะเบียนเปิดสถานะสัตว์หาย ผู้ถือทะเบียน และรุ่นบัตร เมื่อไม่มีบัตรแสดง “ยังไม่ออกบัตร” คำเตือนสัตว์หายยังเห็นได้แม้ปิดส่วนอ้างอิง ตั้งแต่ 1024px หลักฐานคู่กับแบบตรวจ โดยใช้ช่องไฟแยกพื้นที่ หลักฐานมี placeholder ก่อนเปิด แบบตรวจมีแถว checklist เส้นแบ่งบาง บันทึกเหตุผล และสรุปความพร้อม

ช่วง 1024–1279px เริ่มที่คิว เลือกเคสแล้วเปิดรายละเอียดแทนคิว โดยยังรักษาหลักฐานคู่กับแบบตรวจ ต่ำกว่า 1024px รายละเอียดเรียงหัวทะเบียน หลักฐาน และแบบตรวจ ปุ่มกลับคิวมีตลอดช่วงต่ำกว่า 1280px เปิดรายละเอียดแล้ว focus ชื่อสัตว์และเลื่อนไปหัวทะเบียน กลับคิวแล้วคืน focus ให้รายการที่เลือก

ต่ำกว่า 768px header และพื้นที่หลักใช้ขอบ 16px เมนูเปิดด้วยปุ่มข้อความพร้อม aria-expanded/aria-controls และแสดงรายการสองคอลัมน์ หัวข้อหน้าลดเป็น 28px ชื่อย่อสัตว์ลดเป็น 44px โดยยังแสดงอยู่ สถานะสามส่วนลงแถวใหม่ ปุ่ม combobox และ input ที่ไม่ใช่ checkbox สูงอย่างน้อย 44px Checkbox คงภาพ 20px ใน label ที่กดได้

หน้าสิทธิ์ใช้คำอธิบายคู่ฟอร์มในแผ่นงานเดียว หน้ากรรมการใช้แถบสมาชิกกะทัดรัดเหนือข้อเสนอ ข้อเสนอและฟอร์มแยกคอลัมน์เมื่อถึง wide (1181px) หน้าข้อพิพาทใช้คิวเปิดกับพื้นที่พิจารณา ไม่ใช้ชุดบัตรซ้อนแบบเดียวกันทุกหน้า

## Controls and state

Reusable controls อยู่ใน web/src/features/admin/controls.jsx: Checkbox, Select, SearchInput, TextArea, Tooltip และ Form Select เป็น combobox/listbox ผ่าน portal รองรับลูกศร Home/End, Enter/Space, Escape, Tab, typeahead และ outside click Checkbox รักษา native input semantics พร้อม checkmark ของระบบ Search มีปุ่มล้าง TextArea ขยาย 112–360px และ Notes จำกัด 2000 ตัวอักษร Form แสดงข้อผิดพลาดในหน้า พร้อม aria-invalid และ focus ช่องที่ผิด Tooltip รองรับ hover/focus และ Escape

สรุปความพร้อมแสดงจำนวนผ่าน aria-live และใช้สีเขียวกับเส้นขอบเมื่อครบเงื่อนไข Vet ตรวจชิป การตรวจตัวสัตว์/อ่านชิป และบันทึกเหตุผล Reviewer ตรวจสถานะตัวสัตว์ เจ้าของ และเหตุระงับก่อนออกบัตร สรุปนี้ช่วยอ่านเงื่อนไข ไม่แทน validation หรือการตรวจสิทธิ์

ร่าง checkbox และบันทึกเก็บแยกเคสใน memory สลับเคสยังเก็บร่าง แต่เปลี่ยนส่วนงาน session หรือ refresh จะล้างร่าง ไม่ใช่การบันทึกถาวร แผงก่อนลงนามแสดงเป้าหมาย ผลของการยืนยัน และ Wallet ตาม action โดยไม่คัดลอกเนื้อหาหลักฐานหรือเลขชิปดิบเข้าสรุป

## Motion

- เลือกเคส: WAAPI clip-path/opacity 220ms ใช้ cubic-bezier(0.22, 1, 0.36, 1) ยกเลิก animation เดิมก่อนเริ่มใหม่และตอน unmount
- ข้อมูลทะเบียนและหลักฐาน: clip-path reveal 180ms; dropdown: scaleY/opacity 140ms ด้วย easing เดียวกัน
- Press feedback ที่เมนู Wallet และปุ่มแบบตรวจ: scale .985 ภายใน 100ms
- ความพร้อม: เปลี่ยนสีและเส้นขอบ 180ms cubic-bezier(0.22, 1, 0.36, 1) ไม่มี dash animation; checkmark แสดงครบทั้งโหมดปกติและ reduced motion
- Reduced motion ปิด spatial effects และ feedback readiness ที่ผูก no-preference ส่วน feedback สีคอนโทรลทั่วไปยังใช้ 150ms cubic-bezier(0.22, 1, 0.36, 1)
- Tooltip หน่วงเปิด 180ms และให้เวลาเคลื่อนเข้า popup 160ms ไม่มี animation โหลดหน้าเพื่อตกแต่ง pulse ใช้เฉพาะ skeleton ระหว่างโหลดจริง

## Documentation and boundaries

DESIGN.md เก็บ token frontmatter กับแปดหัวข้อมาตรฐาน .impeccable/design.json เป็น sidecar schema v2 เก็บ extensions และตัวอย่าง HTML/CSS standalone 10 ชุด: Primary, Secondary, Search, Checkbox, Select Trigger, Horizontal Navigation, Registry Masthead, Pending Status, Tooltip และ Notes ตัวอย่างใช้ CSS ที่แสดงได้เองใน shadow DOM ไม่มี dependency ต่อ Tailwind runtime; ไม่แสร้งว่า preview มี React popup, transaction หรือ auto-size logic

ไม่มี raster asset ใหม่ที่ส่งในงานนี้ ชื่อย่อมาจาก record ไม่เพิ่มกราฟ ภาพสัตว์ หรือผลยืนยัน Blockchain ที่สร้างแทนข้อมูลจริง รักษาการตรวจสิทธิ์ ขอบเขต demo และ receipt เดิม เอกสาร visual ไม่ยืนยันการเชื่อม Backend/MetaMask/Contract จริงหรือการรับรอง accessibility ผลทดสอบและข้อจำกัดการตรวจจริงอยู่ใน docs/test-report.md ผล visual review อยู่ใน .impeccable/review/verdict.md

## Unslop refinement

คง Warm Care และโครงหน้าเดิม ลดน้ำหนักโลโก้เป็น 600 ขนาด 24px และหัวเรื่องเป็น 500 โดยไม่บีบตัวอักษร ปรับ desktop navigation เป็นแถว 36px padding 6px 8px; mobile targets คง 44px ใช้มุมคอนโทรลส่วนใหญ่ 10px แผง 16px เปลี่ยนเงาแถบเมนูและ popup เป็นกลาง เอาเงาติดสีบนปุ่มออก ลดคำอธิบายซ้ำของการออกบัตร และใช้ easing เดียวกันทั้ง CSS/WAAPI

## Critique fixes — 28 พฤศจิกายน 2026
แก้ครบ 4 priority issues ของ critique รอบ Warm Care: เก็บร่างข้ามหน้าแบบแยก Wallet, searchable registry picker พร้อมทางเปิดทะเบียน, คำอธิบายสิทธิ์ใกล้ action และ navigation 1280px เป็น 4+3 รายการ รักษาคู่สี ฟอนต์ และ animation เดิม ไม่เปลี่ยน Backend/Contract/Owner/Public

ร่างเก็บเฉพาะหน่วยความจำระหว่างเปิดแอป ไม่อยู่หลัง reload การสลับ Wallet สาธิตไม่ล้างร่างเดิม แต่ไม่เปิดเผยร่างของอีก Wallet ส่วนการเปลี่ยนบัญชี/เครือข่ายจริงล้างร่างพร้อม invalidate session
