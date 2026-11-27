# PetChain — แผนทดสอบบน Remix VM (jarukit)

> ⚠️ สถานะ: เป็น **แผนทดสอบ ไม่ใช่ผลทดสอบ** — ยังไม่มีการ compile หรือรันจริง
> วิธีรัน: Remix IDE → Solidity Unit Testing plugin หรือ deploy บน Remix VM ด้วยหลายบัญชีแล้วทดสอบด้วยมือ
> เกณฑ์: ต้องผ่านทั้งกรณีสำเร็จ **และ** กรณี revert ทุกข้อก่อน deploy Sepolia

## Setup บน Remix VM
- Deploy `PetChain` ด้วย committee 3 บัญชีจำลอง แยกกัน (เช่น Account 1,2,3 จาก Remix)
- ตั้งสิทธิ์: grantVet(บัญชี 4), grantReviewer(บัญชี 5) ด้วย deployer
- บัญชี: OwnerA(6), OwnerB(7)

## Test matrix

| # | กรณี | ขั้นตอน | ผลที่ต้องได้ |
|---|---|---|---|
| T01 | ลงทะเบียน | OwnerA `registerPet(digest)` | event PetRegistered, สถานะ Pending, cardVersion 0 |
| T02 | กันชิปซ้ำ | Vet `verifyAnimal(petA, token, …)` แล้ว `verifyAnimal(petB, token เดิม, …)` | รายการแรกสำเร็จ; รายการสอง revert `ChipTokenAlreadyBound` |
| T03 | ออกบัตรก่อนรับรองครบ | Reviewer `issueCard` หลัง verifyAnimal แต่ยังไม่ verifyOwnership | revert `InvalidStatus` |
| T04 | ออกบัตรถูกต้อง | verifyOwnership → issueCard | event CardIssued, สถานะ Active, getCardStatus = (0, 1) |
| T05 | โอนโดยไม่ใช่เจ้าของ | OwnerB `requestTransfer(petA, …)` | revert `NotHolder` |
| T06 | โอนสองฝ่ายสำเร็จ | OwnerA request → OwnerB accept | holder เปลี่ยน, cardVersion +1, event TransferAccepted |
| T07 | คนอื่นมารับโอน | Account อื่น `acceptTransfer` | revert `not designated recipient` |
| T08 | โอนหมดอายุ | request expiry ในอดีต / รอหมดอายุแล้ว accept | revert `InvalidStatus`; สถานะ Expired |
| T09 | แจ้งหายแล้วโอน | reportMissing → requestTransfer | revert `pet missing`; คำขอเดิมถูกยกเลิก (getTransfer = Cancelled) |
| T10 | reportFound โดยคนอื่น | Account ธรรมดา `reportFound` | revert `not holder or vet` (Vet ทำได้ ✓) |
| T11 | ข้อพิพาทไม่ freeze ทันที | OwnerB `openDispute` | สถานะ Submitted, frozen = false |
| T12 | รับเรื่องแล้ว freeze | Reviewer `reviewDispute(accept=true)` | UnderReview + ownership = Disputed; โอนต่อ revert `ownership disputed` |
| T13 | ผู้ไม่มีสิทธิ์รับรอง | Account ธรรมดาเรียก verifyAnimal/issueCard/reviewDispute | revert ตาม AccessControl |
| T14 | โหวตซ้ำ | กรรมการคนเดิม `approveResolution` สองครั้ง | ครั้งสอง revert `DuplicateApproval` |
| T15 | อนุมัติ 1 คนยังไม่ execute | กรรมการ 1 คน approve | proposal ยังไม่ executed, dispute ยังไม่เปลี่ยน |
| T16 | อนุมัติ 2 คนต่างบัญชี | กรรมการอีกคน approve ผลเดียวกัน | DisputeResolved ตาม outcome; สถานะ dispute/pet เปลี่ยนถูกต้อง |
| T17 | ChangeHolder | outcome = ChangeHolder | holder = claimant, cardVersion +1, คำขอโอนค้างถูกยกเลิก |
| T18 | MarkUnresolved | outcome = MarkUnresolved | dispute = Unresolved, ownership คง Disputed — **โอนยังไม่ได้** |
| T19 | propose โดยไม่ใช่กรรมการ | OwnerA `proposeResolution`/`proposeGovernanceChange` | revert `NotCommittee` |
| T20 | Admin เดี่ยวเปลี่ยน committee | deployer `approveGovernanceChange` โดยตรง | revert `NotCommittee` — ต้องผ่าน proposal 2 ใน 3 เท่านั้น |
| T21 | เปลี่ยน committee | 2 กรรมการ approve ReplaceCommitteeSeat | CommitteeChanged; getCommittee ถูกต้อง; สมาชิกซ้ำ/zero revert |
| T22 | เพิกถอนผลรับรอง | 2 กรรมการ approve RevokeAnimalVerification | hasChipToken=false, identity=Unverified, registration=Suspended; chip token เดิมผูกใหม่ได้ |
| T23 | ระงับทะเบียน | `suspendRegistration(suspended=true)` | getCardStatus = (1, …); โอน revert; คำขอค้าง Cancelled |
| T24 | กรรมการ duplicate/zero ใน constructor | deploy ด้วย committee ซ้ำ | require revert |

## หลังผ่านครบ
- [ ] บันทึกผลรันจริง (screenshot + รายการ pass/fail) ที่ `docs/test-report.md`
- [ ] compile ด้วย settings ใน `contracts/README.md` ให้ตรงกับตอนจะ deploy
- [ ] ห้าม deploy Sepolia ก่อนผ่านครบทุกข้อ
