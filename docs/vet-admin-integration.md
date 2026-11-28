# Vet/Admin integration handoff — rattanapon

สถานะ: frontend และโหมดสาธิตพัฒนาแล้ว; API payload ด้านล่างเป็น **ข้อเสนอสำหรับตกลงกับ kanakarn** ไม่ใช่ endpoint ที่ Backend ทำเสร็จแล้ว ไม่เปลี่ยน server/schema/Owner/Public/Contract ของเพื่อน

## เปิดใช้งาน

จาก root repository:

```powershell
cd web
npm install
node node_modules/vite/bin/vite.js --config src/features/admin/vite.config.js
```

เปิด `http://127.0.0.1:5174/?demo=1` เพื่อสาธิต ข้อมูลอยู่ใน memory รีโหลดแล้วเริ่มใหม่ ไม่ใช่ธุรกรรมจริง และไม่มีลิงก์ Etherscan ปลอม

เปิด `http://127.0.0.1:5174/` เพื่อเชื่อมจริง ตั้ง `VITE_API_URL` และ `VITE_CONTRACT_ADDRESS` ใน `web/.env.local` ตาม manifest จริง ใช้ chain ID 11155111 เท่านั้น ไฟล์ env นี้ห้าม commit ห้ามใส่ secret ในตัวแปร VITE

```powershell
# จาก web/
node node_modules/vite/bin/vite.js build --config src/features/admin/vite.config.js
node node_modules/vite/bin/vite.js preview --config src/features/admin/vite.config.js --port 4174
```

ผล build อยู่ `web/src/features/admin/dist/` (Git ignore ตามกฎ dist เดิม) เป็น entry แยก ไม่มีการเปลี่ยน `App.jsx`, routing หรือ styles ของเพื่อน เมื่อต้องรวม router ให้นรวัฒน์ mount `<Workspace />` ที่ route ของทีม โดย service รับผ่าน module boundary เดิม; งานนี้ยังไม่ได้เชื่อม router Owner/Public

## Authentication และ authorization

- `POST /auth/nonce`: body `{address, chainId:11155111, domain}`; response `{nonce, message}` โดย message เป็น SIWE แบบ EIP-4361 มี host, checksum address, URI ตรง origin, Version 1, Chain ID 11155111, nonce ≥8 ตัวอักษร/ตัวเลข, Issued At และ Expiration Time อายุไม่เกิน 10 นาที (แนะนำ 5 นาที)
- `POST /auth/verify`: `{message, signature}`; response `{csrfToken}` พร้อม HttpOnly session cookie ผูก wallet/domain/chain/expiry และ nonce ใช้ครั้งเดียว
- Frontend ส่ง `credentials:include`; POST หลัง login ส่ง `X-CSRF-Token` Backend ต้องตรวจ Origin/CSRF, nonce replay, session expiry และสิทธิ์ทุก request เอง ห้ามเชื่อ roles/action/account ที่ frontend ส่งมา
- หากใช้ API คนละ origin ต้องอนุญาต CORS origin เจาะจงพร้อม credentials และตั้ง cookie ตาม deployment จริง สำหรับ dev แนะนำใช้ hostname เดียวกันทั้ง web/API (`127.0.0.1` หรือ `localhost` อย่างใดอย่างหนึ่ง)
- Frontend อ่าน `hasRole` และ `getCommittee` จาก Contract ก่อนส่งธุรกรรมทุกครั้ง ตรวจบัญชีและ chain ซ้ำ ล้างหน้าจอ/หลักฐาน/confirmation เมื่อ wallet เปลี่ยน shared `switchToSepolia`, `getContract`, explorer links ถูกนำมาใช้โดยไม่แก้ไฟล์ shared; ไม่เรียก shared `connect()` เพราะเปรียบเทียบ bigint กับ number ใน skeleton

## Queue contract

GET ทั้งหมดคืน `{items:[...]}` ใช้ string สำหรับ uint256 IDs เพื่อไม่สูญ precision ยังไม่มี pagination ใน client เวอร์ชันนี้: backend ต้องส่งรายการครบภายในชุดข้อมูล demo/MVP; เพิ่ม pagination ร่วมกันก่อนใช้ข้อมูลจำนวนมาก

| Endpoint | ผู้ใช้ | Response item |
|---|---|---|
| `GET /vet/requests` | VET_ROLE | PetReview ด้านล่าง รวมรายการที่รับรองแล้วสำหรับประวัติ |
| `GET /admin/requests` | REVIEWER_ROLE | PetReview รวม Active/Suspended เพื่อดูแลทะเบียน |
| `GET /admin/disputes` **เสนอเพิ่ม** | REVIEWER_ROLE / COMMITTEE | `{id,petId,claimant,status,frozen,evidence:[Evidence]}` |
| `GET /admin/proposals` **เสนอเพิ่ม** | COMMITTEE | `{id:bytes32,type:"resolution"|"governance",notes,...}` |
| `GET /admin/audit` **เสนอเพิ่ม** | ผู้มีสิทธิ์ผู้รับรอง | `{id,action,subject,actor,at:ISO8601,txHash?}` |

