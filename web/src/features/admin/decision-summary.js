// Display only approved context fields; evidence contents and chip values stay out.
export function decisionSummary(action, input, data) {
  const dispute = data.disputes.find((row) => String(row.id) === String(input.id));
  const proposal = data.proposals.find((row) => String(row.id) === String(input.id));
  const disputeAction = ["reviewDispute", "proposeResolution"].includes(action);
  const approval = ["approveResolution", "approveGovernanceChange"].includes(action);
  const proposalDispute = data.disputes.find((row) => String(row.id) === String(proposal?.disputeId));
  const petId = disputeAction ? dispute?.petId : approval ? proposal?.petId ?? proposalDispute?.petId : input.id;
  const pet = data.pets.find((row) => String(row.id) === String(petId));
  const rows = [];
  if (pet) rows.push(["ทะเบียนเป้าหมาย", `${pet.name} · PC-${String(pet.id).padStart(4, "0")}`]);
  if (disputeAction) rows.push(["คำร้อง", `ข้อพิพาท #${input.id}`]);
  if (approval) rows.push(["ข้อเสนอ", String(input.id)]);
  if (input.address) rows.push(["Wallet เป้าหมาย", input.address]);
  if (input.role) rows.push(["สิทธิ์", input.role === "VET_ROLE" ? "สัตวแพทย์" : input.role === "REVIEWER_ROLE" ? "ผู้ตรวจหลักฐาน" : input.role]);
  if (input.action === "ReplaceCommitteeSeat" || proposal?.action === "ReplaceCommitteeSeat") rows.push(["ที่นั่งกรรมการ", String(Number(input.seat ?? proposal?.seat) + 1)]);
  const effects = {
    verifyAnimal: "เปลี่ยนสถานะตัวสัตว์เป็นรับรองแล้ว การรับรองเจ้าของยังเป็นอีกขั้นตอน",
    verifyOwnership: "เปลี่ยนสถานะเจ้าของเป็นรับรองแล้ว ยังไม่ออกบัตรจนกว่าจะสั่งออกบัตร",
    issueCard: `ออกบัตรดิจิทัลรุ่น ${pet ? Number(pet.cardVersion || 0) + 1 : "ถัดไป"} ตามทะเบียนนี้`,
    reportFound: "เปลี่ยนสถานะสัตว์หายเป็นปกติ",
    suspendRegistration: input.suspended ? "ระงับทะเบียน ทำให้การโอนถูกจำกัดตามเงื่อนไขของสัญญา" : "ปลดระงับทะเบียน ข้อจำกัดอื่นยังต้องตรวจตามสถานะจริง",
    reviewDispute: input.accept ? "รับพิจารณาคำร้องและระงับการโอนระหว่างพิจารณา" : "ไม่รับคำร้องนี้เข้าสู่การพิจารณา",
    proposeResolution: "สร้างข้อเสนอผลตัดสิน ต้องได้รับอนุมัติจากกรรมการต่าง Wallet อย่างน้อย 2 ใน 3",
    proposeGovernanceChange: "สร้างข้อเสนอเปลี่ยนแปลงสำคัญ ยังไม่ดำเนินการจนกว่าจะครบมติ 2 ใน 3",
    approveResolution: "เพิ่มเสียงอนุมัติของบัญชีนี้ เมื่อครบเกณฑ์สัญญาจะดำเนินการตามข้อเสนอ",
    approveGovernanceChange: "เพิ่มเสียงอนุมัติของบัญชีนี้ เมื่อครบเกณฑ์สัญญาจะดำเนินการตามข้อเสนอ",
    grantVet: "มอบสิทธิ์สัตวแพทย์ให้ Wallet เป้าหมาย",
    grantReviewer: "มอบสิทธิ์ผู้ตรวจหลักฐานให้ Wallet เป้าหมาย",
    revokeRolePublic: "ถอนสิทธิ์ที่ระบุออกจาก Wallet เป้าหมาย",
  };
  const outcomeLabels = { RejectClaim: "ยกคำร้อง", ChangeHolder: "เปลี่ยนผู้ถือทะเบียน", MarkUnresolved: "หลักฐานไม่เพียงพอ", ReplaceCommitteeSeat: "เปลี่ยนกรรมการ", RevokeAnimalVerification: "เพิกถอนการรับรองชิป" };
  const operation = input.outcome || input.action || proposal?.outcome || proposal?.action;
  if (operation) rows.push(["ผลตัดสิน / การเปลี่ยนแปลง", outcomeLabels[operation] || operation]);
  if (proposal?.address) rows.push(["Wallet ตามข้อเสนอ", proposal.address]);
  rows.push(["ผลของการยืนยัน", effects[action] || "ดำเนินการตามรายละเอียดที่แสดง ตรวจสอบข้อมูลใน Wallet อีกครั้ง"]);
  return rows;
}
