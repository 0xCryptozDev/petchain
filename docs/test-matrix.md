# Test matrix — rattanapon

ผล automated ชุดนี้จำกัดที่ frontend, demo model และ RPC/API ที่จำลองชัดเจน ไม่แทนการทดสอบ Contract/Backend ของเพื่อน

| กรณี | ตรวจอัตโนมัติ | ต้องตรวจ integration จริงเพิ่ม |
|---|---|---|
| Vet → Reviewer → Card | Node workflow + browser | Wallet/receipt และ API จริง |
| Owner registration → transfer | fixtures ใน Node workflow | Owner/Public UI และ Contract จริง |
| ผู้ไม่มีสิทธิ์รับรอง | demo service + disabled UI | bypass UI เรียก API/Contract ตรง |
| ตรวจตัวสัตว์/ชิปไม่ครบ, ไม่มีชิป | Node + browser | ชิปจริง/Backend HMAC |
| ชิปซ้ำ/สัตว์เหมือนกัน | ไม่อ้างผลผ่าน | Backend unique constraint + Contract |
| ระงับทะเบียนยกเลิกโอน | Node model | Contract และ indexer จริง |
| ข้อพิพาทคัดกรองก่อน freeze | Node + browser | API บันทึกเหตุผล + Chain |
| โหวต 2 คน, โหวตซ้ำ, proposal หมดอายุ | Node + browser | Contract จริงและ direct calls |
| เปลี่ยนกรรมการ/เพิกถอนชิป | Node model; browser สร้าง UI | governance บน Chain |
| grant/revoke Vet/Reviewer | browser + demo | role tx และ backend revocation |
| API proposal stale / target ผิด | hydrate snapshot unit test | indexer reconciliation จริง |
| wrong chain/account เปลี่ยนตอน SIWE | browser ผ่าน mock EIP1193 + ethers | MetaMask จริง |
| SIWE origin/nonce/chain/expiry | unit | Backend signature/nonce replay/CSRF |
| receipt revert/ไม่มี expected event | transaction unit | Sepolia revert/receipt จริง |
| tx replacement/cancellation/calldata เปลี่ยน | transaction unit | MetaMask replacement จริง |
| private evidence preview | browser demo | authorized/unauthorized GET ของ Backend |
| ไม่มี wallet/ไม่มี config | browser live entry | config deployment จริง |
| mobile, keyboard, no overflow | browser 390×844 | อุปกรณ์อื่นตามความเหมาะสม |
| desktop, runtime errors | browser 1440×1080 | browser อื่นเพิ่มเติม |
| RPC unavailable/reorg/insufficient gas | error paths มี UI; ไม่อ้างผล integration | RPC จริง + backend indexer |
