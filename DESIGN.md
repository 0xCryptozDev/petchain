---
name: "PetChain Vet/Admin"
description: "Warm Care — ศูนย์ตรวจรับรองดิจิทัลที่สุขุม แม่นยำ และเป็นมิตร"
colors:
  action: "#c64f29"
  action-deep: "#92371d"
  accent-soft: "#f5e8d9"
  ready-line: "#c6d9cc"
  ink: "#392e28"
  muted: "#756354"
  canvas: "#fff7ed"
  surface: "#ffffff"
  line: "#eadfd2"
  control: "#a38b76"
  queue-selected: "#eadbca"
  nav-active: "#f1e4d4"
  nav-hover: "#faf3ea"
  field-search: "#fffaf4"
  field-note: "#fffdfa"
  positive: "#356a47"
  pending: "#876322"
  negative: "#9a4e37"
  status-neutral: "#65736a"
  error: "#b94944"
typography:
  headline:
    fontFamily: "Noto Sans Thai, Tahoma, sans-serif"
    fontSize: "32px"
    fontWeight: 500
    lineHeight: 1.25
    letterSpacing: "0em"
  title:
    fontFamily: "Noto Sans Thai, Tahoma, sans-serif"
    fontSize: "20px"
    fontWeight: 600
    lineHeight: 1.5
  body:
    fontFamily: "Noto Sans Thai, Tahoma, sans-serif"
    fontSize: "15px"
    fontWeight: 400
    lineHeight: 1.625
  control:
    fontFamily: "Noto Sans Thai, Tahoma, sans-serif"
    fontSize: "14px"
    fontWeight: 500
    lineHeight: 1.4285714286
  meta:
    fontFamily: "Noto Sans Thai, Tahoma, sans-serif"
    fontSize: "13px"
    fontWeight: 400
    lineHeight: 1.625
  label:
    fontFamily: "Noto Sans Thai, Tahoma, sans-serif"
    fontSize: "12px"
    fontWeight: 400
    lineHeight: 1.3333333333
rounded:
  sm: "6px"
  md: "8px"
  lg: "12px"
  nav: "10px"
  control: "10px"
  xl: "16px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "12px"
  lg: "16px"
  xl: "20px"
  xxl: "24px"
  page: "32px"
  section: "40px"
  sheet: "28px"
components:
  button-primary:
    backgroundColor: "{colors.action}"
    textColor: "{colors.surface}"
    typography: "{typography.control}"
    rounded: "{rounded.control}"
    padding: "10px 16px"
    height: "44px"
  button-primary-hover:
    backgroundColor: "{colors.action-deep}"
  button-secondary:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    typography: "{typography.control}"
    rounded: "{rounded.control}"
    padding: "10px 16px"
    height: "44px"
  input-search:
    backgroundColor: "{colors.field-search}"
    textColor: "{colors.ink}"
    typography: "{typography.meta}"
    rounded: "{rounded.control}"
    padding: "10px 40px 10px 36px"
  checkbox:
    backgroundColor: "{colors.surface}"
    rounded: "{rounded.sm}"
    size: "20px"
  checkbox-checked:
    backgroundColor: "{colors.action}"
    textColor: "{colors.surface}"
  select-demo:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    typography: "{typography.label}"
    rounded: "{rounded.lg}"
    padding: "6px 8px"
    height: "44px"
    width: "180px"
  nav-selected:
    backgroundColor: "{colors.nav-active}"
    textColor: "{colors.ink}"
    rounded: "{rounded.nav}"
    padding: "6px 8px"
    height: "36px"
  registry-masthead:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    padding: "20px 0px"
  status-pending:
    textColor: "{colors.pending}"
  tooltip:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.surface}"
    typography: "{typography.label}"
    rounded: "{rounded.md}"
    padding: "8px 12px"
  textarea:
    backgroundColor: "{colors.field-note}"
    textColor: "{colors.ink}"
    typography: "{typography.control}"
    rounded: "{rounded.control}"
    padding: "12px 16px"
---

# Design System: PetChain Vet/Admin — Warm Care

## Overview

**Creative North Star: "ศูนย์ตรวจรับรองดิจิทัล"**

