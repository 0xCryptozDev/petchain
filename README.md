# PetChain — Blockchain Pet Identity & Ownership Registry

ต้นแบบนักศึกษา: ทะเบียนและบัตรดิจิทัลสัตว์เลี้ยงบน Ethereum Sepolia Testnet
ตรวจสอบสถานะได้ ป้องกันการรับรองไมโครชิปซ้ำ บันทึกผู้รับรองและประวัติการเปลี่ยนทะเบียน
รองรับสัตว์หาย การโอนทะเบียนสองฝ่าย ข้อพิพาท และการอนุมัติ 2 ใน 3 ของคณะกรรมการ

> สถานะปัจจุบัน: **โครงโครงสร้าง (skeleton)** — ยังไม่มี contract address, deployment
> transaction หรือ verified source จริง ห้ามอ้างผล deployment ก่อน deploy จริงบน Sepolia
> สเปกฉบับเต็มอยู่ที่ [Project.md](Project.md) และแผนแบ่งงานที่ [Team.md](Team.md)

## Tech Stack

| ส่วน | เครื่องมือ |
|---|---|
| Smart Contract | Solidity + OpenZeppelin AccessControl — เขียน/compile/deploy ผ่าน [Remix IDE](https://remix.ethereum.org/) |
| Network | Ethereum Sepolia (chain ID `11155111`) ผ่าน MetaMask |
| Explorer | [Sepolia Etherscan](https://sepolia.etherscan.io/) — verify source + ตรวจธุรกรรม |
| Frontend | React + Vite + Tailwind CSS + ethers v6 + MetaMask |
| Backend | Node.js + Express + Prisma + PostgreSQL |

## โครงสร้าง Repository

```text
petchain/
├── contracts/          # PetChain.sol + คู่มือ compiler/deploy (Remix)
├── deployments/        # deployment manifest (template — ยังไม่มีค่าจริง)
├── server/             # Express API
├── prisma/             # Prisma schema + migrations
├── web/                # React app
│   └── src/features/   # owner / public / vet / admin / shared
├── test/               # contracts / api / e2e
├── docs/               # เอกสารประกอบ (architecture, ERD, state diagram)
├── scripts/            # สคริปต์ตั้งค่า repo/branch
├── Project.md          # สเปกฉบับเต็ม (requirement, contract spec, DB, API)
└── Team.md             # แผนแบ่งงานทีม 4 คน + workflow
```

## Branch และผู้รับผิดชอบ

| Branch | สมาชิก | บทบาท | ขอบเขตหลัก |
|---|---|---|---|
| `main` | ทั้งทีม | — | รุ่นเสถียร เฉพาะ merge จาก `develop` |
| `develop` | ทั้งทีม | — | จุดรวม integration |
| `jarukit/contracts` | จารุกิตติ์ | Blockchain Developer | `contracts/`, `deployments/`, `test/contracts/` |
| `kanakarn/backend` | ฆนาการ | Backend Developer | `server/`, `prisma/`, `test/api/` |
| `norawat/owner-public` | นรวัฒน์ | Owner & Public Frontend | `web/src/features/owner/`, `public/`, `shared/` |
| `rattanapon/vet-admin` | รัตนพล | Vet/Admin Frontend & QA | `web/src/features/vet/`, `admin/`, `test/e2e/`, `docs/` |

Workflow: แต่ละคนทำงานใน branch ตัวเอง → PR เข้า `develop` → ให้สมาชิกคนอื่น review
อย่างน้อย 1 คน → merge `develop` เข้า `main` เมื่อเสถียร

## เริ่มงานอย่างไร

### 1. ตั้งค่า repo ครั้งแรก (เฉพาะคนทำ repo)
ต้องมี [GitHub CLI](https://cli.github.com/) และล็อกอินแล้ว (`gh auth login`):

```bash
bash scripts/setup-github.sh
```

สคริปต์จะ `git init`, commit โครงเริ่มต้น, สร้าง repo `0xCryptozDev/petchain`
(public), push `main`, สร้างและ push `develop` + branch รายชื่อสมาชิกทั้ง 4

### 2. Smart Contract (Remix — ไม่ต้องติดตั้ง Hardhat)
1. เปิด [Remix IDE](https://remix.ethereum.org/) → import `contracts/PetChain.sol`
2. Compiler: Solidity `0.8.20+`, optimizer on, EVM version `paris` ขึ้นไป (รายละเอียดใน [contracts/README.md](contracts/README.md))
3. ทดสอบบน Remix VM หลายบัญชีก่อนเสมอ
4. Deploy จริง: MetaMask → Sepolia → Injected Provider → บันทึก address / tx hash / block ลง `deployments/`
5. Verify source บน Sepolia Etherscan แล้วอัปเดต manifest ให้ทีม

### 3. Backend
```bash
cd server && npm install
cp .env.example .env       # กรอกค่าเอง — ห้าม commit .env
npx prisma migrate dev
npm run dev
```

### 4. Frontend
```bash
cd web && npm install
cp .env.example .env       # VITE_* ทั้งหมดต้องเป็นค่าที่เปิดเผยได้
npm run dev
```

## กฎของทีม (สำคัญ)

- **ห้าม commit** `.env`, private key, seed phrase หรือหลักฐานจริงของผู้ใช้ — ใช้ `.env.example` เสมอ
- **ห้ามสร้างข้อมูลจำลองแล้วอ้างเป็นของจริง** — contract address, tx hash, ผล verify
  ต้องมาจากธุรกรรมจริงบน Sepolia เท่านั้น (ดู `deployments/README.md`)
- ข้อมูลส่วนตัว (ชื่อจริง ที่อยู่ เอกสาร เลขชิปดิบ) **ห้ามขึ้น Chain หรือ calldata/events** — ใช้ digest + nonce
- เปลี่ยน schema, ABI หรือ enum ต้องแจ้งทีมและปรับ integration tests ให้ตรงกัน
- ทุกคนใช้ wallet แยกบัญชีตามบทบาท (Owner A/B, Vet, Reviewer, Committee ×3) — ห้ามแชร์ seed phrase

## เอกสาร

- [Project.md](Project.md) — สเปกฉบับเต็ม: workflow, contract spec, DB design, API, edge cases, ข้อจำกัด
- [Team.md](Team.md) — แผนแบ่งงาน, checklist ก่อนส่ง, การนำเสนอ
- [docs/](docs/) — สถานะเอกสารที่ต้องเก็บระหว่างทำงาน

## License

MIT — ดู [LICENSE](LICENSE)
