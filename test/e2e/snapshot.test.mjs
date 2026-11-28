import test from "node:test";
import assert from "node:assert/strict";
import {
  hydrateProposal,
  hydrateDispute,
  proposalFingerprint,
} from "../../web/src/features/admin/chain-snapshot.js";
test("proposal decisions and target come from chain instead of stale indexer", async () => {
  const record = {
    id: `0x${"1".repeat(64)}`,
    type: "governance",
    action: "RevokeAnimalVerification",
    petId: "44",
    outcome: "ChangeHolder",
    approvals: [],
    expiry: 0,
  };
  const c = {
    govProposals: async () => ({
      action: 0,
      petId: 0n,
      newMember: "0x123",
      seat: 2n,
      paramsDigest: "digest",
      expiry: 123n,
      executed: false,
      approvals: 1n,
    }),
    govApproved: async (_, a) => a === "a",
  };
  const q = await hydrateProposal(c, record, "a", ["a", "b", "c"]);
  assert.equal(q.action, "ReplaceCommitteeSeat");
  assert.equal(q.address, "0x123");
  assert.equal(q.seat, 2);
  assert.equal(q.outcome, undefined);
  assert.equal(q.expiry, 123000);
  assert.equal(q.voted, true);
  assert.notEqual(
    proposalFingerprint({ ...q, address: "0x456" }),
    q.fingerprint,
  );
});
test("dispute acceptance state comes from chain", async () => {
  const d = await hydrateDispute(
    {
      getDispute: async () => ({
        petId: 7n,
        claimant: "wallet",
        status: 2n,
        frozen: true,
      }),
    },
    { id: "1", status: "Submitted", petId: "2" },
  );
  assert.equal(d.status, "UnderReview");
  assert.equal(d.petId, "7");
});