PetChain Vet/Admin ใช้ visual world **Warm Care** ที่ผู้ใช้เลือก โดยคงแนวคิดศูนย์ตรวจรับรองดิจิทัลและบุคลิกสุขุม แม่นยำ และเป็นมิตร พื้นงาช้างอุ่น ตัวอักษรน้ำตาล และส้มอิฐสร้างบรรยากาศที่อ่านได้นาน เมนูแนวนอนบนพื้นขาวเปิดพื้นที่ให้ข้อมูลและหลักฐานเป็นจุดเด่น

ปุ่มและคอนโทรลให้ความรู้สึกนุ่มนวล เป็นมิตร และอ่านง่าย พื้นทำงานขาววางบนพื้นอุ่นโดยใช้ช่องไฟและเส้นบางจัดกลุ่ม เงาอ่อนช่วยแยกแถบนำทางและชั้นลอย การเคลื่อนไหวตอบการเลือกเคสหรือเปิดข้อมูลเท่านั้น เอกสารนี้ครอบคลุมเฉพาะ Vet/Admin ของ rattanapon ตาม PRODUCT.md

**Key Characteristics:**

- พื้นงาช้างอุ่นและหมึกน้ำตาล ส้มอิฐเน้นการกระทำ
- เมนูแนวนอนและพื้นที่อ่านหลักฐานที่เปิดโล่ง
- ข้อความไทยใช้ Noto Sans Thai และลำดับขนาดชัดเจน
- คอนโทรลออกแบบเอง รองรับคีย์บอร์ดและ reduced motion

## Colors

Warm Care ใช้พื้นงาช้างอุ่น น้ำตาล และส้มอิฐ ค่าสี normative อยู่ใน frontmatter โดย source คือ admin/tailwind.config.js และ workspace.css

### Primary

- **ส้มอิฐ** — `action` สำหรับปุ่มหลัก เลขทะเบียน และ feedback; `action-deep` สำหรับ hover; `accent-soft` รองรับพื้นที่เลือกในคอนโทรล

### Neutral

- **งาช้างอุ่น** — `canvas` รองรับ `surface` ขาวและแผ่นงานที่เปิดโล่ง
- **หมึกน้ำตาล** — `ink` สำหรับข้อมูลหลัก `muted` สำหรับคำอธิบายและ metadata
- **ทรายอ่อน** — `line` แยกส่วน `control` กำหนดขอบช่องกรอก `nav-active` และ `queue-selected` บอกตำแหน่งงานที่เลือก `nav-hover` ให้ feedback สงบ
- **พื้นเขียนและค้นหา** — `field-search` และ `field-note` รองรับคอนโทรลโดยไม่กลืนกับกระดาษขาว

### Semantic states

สำเร็จ รอพิจารณา มีปัญหา และปกติ ใช้ `positive`, `pending`, `negative`, `status-neutral` ตามลำดับ ช่องผิดใช้ `error` ความพร้อมครบใช้ `positive` กับ `ready-line` ทุกสถานะมีข้อความประกอบ

**The Meaningful Clay Rule.** ใช้ส้มอิฐกับการกระทำ การเลือก และเลขทะเบียน สถานะยังคงสีตามความหมายและมีข้อความประกอบ

## Typography

ใช้ Noto Sans Thai แบบ self-host ทั้ง Thai และ Latin variable font (100–900) พร้อม Tahoma/sans-serif fallback ไฟล์มาจาก @fontsource-variable/noto-sans-thai รุ่น 5.3.0 และเก็บ NOTO-LICENSE.txt คู่กัน ไม่มีการพึ่ง Google Fonts ระหว่างเปิดหน้า

ลำดับ headline/title/body/control/meta/label อยู่ใน frontmatter หัวข้อหน้าขนาด desktop 32px ลดเป็น 28px ใต้ 768px ชื่อสัตว์ 27px น้ำหนัก 600 หัวข้อหลักฐานและแบบตรวจ 17px หัวข้อคิว 16px ข้อความเนื้อหา 15px และคอนโทรล 14px ช่วยให้การตรวจอ่านมีลำดับโดยไม่ต้องใช้ display font เพิ่ม เลขทะเบียนใช้ tabular figures; Wallet/code ใช้ monospace เฉพาะข้อมูลเทคนิค

## Layout

