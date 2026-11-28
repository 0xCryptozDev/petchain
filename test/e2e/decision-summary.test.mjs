import test from "node:test";
import assert from "node:assert/strict";
import { decisionSummary } from "../../web/src/features/admin/decision-summary.js";

const data = {
  pets: [{ id: "1", name: "คนละทะเบียน", cardVersion: 1 }, { id: "7", name: "มะลิ", cardVersion: 2, rawChip: "PRIVATE-CHIP" }],
  disputes: [{ id: "1", petId: "7" }],
  proposals: [{ id: "proposal-1", disputeId: "1", outcome: "RejectClaim", type: "resolution" }],
};
test("dispute and approval summaries resolve their pet through the dispute, not overlapping IDs", () => {
  for (const [action, id] of [["reviewDispute", "1"], ["approveResolution", "proposal-1"]]) {
    const rows = decisionSummary(action, { id, accept: true }, data);
    assert.deepEqual(rows[0], ["ทะเบียนเป้าหมาย", "มะลิ · PC-0007"]);
    assert.doesNotMatch(JSON.stringify(rows), /PRIVATE-CHIP|คนละทะเบียน/);
  }
});
test("governance approval includes the full recipient and one-based committee seat", () => {
  const address = "0x1234567890123456789012345678901234567890";
  const rows = decisionSummary("approveGovernanceChange", { id: "gov" }, {
    ...data, proposals: [{ id: "gov", action: "ReplaceCommitteeSeat", seat: 2, address }],
  });
  assert.ok(rows.some(([label, value]) => label === "ที่นั่งกรรมการ" && value === "3"));
  assert.ok(rows.some(([, value]) => value === address));
});
test("card and suspension summaries describe the actual requested consequence", () => {
  assert.match(JSON.stringify(decisionSummary("issueCard", { id: "7" }, data)), /รุ่น 3/);
  assert.match(JSON.stringify(decisionSummary("suspendRegistration", { id: "7", suspended: true }, data)), /ระงับทะเบียน/);
  assert.match(JSON.stringify(decisionSummary("suspendRegistration", { id: "7", suspended: false }, data)), /ปลดระงับทะเบียน/);
});
