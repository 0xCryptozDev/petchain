# test/

| โฟลเดอร์ | ผู้รับผิดชอบ | เนื้อหา |
|---|---|---|
| `contracts/` | jarukit | Remix VM tests + กรณี unauthorized, duplicate chip, replay, double vote, transfer during dispute |
| `api/` | kanakarn | ทดสอบ API — การเข้าถึงเอกสารข้ามบัญชี, nonce replay, duplicate chip, event ซ้ำ |
| `e2e/` | rattanapan | Owner → Vet → Reviewer → Card → Transfer → Dispute ครบเส้นทาง |

กติกา: รายงานผลจากการรันจริงเท่านั้น — ห้ามแต่งผลทดสอบ
ทุกเส้นทางต้องทดสอบทั้งกรณีสำเร็จและล้มเหลว (Team.md เกณฑ์ผ่านของแต่ละคน)