แถบนำทางขาวลอยอยู่เหนือพื้นที่งาน มี margin แนวนอน 32px และด้านบน 24px ความกว้างสูงสุด 1376px พื้นที่หลัก max-width 1440px ขอบแนวนอน 40px แยก notice สาธิต บัญชี และหัวข้องานออกจากเอกสารตรวจ เมนูแนวนอนครอบคลุมทั้งเจ็ดปลายทาง: คิวสัตว์ หลักฐานเจ้าของ ประวัติ ข้อพิพาท กรรมการ สิทธิ์ และ Audit

Vet/Reviewer ใช้คิวเปิดด้านซ้ายและแผ่นงานขาวหนึ่งเคสทางขวา ช่องระหว่างคิวกับแผ่นงาน 28px แผ่นงานไม่มีกรอบรอบนอก หัวทะเบียนมีเส้นแบ่งด้านล่างและสถานะสามส่วนกะทัดรัดทางขวาบน desktop หลักฐานและแบบตัดสินมีช่องไฟแยกกันโดยไม่เพิ่มกรอบบัตรซ้อน

- ตั้งแต่ 1280px คิวกว้าง 252px; ตั้งแต่ 1536px เพิ่มเป็น 264px
- ช่วง 1024–1279px เปิดคิว → รายละเอียด โดยรายละเอียดคงหลักฐานคู่แบบตรวจ
- ต่ำกว่า 1024px รายละเอียดเรียงหัวทะเบียน หลักฐาน และแบบตรวจ
- ต่ำกว่า 1280px มีปุ่มกลับคิว เลือกเคสแล้ว focus ชื่อสัตว์และเลื่อนไปหัวทะเบียน กลับคิวแล้วคืน focus ให้รายการเดิม
- ต่ำกว่า 768px แถบนำทางมี margin 16px ปุ่มเมนูเปิดรายการสองคอลัมน์ พื้นที่หลักมีขอบ 16px แสดงชื่อย่อสัตว์ขนาดย่อและสถานะสามส่วนในแถวใหม่ คอนโทรลกดได้สูงอย่างน้อย 44px; checkbox ภาพ 20px อยู่ใน label ที่กดได้
- เอกสารตรวจมี padding 28px; ส่วนหัวเว้นแนวนอน 28px และแนวตั้ง 20px; mobile ลดช่องภายในเป็น 20px

หน้าสิทธิ์แยกคำอธิบายกับฟอร์มในแผ่นงานเดียว หน้ากรรมการใช้แถบสมาชิกกะทัดรัดเหนือข้อเสนอ หน้าข้อพิพาทใช้คิวเปิดกับพื้นที่พิจารณา ขนาด wide (1181px) ใช้แยกคอลัมน์ข้อเสนอกรรมการ ไม่บังคับทุกหน้าจัดเหมือนคิวตรวจ

## Elevation & Depth

ความลึกหลักมาจากแผ่นงานขาวบนพื้นอุ่นและเส้นบางภายใน แถบนำทางมีเงากลางเบา (0 4px 16px rgba(0,0,0,.04)) ปุ่มยืนยันไม่มีเงาติดสี ส่วน dropdown และ tooltip ใช้เงากลางแยกชั้นลอย ค่าทั้งหมดอยู่ใน sidecar เมนูผ่าน portal เพื่อไม่ถูก container ตัด

**The Quiet Surface Rule.** แผ่นงานขาวไม่มีเงาหนา ใช้พื้นที่ว่างและเส้นแบ่งภายใน เงากลางอ่อนสงวนให้แถบนำทางและชั้นลอย ไม่ใช้เงาติดสีบนปุ่ม

## Shapes

แผ่นงานและแถบนำทางใช้มุมโค้งกว้าง (16px) ปุ่ม ช่องกรอก และ textarea ใช้มุมอ่อน (10px; ตัวเลือกบทบาทสาธิตคง 12px) เมนู desktop โค้ง 10px Checkbox โค้ง 6px ขนาด 20px และ popup option โค้ง 8px เส้นขอบเน้นเฉพาะขอบเขตคอนโทรลหรือการแบ่งข้อมูล วงกลมเล็กใช้กับจุดสถานะ ไม่ทำทุกพื้นผิวเป็น pill

## Components

### Buttons

ปุ่มหลักใช้ action กับข้อความขาว สูงอย่างน้อย 44px padding 10px 16px; hover ใช้ action-deep ปุ่มรองเป็นพื้นขาวและเส้น line Disabled ลด opacity ครึ่งหนึ่งและกดไม่ได้ Focus outline ใช้ action หนา 2px ห่าง 4px กฎ global ทำให้คอนโทรลส่วนใหญ่โค้ง 10px

