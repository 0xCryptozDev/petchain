# contracts/

โฟลเดอร์ Solidity ของ PetChain — compile, test และ deploy ผ่าน **Remix IDE**
(ตามสเปก Project.md §17.2 — ไม่ใช้ Hardhat)

## ไฟล์

- `PetChain.sol` — contract หลัก (โครงหลัก: บางฟังก์ชันยัง `revert NotImplemented`)
  ผู้รับผิดชอบ: **jarukit** (branch `jarukit/contracts`)

## Compiler settings (ต้องใช้เวอร์ชันเดียวกันทั้ง compile, deploy และ verify)

| ตัวแปร | ค่าที่แนะนำ |
|---|---|
| Compiler | Solidity `0.8.20` ขึ้นไป (แนะนำ `0.8.24+commit.e11b9ed9`) |
| Optimization | Enabled, 200 runs |
| EVM Version | `paris` ขึ้นไป |
| OpenZeppelin | `5.x` — Remix resolve อัตโนมัติจาก `import "@openzeppelin/contracts/..."` |
| License | MIT (SPDX หัวไฟล์) |

## ขั้นตอน deploy บน Sepolia (สรุป — ฉบับเต็มใน Project.md §17.2)

1. ทดสอบบน **Remix VM** ด้วยหลายบัญชีรวมกรณี revert ก่อน deploy จริงทุกครั้ง
2. MetaMask → เปิด Show test networks → Sepolia (chain ID `11155111`) พร้อม Test ETH จาก faucet
3. Deploy & Run → Environment: **Injected Provider - MetaMask** → ตรวจ chain ID และบัญชี deployer
4. Constructor argument: `address[3]` ของคณะกรรมการ 3 บัญชี (ต้องเป็นบัญชีจริงของทีม ไม่ใช่ address สมมติ)
5. หลัง deploy: บันทึก **contract address, deployment tx hash, block number, ABI และ compiler settings**
   ลง `deployments/` ตาม template — **ห้ามเดาค่า**
6. Verify source บน Sepolia Etherscan (Standard JSON Input, settings ตรงกับตอน deploy)
7. ตั้งสิทธิ์ Vet / Reviewer ผ่านธุรกรรมจริง (`grantVet`, `grantReviewer`)

## กติกาการแก้ไข

- เปลี่ยน enum, struct, event หรือ ABI → แจ้งทีมทุกคน (ฆนาการใช้ใน indexer, นรวัฒน์/รัตนพล ใช้ใน frontend)
- อย่า commit ABI build artifact ล่าสุดก่อน compile ผ่าน — ส่งผ่าน `deployments/` manifest
- ทดสอบของ contract เก็บที่ `test/contracts/`