```json
{
  "id": "1",
  "name": "ชื่อสัตว์จากข้อมูลที่มีสิทธิ์อ่าน",
  "species": "แมว · สายพันธุ์",
  "chip": true,
  "evidence": [{"id":"opaque-file-id","name":"หลักฐานการรับเลี้ยง"}]
}
```

`chip` แปลว่ามีหลักฐานชิปให้ตรวจ ไม่ใช่เลขชิปดิบ Frontend ไม่คำนวณ HMAC หรือสร้าง digest หลักฐานเอง สถานะ Pet, holder, cardVersion, dispute, proposal outcome/target/votes/expiry อ่านทับจาก Chain โดย adapter ไม่ใช้ค่าจาก indexer เป็นแหล่งตัดสินสุดท้าย ก่อนโหวตเทียบ fingerprint รายละเอียดกับ snapshot ที่ผู้ใช้เห็น

`GET /evidence/:id` ตาม Project.md: authorize การเข้าถึงเอกสารแต่ละชิ้น ตอบ binary MIME `application/pdf`, `image/png` หรือ `image/jpeg` พร้อม private/no-store, nosniff และ audit การเข้าถึง Frontend ไม่เปิด URL arbitrary จาก payload ไม่เก็บหลักฐานใน localStorage

## Prepare actions — API สำเร็จยังไม่ใช่ Chain สำเร็จ

| Endpoint | Request | Response |
|---|---|---|
| `POST /vet/requests/:id/review` | `{id,inspected:true,chipRead:true,notes}` | `{chipToken:bytes32,evidenceDigest:bytes32}` |
| `POST /admin/requests/:id/review` | `{id,reviewed:true,notes}` | `{evidenceDigest:bytes32}` |
| `POST /admin/requests/:id/review` | `{id,action:"suspendRegistration",suspended:boolean,notes}` | `{}` หลังเก็บเหตุผลภายใน |
| `POST /admin/disputes/:id/review` **เสนอเพิ่ม** | `{id,accept:boolean,notes}` | `{}` หลังเก็บเหตุผลคัดกรอง |
| `POST /admin/proposals/prepare` **เสนอเพิ่ม** | `{type:"proposeResolution",id,outcome,notes}` หรือ `{type:"proposeGovernanceChange",action,id?,address?,seat?,notes}` | `{reasonDigest:bytes32}` |

Backend ตรวจและเก็บ canonical evidence bundle พร้อม nonce สุ่ม ทำ HMAC chip token ด้วย secret ฝั่ง server และเช็กชิปซ้ำด้วย unique constraint ก่อนคืนค่า ทุก prepare ต้อง retry ได้โดยไม่ mark ผลตัดสินบน Chain สำเร็จล่วงหน้า

Outcome ตรง enum Contract: `RejectClaim=0`, `ChangeHolder=1`, `MarkUnresolved=2`; governance `ReplaceCommitteeSeat=0`, `RevokeAnimalVerification=1`; seat 0–2 Proposal ใหม่ยังมี 0 approvals ผู้เสนอต้องโหวตด้วยเช่นเดียวกับกรรมการอื่น

Frontend เรียก staticCall ก่อนส่ง, รอ receipt 2 confirmations, ตรวจ receipt.status และ event จาก Contract จริง ธุรกรรมที่ถูกแทนที่จะตรวจ to/data เดิมก่อนยืนยัน ลิงก์ explorer มาจาก hash ที่ wallet คืนเท่านั้น เหตุผล suspension ส่งบน Chain เป็นข้อความทั่วไป; notes ส่วนตัวส่ง API เท่านั้น

Backend indexer ต้องตรวจ chain/contract/receipt/events จริงและทำ idempotent/reorg handling ตามขอบเขต kanakarn หลังธุรกรรมยืนยัน frontend โหลด queue ใหม่; หาก indexer ยังตามไม่ทัน ให้แสดงสถานะยืนยันธุรกรรมพร้อมอัปเดตข้อมูลภายหลัง ห้ามอ้างว่า 2 confirmations เป็น finality

## รวมงานผ่าน develop

1. kanakarn ตกลง/ปรับ payload ข้างต้นและทำ API ใน branch ตัวเอง; norawat ทำ shared wallet/router ตามขอบเขตเดิม
2. jarukit ส่ง deployment manifest, ABI และผลทดสอบ Contract จริง; minimal ABI ของส่วนนี้อ้างอิง `contracts/PetChain.sol` ณ main `a309b08` ต้องเทียบใหม่ถ้า ABI เปลี่ยน
3. รวม PR ของแต่ละคนเข้า `develop`; ให้เพื่อน review ตาม Team.md ก่อน merge
4. ตั้ง env ของ integration environment, seed หลายบัญชีและ role จริง, รัน backend authorization/API tests ของเพื่อนและ frontend tests ชุดนี้
5. ใช้ Owner/Public UI จริงแทน owner fixtures แล้วสาธิตครบวงจรบน Sepolia พร้อม tx hashes จริง ไม่ใช้ผล demo แทนผล live

หาก API รูปแบบต่าง ให้ปรับ `features/admin/live.js` กับเอกสารนี้เป็นจุดหลักโดยไม่เปลี่ยนฟอร์มส่วนอื่นตาม backend implementation ภายใน