### Inputs, textarea and form feedback

SearchInput มีไอคอนและปุ่มล้างที่ออกแบบเอง TextArea ขยายตามเนื้อหา 112–360px Notes จำกัด 2000 ตัวอักษร Form แสดงข้อผิดพลาดในหน้า พร้อม aria-invalid และ focus ช่องผิด สร้างรูปลักษณ์เองแทน native validation bubble

### Checkbox and select

Checkbox รักษา native input semantics พร้อม checkmark ของระบบ แถวตรวจเป็นเส้นแบ่งเบา ไม่เติมพื้นทุกครั้งที่ checked Select เป็น combobox/listbox ผ่าน portal รองรับลูกศร Home/End, Enter/Space, Escape, Tab, typeahead และ outside click ตัวเลือกบทบาทด้านบนกว้าง 180px สูงอย่างน้อย 44px

### Navigation

เมนูแนวนอนบนพื้นขาว ใช้ข้อความน้ำตาลรอง ไอคอน และจำนวนจากข้อมูลจริง Selected เป็นพื้นทรายอ่อนกับตัวอักษรหลัก มี aria-current บนหน้าที่เลือก บน mobile ปุ่มเมนูมี aria-expanded/aria-controls และปิดหลังเลือกหน้า

### Registry masthead and status

ชื่อย่อมาจากตัวอักษรแรกของชื่อสัตว์ใน record ไม่สร้างรูปสัตว์แทนข้อมูลจริง หัวทะเบียนแสดงชื่อ ประเภท PC ID และสถานะตัวสัตว์ เจ้าของ ทะเบียน ปุ่มข้อมูลทะเบียนเปิดสถานะสัตว์หาย ผู้ถือทะเบียน และรุ่นบัตร เมื่อไม่มีบัตรแสดง “ยังไม่ออกบัตร” สัตว์หายยังมีคำเตือนแม้ส่วนอ้างอิงปิด สถานะใช้จุดและข้อความตามข้อมูล

**The Honest Registry Rule.** แสดงชื่อย่อและข้อมูลจาก record ที่เลือก และคงข้อความยังไม่ออกบัตรเมื่อยังไม่มีบัตรจริง

### Evidence, readiness and signing review

หลักฐานเปิดอ่านข้างแบบบันทึก มี placeholder ก่อนเปิดและข้อผิดพลาดจริง Readiness อัปเดตจำนวนผ่าน aria-live และเปลี่ยนสีเมื่อครบเงื่อนไข สรุปความพร้อมช่วยอ่านเงื่อนไข ไม่แทน validation หรือการตรวจสิทธิ์

ร่าง checkbox และบันทึกเก็บแยกเคสใน memory สลับเคสยังเก็บร่าง แต่เปลี่ยนส่วนงาน session หรือ refresh จะล้างร่าง ไม่ใช่การบันทึกถาวร แผงก่อนลงนามแสดงเป้าหมาย ผลของการยืนยัน และ Wallet โดยไม่คัดลอกหลักฐานหรือเลขชิปดิบ

### Tooltip and motion

Tooltip ใช้พื้นหมึกน้ำตาลกับข้อความขาว เปิดด้วย hover/focus และปิดด้วย Escape หน่วงเปิด 180ms และมีช่วงข้ามช่องว่าง 160ms

เลือกเคสใช้ Web Animations API clip-path/opacity 220ms และ cubic-bezier(0.22, 1, 0.36, 1) ยกเลิกก่อน reselection และตอน unmount ข้อมูลทะเบียนกับหลักฐานเปิดด้วย clip-path 180ms dropdown scaleY/opacity 140ms Press feedback ของเมนู Wallet และปุ่มแบบตรวจ scale .985 ภายใน 100ms Feedback สีทั่วไป 150ms cubic-bezier(0.22, 1, 0.36, 1) ความพร้อมเปลี่ยนสี/เส้น 180ms Reduced motion ปิด spatial effects และคง feedback สีทั่วไป ไม่มีการเคลื่อนไหววนเพื่อตกแต่ง

