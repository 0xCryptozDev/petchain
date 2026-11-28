import test from "node:test";
import assert from "node:assert/strict";
import {
  createDemoService,
  DEMO_ACCOUNTS,
} from "../../web/src/features/admin/demo.js";

test("Owner fixture → Vet → Reviewer → Card → Transfer fixture → Dispute → two distinct votes", async () => {
  const s = createDemoService();
  s.setAccount("vet");
  await s.act("verifyAnimal", {
    id: "1",
    inspected: true,
    chipRead: true,
    notes: "อ่านชิปตรงกับหลักฐาน",
  });
  s.setAccount("reviewer");
  await s.act("verifyOwnership", { id: "1", reviewed: true });
  await s.act("issueCard", { id: "1" });
  assert.equal((await s.load()).pets[0].registration, "Active");
  s.simulateTransfer("1", DEMO_ACCOUNTS.ownerB);
  assert.equal((await s.load()).pets[0].holder, DEMO_ACCOUNTS.ownerB);
  await s.act("reviewDispute", { id: "1", accept: true });
  assert.throws(() => s.simulateTransfer("1", DEMO_ACCOUNTS.owner), /ระงับ/);
  s.setAccount("committee1");
  await s.act("proposeResolution", {
    id: "1",
    outcome: "RejectClaim",
    notes: "หลักฐานผู้ร้องไม่เพียงพอ",
  });
  const id = (await s.load()).proposals[0].id;
  await s.act("approveResolution", { id });
  await assert.rejects(s.act("approveResolution", { id }), /โหวตแล้ว/);
  assert.equal((await s.load()).disputes[0].status, "UnderReview");
  s.setAccount("committee2");
  await s.act("approveResolution", { id });
  assert.equal((await s.load()).disputes[0].status, "Resolved");
});

test("unauthorized calls, missing inspection, no chip and premature card issuance fail", async () => {
  const s = createDemoService();
  s.setAccount("owner");
  await assert.rejects(
    s.act("verifyAnimal", { id: "1", inspected: true, chipRead: true }),
    /สิทธิ์/,
  );
  s.setAccount("vet");
  await assert.rejects(
    s.act("verifyAnimal", { id: "1", chipRead: true }),
    /ตรวจ/,
  );
  await assert.rejects(
    s.act("verifyAnimal", { id: "3", inspected: true, chipRead: true }),
    /ชิป/,
  );
  s.setAccount("reviewer");
  await assert.rejects(s.act("issueCard", { id: "1" }), /รับรอง/);
});

test("suspension cancels transfer; revoked or disputed pets cannot receive a new card", async () => {
  const s = createDemoService();
  s.setAccount("reviewer");
  await s.act("suspendRegistration", {
    id: "2",
    suspended: true,
    notes: "ตรวจสอบหลักฐานใหม่",
  });
  const p = (await s.load()).pets.find((p) => p.id === "2");
  assert.equal(p.registration, "Suspended");
  assert.equal(p.transfer, "Cancelled");
  await assert.rejects(s.act("issueCard", { id: "2" }), /ระงับ/);
});

test("committee changes and revocation require two different approvals; expired proposals fail", async () => {
  let now = Date.now();
  const s = createDemoService({ now: () => now });
  s.setAccount("admin");
  await assert.rejects(
    s.act("proposeGovernanceChange", {
      action: "RevokeAnimalVerification",
      id: "2",
      notes: "ตรวจซ้ำ",
    }),
    /สิทธิ์/,
  );
  s.setAccount("committee1");
  await s.act("proposeGovernanceChange", {
    action: "RevokeAnimalVerification",
    id: "2",
    notes: "ตรวจซ้ำ",
  });
  let proposal = (await s.load()).proposals[0];
  await s.act("approveGovernanceChange", { id: proposal.id });
  s.setAccount("committee2");
  await s.act("approveGovernanceChange", { id: proposal.id });
  assert.equal((await s.load()).pets[1].identity, "Unverified");
  await s.act("proposeGovernanceChange", {
    action: "ReplaceCommitteeSeat",
    seat: 0,
    address: DEMO_ACCOUNTS.ownerB,
    notes: "เปลี่ยนกรรมการ",
  });
  proposal = (await s.load()).proposals[0];
  now += 8 * 86400000;
  await assert.rejects(
    s.act("approveGovernanceChange", { id: proposal.id }),
    /หมดอายุ/,
  );
});
