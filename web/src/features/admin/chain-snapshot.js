const outcomes = ["RejectClaim", "ChangeHolder", "MarkUnresolved"];
const actions = ["ReplaceCommitteeSeat", "RevokeAnimalVerification"];
const disputeStatuses = [
  "None",
  "Submitted",
  "UnderReview",
  "Resolved",
  "Unresolved",
  "Rejected",
];
export function proposalFingerprint(q) {
  return JSON.stringify([
    q.id,
    q.type,
    q.disputeId,
    q.outcome,
    q.action,
    q.petId,
    q.address?.toLowerCase(),
    q.seat,
    q.reasonDigest?.toLowerCase(),
    q.expiry,
  ]);
}
export async function hydrateProposal(contract, record, account, committee) {
  if (
    !/^0x[0-9a-fA-F]{64}$/.test(record.id) ||
    !["resolution", "governance"].includes(record.type)
  )
    throw new Error("รูปแบบข้อเสนอไม่ถูกต้อง");
  const resolution = record.type === "resolution";
  const p = await contract[resolution ? "resolutionProposals" : "govProposals"](
    record.id,
  );
  if (BigInt(p.expiry) === 0n) throw new Error("ไม่พบข้อเสนอบน Chain");
  const approved = resolution ? "resolutionApproved" : "govApproved";
  const votes = await Promise.all(
    committee.map((a) => contract[approved](record.id, a)),
  );
  const q = {
    ...record,
    expiry: Number(p.expiry) * 1000,
    executed: p.executed,
    reasonDigest: resolution ? p.reasonDigest : p.paramsDigest,
    approvals: committee.filter((_, i) => votes[i]),
    approvalCount: Number(p.approvals),
    voted: await contract[approved](record.id, account),
    ...(resolution
      ? { disputeId: String(p.disputeId), outcome: outcomes[Number(p.outcome)] }
      : {
          action: actions[Number(p.action)],
          petId: String(p.petId),
          address: p.newMember,
          seat: Number(p.seat),
        }),
  };
  // Only the relevant on-chain fields are rendered and bound into confirmation.
  if (resolution) {
    delete q.action;
    delete q.petId;
    delete q.address;
    delete q.seat;
  } else {
    delete q.outcome;
    delete q.disputeId;
  }
  q.fingerprint = proposalFingerprint(q);
  return q;
}
export async function hydrateDispute(contract, record) {
  if (!/^[1-9]\d*$/.test(record.id)) throw new Error("รหัสข้อพิพาทไม่ถูกต้อง");
  const d = await contract.getDispute(record.id);
  return {
    ...record,
    petId: String(d.petId),
    claimant: d.claimant,
    status: disputeStatuses[Number(d.status)],
    frozen: d.frozen,
  };
}