ตัวอย่าง HTML/CSS ใน sidecar แสดงรูปลักษณ์ของ primitive แบบ standalone ไม่จำลอง event/state ของ React; combobox preview ไม่เปิด popup และ textarea preview ไม่ทำ auto-size

## Do's and Don'ts

### Do

- **Do** ยึดค่าสีและขนาดใน frontmatter และตรวจ source ปัจจุบันก่อนเปลี่ยน
- **Do** คง visible focus, keyboard navigation, inline error และ reduced motion ของคอนโทรล
- **Do** ใช้ชื่อย่อ เลขทะเบียน และสถานะจาก record จริงเชื่อมคิวกับรายละเอียด
- **Do** แยกโหมดสาธิตจากการยืนยันธุรกรรมจริงอย่างชัดเจน

### Don't

- **Don't** คืนหน้าตา native select, checkbox, tooltip หรือ validation bubble โดยไม่รักษาชุดคอนโทรลปัจจุบัน
- **Don't** เพิ่มกราฟ ตัวเลขสถิติ QR หรือภาพสัตว์ที่สร้างขึ้นแล้วอ้างว่าเป็นข้อมูลจริง
- **Don't** ใช้สีไล่หลาย hue, glow หรือ animation วนบนองค์ประกอบที่ไม่มีการเปลี่ยนสถานะ
- **Don't** นำข้อกำหนดนี้ไปครอบ Owner/Public โดยอัตโนมัติ

ค่ามาจาก web/src/features/admin/tailwind.config.js, workspace.css, WorkspaceChrome.jsx, components.jsx, controls.jsx, GovernancePanels.jsx และ CaseWorkspace.jsx โดยเอกสารนี้ไม่ยืนยันการเชื่อม Backend/MetaMask/Contract จริง ผลทดสอบอยู่ใน docs/test-report.md

### การแก้ workflow หลัง critique
- ร่างฟอร์มเก็บในหน่วยความจำระดับ workspace แยก Wallet/เครือข่ายและประเภทงาน: Vet, Reviewer, ข้อพิพาท, ข้อเสนอกรรมการ และสิทธิ์บุคลากร สลับหน้าแล้วร่างยังอยู่ ล้างเฉพาะรายการที่สำเร็จ ไม่เก็บลง localStorage และร่างหายเมื่อ reload
- การสลับบัญชีสาธิตแสดงเฉพาะร่างของ Wallet นั้น ส่วน live accountsChanged/chainChanged ล้างร่างทั้งหมดพร้อมยกเลิก session เพื่อไม่ส่งข้อมูลข้ามบัญชี
- หน้ากรรมการเลือกทะเบียนจากผลค้นหาชื่อหรือรหัส PC แสดงสถานะและเปิดทะเบียนได้ ทั้งตอนสร้างข้อเสนอและจากรายการข้อเสนอ
- หน้าข้อพิพาท/จัดการสิทธิ์บอกบทบาทที่ต้องใช้ใกล้ปุ่มที่ไม่มีสิทธิ์
- Navigation ช่วง 768–1399px จัด 4 คอลัมน์เป็น 4+3 รายการ; ช่วง 768–1000px ย้ายเมนูลงแถวเต็มความกว้าง ใต้แบรนด์/บัญชี รักษา theme และ motion เดิม


รายการในคิว: สถานะยังไม่เลือกใช้พื้นขาวและขอบ #ddcdbc แยกจากพื้น canvas; เว้นระหว่างรายการ 8px สถานะเลือกใช้พื้น #eadbca ขอบ control และไอคอน check แทน chevron เพื่อแยกสถานะได้มากกว่าสีอย่างเดียว

แถบ navigation: พื้นขาว ขอบ #ddcdbc ใช้เส้นขอบแทนเงา เมนูปกติ text-ink; เมนูปัจจุบันพื้น action และตัวอักษร/จำนวนรายการสีขาว hover ใช้ action-deep ส่วนเมนูอื่น hover พื้น #faf3ea

โซนหัวหน้า (.pc-page-context): รวมชื่อหน้าและสถานะโหมดไว้บนพื้นขาว ขอบ #ddcdbc มุม 16px padding 24px แบ่งแถบโหมดด้วยเส้น line ปุ่มอัปเดตมีขอบและพื้นขาว ช่องบทบาทใช้พื้น search และขอบ control เพื่อให้เห็นพื้นที่โต้ตอบชัด
