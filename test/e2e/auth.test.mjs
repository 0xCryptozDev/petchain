import test from "node:test";
import assert from "node:assert/strict";
import { validateChallenge } from "../../web/src/features/admin/auth-message.js";
const context = {
  host: "localhost:5174",
  origin: "http://localhost:5174",
  account: "wallet",
  now: Date.parse("2026-11-28T08:00:00Z"),
};
const message =
  "localhost:5174 wants you to sign in with your Ethereum account:\nwallet\n\nSign in\n\nURI: http://localhost:5174\nVersion: 1\nChain ID: 11155111\nNonce: abcd1234\nIssued At: 2026-11-28T08:00:00Z\nExpiration Time: 2026-11-28T08:05:00Z";
test("login challenge binds exact origin, chain, nonce and validity window", () => {
  assert.equal(
    validateChallenge({ nonce: "abcd1234", message }, context),
    message,
  );
  for (const changed of [
    message.replace(
      "URI: http://localhost:5174",
      "URI: http://localhost:5174.evil.test",
    ),
    message.replace("Chain ID: 11155111", "Chain ID: 111551110"),
    message.replace("Nonce: abcd1234", "Nonce: abcd5678"),
    message.replace("08:05:00", "07:59:00"),
    `${message}\nChain ID: 1`,
  ])
    assert.throws(() =>
      validateChallenge({ nonce: "abcd1234", message: changed }, context),
    );
});
