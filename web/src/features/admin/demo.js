// Isolated, explicitly selected demonstration. No persistence or real transactions.
export const DEMO_ACCOUNTS = Object.fromEntries(
  [
    "owner",
    "ownerB",
    "vet",
    "reviewer",
    "admin",
    "committee1",
    "committee2",
    "committee3",
  ].map((name, i) => [name, `0x${String(i + 1).padStart(40, "0")}`]),
);
const fail = (message) => {
  throw new Error(message);
};
export function createDemoService({ now = Date.now } = {}) {
  let account = "vet";
  const roles = Object.fromEntries(
    Object.entries(DEMO_ACCOUNTS).map(([name, address]) => [
      address,
      name === "vet"
        ? ["VET_ROLE"]
        : name === "reviewer"
          ? ["REVIEWER_ROLE"]
          : name === "admin"
            ? ["ADMIN_ROLE"]
            : [],
    ]),
  );
  const committee = [
    DEMO_ACCOUNTS.committee1,
    DEMO_ACCOUNTS.committee2,
    DEMO_ACCOUNTS.committee3,
  ];
  const pets = [
    {
      id: "1",
      name: "มะลิ",
      species: "แมว · ขาวมณี",
      identity: "Unverified",
      ownership: "Pending",
      registration: "Pending",
      chip: true,
    },
    {
      id: "2",
      name: "โมจิ",
      species: "สุนัข · ชิบะ",
      identity: "Verified",
      ownership: "Verified",
      registration: "Active",
      chip: true,
    },
    {
      id: "3",
      name: "ถั่วแดง",
      species: "แมว · ไทย",
      identity: "Uncertain",
      ownership: "Pending",
      registration: "Pending",
      chip: false,
    },
  ].map((p) => ({
    ...p,
    holder: DEMO_ACCOUNTS.owner,
    lost: "Normal",
    cardVersion: p.id === "2" ? 1 : 0,
    transfer: p.id === "2" ? "Pending" : "None",
    evidence: [
      {
        id: `demo-${p.id}`,
        name: "เอกสารตัวอย่างสำหรับสาธิต",
        text: "ข้อมูลจำลอง: หลักฐานการรับเลี้ยงและผลตรวจจากคลินิก ไม่ใช่เอกสารของบุคคลจริง",
      },
    ],
  }));
  const disputes = [
    {
      id: "1",
      petId: "1",
      claimant: DEMO_ACCOUNTS.owner,
      status: "Submitted",
      evidence: "ข้อมูลจำลอง: ผู้ร้องขอให้ทบทวนผู้ถือทะเบียน",
      frozen: false,
    },
  ];
  const proposals = [];
  const audit = [];
  function session() {
    return {
      account: DEMO_ACCOUNTS[account],
      roles: [
        ...roles[DEMO_ACCOUNTS[account]],
        ...(committee.includes(DEMO_ACCOUNTS[account]) ? ["COMMITTEE"] : []),
      ],
      chainId: 11155111,
    };
  }
  function requireRole(role) {
    if (!session().roles.includes(role)) fail("บัญชีนี้ไม่มีสิทธิ์ดำเนินการ");
  }
  function pet(id) {
    return pets.find((p) => p.id === id) || fail("ไม่พบทะเบียน");
  }
  function proposal(id) {
    return proposals.find((p) => p.id === id) || fail("ไม่พบข้อเสนอ");
  }
  function log(action, id) {
    audit.unshift({
      id: String(audit.length + 1),
      action,
      subject: id,
      actor: session().account,
      at: new Date(now()).toISOString(),
      demo: true,
    });
  }
  return {
    demo: true,
    session,
    setAccount(name) {
      if (!(name in DEMO_ACCOUNTS)) fail("ไม่พบบัญชี");
      account = name;
    },
    async connect() {
      return session();
    },
    async load() {
      return structuredClone({ pets, disputes, proposals, audit, committee });
    },
    async evidence(e) {
      return e.text;
    },
    simulateTransfer(id, recipient) {
      const p = pet(id);
      if (
        p.registration !== "Active" ||
        p.ownership !== "Verified" ||
        p.lost !== "Normal"
      )
        fail("ระงับการโอน");
      p.holder = recipient;
      p.cardVersion++;
      p.transfer = "Accepted";
    },
    async act(action, input, onStatus = () => {}) {
      onStatus({ status: "Awaiting signature", demo: true });
      if (["verifyAnimal", "reportFound"].includes(action))
        requireRole("VET_ROLE");
      else if (
        [
          "verifyOwnership",
          "issueCard",
          "suspendRegistration",
          "reviewDispute",
        ].includes(action)
      )
        requireRole("REVIEWER_ROLE");
      else if (
        ["grantVet", "grantReviewer", "revokeRolePublic"].includes(action)
      )
        requireRole("ADMIN_ROLE");
      else requireRole("COMMITTEE");
      const p = [
        "verifyAnimal",
        "reportFound",
        "verifyOwnership",
        "issueCard",
        "suspendRegistration",
      ].includes(action)
        ? pet(input.id)
        : null;
      switch (action) {
        case "verifyAnimal":
          if (!input.inspected || !input.chipRead)
            fail("ต้องตรวจตัวสัตว์และยืนยันการอ่านชิป");
          if (!p.chip) fail("สัตว์ไม่มีชิป ยังรับรองเต็มรูปแบบไม่ได้");
          if (p.identity === "Verified") fail("รับรองชิปแล้ว");
          p.identity = "Verified";
          break;
        case "verifyOwnership":
          if (!input.reviewed) fail("ต้องตรวจหลักฐานก่อนรับรอง");
          if (p.ownership === "Disputed") fail("ทะเบียนอยู่ระหว่างข้อพิพาท");
          p.ownership = "Verified";
          break;
        case "issueCard":
          if (["Suspended", "Revoked", "Deceased"].includes(p.registration))
            fail("ทะเบียนถูกระงับหรือเพิกถอน");
          if (p.identity !== "Verified" || p.ownership !== "Verified")
            fail("ต้องรับรองตัวสัตว์และเจ้าของครบ");
          p.registration = "Active";
          p.cardVersion++;
          break;
        case "suspendRegistration":
          if (!input.notes?.trim()) fail("กรุณาระบุเหตุผล");
          if (
            !input.suspended &&
            (p.identity !== "Verified" ||
              p.ownership !== "Verified" ||
              p.registration !== "Suspended")
          )
            fail("ยังปลดระงับไม่ได้ ต้องตรวจการรับรองก่อน");
          p.registration = input.suspended ? "Suspended" : "Active";
          if (input.suspended && p.transfer === "Pending")
            p.transfer = "Cancelled";
          break;
        case "reportFound":
          if (p.lost !== "Missing") fail("ไม่ได้อยู่ในสถานะสัตว์หาย");
          p.lost = "Normal";
          break;
        case "reviewDispute": {
          const d =
            disputes.find((d) => d.id === input.id) || fail("ไม่พบข้อพิพาท");
          if (d.status !== "Submitted") fail("คัดกรองแล้ว");
          d.status = input.accept ? "UnderReview" : "Rejected";
          d.frozen = input.accept;
          if (input.accept) {
            d.previousOwnership = pet(d.petId).ownership;
            pet(d.petId).ownership = "Disputed";
          }
          break;
        }
        case "proposeResolution": {
          const d = disputes.find((d) => d.id === input.id);
          if (d?.status !== "UnderReview")
            fail("ต้องรับเรื่องก่อนเสนอผลตัดสิน");
          if (
            !["RejectClaim", "ChangeHolder", "MarkUnresolved"].includes(
              input.outcome,
            ) ||
            !input.notes?.trim()
          )
            fail("กรุณาระบุผลตัดสินและเหตุผล");
          proposals.unshift({
            id: `DEMO-P${audit.length + 1}`,
            type: "resolution",
            disputeId: d.id,
            outcome: input.outcome,
            notes: input.notes,
            approvals: [],
            expiry: now() + 604800000,
            executed: false,
          });
          break;
        }
        case "proposeGovernanceChange":
          if (!input.notes?.trim()) fail("กรุณาระบุเหตุผล");
          if (input.action === "RevokeAnimalVerification") pet(input.id);
          else if (
            input.action !== "ReplaceCommitteeSeat" ||
            !/^0x[0-9a-fA-F]{40}$/.test(input.address) ||
            /^0x0{40}$/.test(input.address) ||
            committee.some(
              (a) => a.toLowerCase() === input.address.toLowerCase(),
            ) ||
            ![0, 1, 2].includes(Number(input.seat))
          )
            fail("ที่นั่งหรือ Wallet กรรมการใหม่ไม่ถูกต้อง");
          proposals.unshift({
            ...input,
            id: `DEMO-P${audit.length + 1}`,
            petId: input.id,
            type: "governance",
            approvals: [],
            expiry: now() + 604800000,
            executed: false,
          });
          break;
        case "approveResolution":
        case "approveGovernanceChange": {
          const q = proposal(input.id);
          if ((action === "approveResolution") !== (q.type === "resolution"))
            fail("ชนิดข้อเสนอไม่ถูกต้อง");
          if (q.executed) fail("ข้อเสนอดำเนินการแล้ว");
          if (now() > q.expiry) fail("ข้อเสนอหมดอายุ");
          if (q.approvals.includes(session().account)) fail("บัญชีนี้โหวตแล้ว");
          q.approvals.push(session().account);
          if (q.approvals.length === 2) {
            q.executed = true;
            if (q.type === "resolution") {
              const d = disputes.find((d) => d.id === q.disputeId);
              const target = pet(d.petId);
              d.status =
                q.outcome === "MarkUnresolved" ? "Unresolved" : "Resolved";
              d.frozen = false;
              target.ownership =
                q.outcome === "RejectClaim"
                  ? d.previousOwnership
                  : q.outcome === "ChangeHolder"
                    ? "Verified"
                    : "Disputed";
              if (q.outcome === "ChangeHolder") {
                target.holder = d.claimant;
                target.cardVersion++;
                target.transfer = "Cancelled";
              }
            } else if (q.action === "ReplaceCommitteeSeat")
              committee[Number(q.seat)] = q.address;
            else {
              const target = pet(q.petId);
              target.identity = "Unverified";
              target.registration = "Suspended";
              target.transfer = "Cancelled";
            }
          }
          break;
        }
        case "grantVet":
        case "grantReviewer":
        case "revokeRolePublic":
          if (
            !/^0x[0-9a-fA-F]{40}$/.test(input.address) ||
            /^0x0{40}$/.test(input.address)
          )
            fail("Wallet ไม่ถูกต้อง");
          roles[input.address] ||= [];
          if (action === "revokeRolePublic") {
            if (!["VET_ROLE", "REVIEWER_ROLE"].includes(input.role))
              fail("จัดการได้เฉพาะ Vet/Reviewer");
            roles[input.address] = roles[input.address].filter(
              (r) => r !== input.role,
            );
          } else
            roles[input.address] = [
              ...new Set([
                ...roles[input.address],
                action === "grantVet" ? "VET_ROLE" : "REVIEWER_ROLE",
              ]),
            ];
          break;
        default:
          fail("ไม่รองรับการดำเนินการ");
      }
      log(action, input.id || input.address);
      onStatus({ status: "Confirmed", demo: true });
    },
  };
}
