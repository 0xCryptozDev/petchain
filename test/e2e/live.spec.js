import { test, expect } from "@playwright/test";
import { id } from "../../web/node_modules/ethers/lib.esm/index.js";
test("expected wallet switch completes login; a later account change cancels signing", async ({
  page,
}) => {
  await page.goto("/");
  const result = await page.evaluate(
    async (committeeSelector) => {
      const { createLiveService } = await import("/live.js");
      const account = `0x${"1".repeat(40)}`;
      let service;
      let chain = "0x1";
      let changeDuringSign = false;
      let changeBeforeSign = false;
      let signCount = 0;
      window.ethereum = {
        async request({ method, params }) {
          if (method === "eth_chainId") return chain;
          if (method === "eth_accounts") return [account];
          if (method === "eth_requestAccounts") {
            service.invalidate();
            return [account];
          }
          if (method === "wallet_switchEthereumChain") {
            chain = "0xaa36a7";
            service.invalidate();
            return null;
          }
          if (method === "eth_getCode") return "0x6000";
          if (method === "personal_sign") {
            signCount++;
            if (changeDuringSign) service.invalidate();
            return `0x${"1".repeat(130)}`;
          }
          if (method === "eth_call")
            return params[0].data.startsWith(committeeSelector)
              ? `0x${"0".repeat(24)}${"1".repeat(40)}${"0".repeat(24)}${"2".repeat(40)}${"0".repeat(24)}${"3".repeat(40)}`
              : `0x${"0".repeat(63)}1`;
          throw new Error(`Unexpected RPC: ${method}`);
        },
      };
      window.fetch = async (url) => {
        if (changeBeforeSign && String(url).endsWith("/auth/nonce"))
          chain = "0x1";
        return new Response(
          JSON.stringify(
            String(url).endsWith("/auth/nonce")
              ? {
                  nonce: "abcd1234",
                  message: `${location.host} wants you to sign in with your Ethereum account:\n${account}\n\nSign in to PetChain\n\nURI: ${location.origin}\nVersion: 1\nChain ID: 11155111\nNonce: abcd1234\nIssued At: ${new Date().toISOString()}\nExpiration Time: ${new Date(Date.now() + 300000).toISOString()}`,
                }
              : { csrfToken: "test-token" },
          ),
          { headers: { "Content-Type": "application/json" } },
        );
      };
      service = createLiveService({
        apiUrl: "",
        address: `0x${"4".repeat(40)}`,
      });
      const connected = await service.connect();
      changeDuringSign = true;
      let lateChangeRejected = false;
      try {
        await service.connect();
      } catch {
        lateChangeRejected = true;
      }
      changeDuringSign = false;
      changeBeforeSign = true;
      const before = signCount;
      try {
        await service.connect();
      } catch {
        /* wrong chain must not request a signature */
      }
      return {
        account: connected.account.toLowerCase(),
        lateChangeRejected,
        signedOnWrongChain: signCount !== before,
      };
    },
    id("getCommittee()").slice(0, 10),
  );
  expect(result.account).toBe(`0x${"1".repeat(40)}`);
  expect(result.lateChangeRejected).toBe(true);
  expect(result.signedOnWrongChain).toBe(false);
});
