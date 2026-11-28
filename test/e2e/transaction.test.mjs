import test from "node:test";
import assert from "node:assert/strict";
import { confirmTransaction } from "../../web/src/features/admin/transaction.js";
const receipt = { status: 1, hash: `0x${"1".repeat(64)}`, logs: [] };
test("never confirms before receipt, two confirmations and expected event", async () => {
  const states = [];
  await confirmTransaction(
    {
      hash: receipt.hash,
      async wait(n) {
        assert.equal(n, 2);
        assert.equal(states.at(-1).status, "Confirming");
        return receipt;
      },
    },
    () => true,
    (s) => states.push(s),
  );
  assert.equal(states.at(-1).status, "Confirmed");
});
test("reverted or unrelated receipts cannot be confirmed", async () => {
  await assert.rejects(
    confirmTransaction(
      { hash: receipt.hash, wait: async () => ({ ...receipt, status: 0 }) },
      () => true,
    ),
    /ล้มเหลว/,
  );
  await assert.rejects(
    confirmTransaction(
      { hash: receipt.hash, wait: async () => receipt },
      () => false,
    ),
    /event/,
  );
});
test("replacement uses replacement receipt; cancelled replacement fails", async () => {
  const states = [];
  await confirmTransaction(
    {
      hash: receipt.hash,
      wait: async () => {
        throw {
          code: "TRANSACTION_REPLACED",
          cancelled: false,
          replacement: { hash: receipt.hash, wait: async () => receipt },
        };
      },
    },
    () => true,
    (s) => states.push(s),
  );
  assert.ok(states.some((s) => s.status === "Replaced"));
  await assert.rejects(
    confirmTransaction(
      {
        wait: async () => {
          throw { code: "TRANSACTION_REPLACED", cancelled: true };
        },
      },
      () => true,
    ),
    /ยกเลิก/,
  );
});
test("replacement with different calldata must not confirm a different action", async () => {
  await assert.rejects(
    confirmTransaction(
      {
        to: "0x123",
        data: "0xaaaa",
        wait: async () => {
          throw {
            code: "TRANSACTION_REPLACED",
            cancelled: false,
            replacement: {
              to: "0x123",
              data: "0xbbbb",
              wait: async () => receipt,
            },
          };
        },
      },
      () => true,
    ),
    /เปลี่ยนรายละเอียด/,
  );
});
