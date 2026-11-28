export async function confirmTransaction(
  tx,
  hasExpectedEvent,
  onStatus = () => {},
) {
  onStatus({ status: "Submitted", hash: tx.hash });
  onStatus({ status: "Confirming", hash: tx.hash });
  let receipt;
  try {
    receipt = await tx.wait(2);
  } catch (error) {
    if (error.code !== "TRANSACTION_REPLACED") throw error;
    if (error.cancelled) throw new Error("ธุรกรรมถูกยกเลิก");
    onStatus({ status: "Replaced", hash: error.replacement.hash });
    if (
      (tx.data && error.replacement.data !== tx.data) ||
      (tx.to && error.replacement.to?.toLowerCase() !== tx.to.toLowerCase())
    )
      throw new Error("ธุรกรรมใหม่เปลี่ยนรายละเอียด กรุณาตรวจสอบใน Wallet");
    receipt = await error.replacement.wait(2);
  }
  if (!receipt || Number(receipt.status) !== 1)
    throw new Error("ธุรกรรมล้มเหลว กรุณาตรวจสอบและลองใหม่");
  if (!hasExpectedEvent(receipt))
    throw new Error("ไม่พบ event ที่คาดหวังจาก Contract กรุณาตรวจสอบธุรกรรม");
  onStatus({ status: "Confirmed", hash: receipt.hash });
  return receipt;
}
