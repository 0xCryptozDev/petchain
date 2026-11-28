import { BrowserProvider, id, isAddress, ZeroAddress } from "ethers";
import {
  switchToSepolia,
  getContract,
  SEPOLIA_CHAIN_ID,
} from "../shared/wallet";
import { ABI, ENUMS } from "./contract";
import { confirmTransaction } from "./transaction";
import { hydrateDispute, hydrateProposal } from "./chain-snapshot";
import { validateChallenge } from "./auth-message";

const actionRoles = {
  verifyAnimal: "VET_ROLE",
  reportFound: "VET_ROLE",
  verifyOwnership: "REVIEWER_ROLE",
  issueCard: "REVIEWER_ROLE",
  suspendRegistration: "REVIEWER_ROLE",
  reviewDispute: "REVIEWER_ROLE",
  grantVet: "ADMIN_ROLE",
  grantReviewer: "ADMIN_ROLE",
  revokeRolePublic: "ADMIN_ROLE",
};
const events = {
  verifyAnimal: "AnimalVerified",
  verifyOwnership: "OwnershipVerified",
  issueCard: "CardIssued",
  reportFound: "MissingReported",
  suspendRegistration: "RegistrationSuspended",
  reviewDispute: "DisputeReviewed",
  proposeResolution: "ResolutionProposed",
  proposeGovernanceChange: "GovernanceProposed",
  approveResolution: "GovernanceProposalApproved",
  approveGovernanceChange: "GovernanceProposalApproved",
  grantVet: "RoleChanged",
  grantReviewer: "RoleChanged",
  revokeRolePublic: "RoleChanged",
};
const requireId = (value) => {
  if (typeof value !== "string" || !/^[1-9]\d*$/.test(value))
    throw new Error("รหัสทะเบียนไม่ถูกต้อง");
  return value;
};
const requireDigest = (value) => {
  if (!/^0x[0-9a-fA-F]{64}$/.test(value) || /^0x0{64}$/.test(value))
    throw new Error("ข้อมูลรับรองจาก API ไม่ครบ กรุณาติดต่อผู้ดูแล");
  return value;
};
const requireAddress = (value) => {
  if (!isAddress(value) || value === ZeroAddress)
    throw new Error("Wallet ไม่ถูกต้อง");
  return value;
};

export function createLiveService({
  apiUrl = import.meta.env.VITE_API_URL || "",
  address = import.meta.env.VITE_CONTRACT_ADDRESS,
} = {}) {
  let current = null;
  let provider;
  let contract;
  let revision = 0;
  let csrfToken;
  async function request(path, body) {
    const response = await fetch(`${apiUrl.replace(/\/$/, "")}${path}`, {
      credentials: "include",
      signal: AbortSignal.timeout(20000),
      headers: body
        ? {
            "Content-Type": "application/json",
            ...(csrfToken ? { "X-CSRF-Token": csrfToken } : {}),
          }
        : {},
      ...(body ? { method: "POST", body: JSON.stringify(body) } : {}),
    });
    if (!response.ok)
      throw new Error(
        response.status === 401 || response.status === 403
          ? "Session หมดอายุหรือไม่มีสิทธิ์ กรุณาเชื่อม Wallet ใหม่"
          : `API ไม่พร้อมใช้งาน (${response.status}) กรุณาลองใหม่`,
      );
    return response.json();
  }
  async function refreshSession() {
    const chain = await window.ethereum.request({ method: "eth_chainId" });
    if (BigInt(chain) !== BigInt(SEPOLIA_CHAIN_ID))
      throw new Error(
        "กรุณาเปลี่ยนเครือข่ายเป็น Sepolia แล้วเชื่อม Wallet ใหม่",
      );
    const accounts = await window.ethereum.request({ method: "eth_accounts" });
    if (
      !current ||
      accounts[0]?.toLowerCase() !== current.account.toLowerCase()
    )
      throw new Error("Wallet เปลี่ยนแล้ว กรุณาเชื่อมต่อใหม่");
    const roleNames = ["VET_ROLE", "REVIEWER_ROLE", "ADMIN_ROLE"];
    const checks = await Promise.all(
      roleNames.map((role) => contract.hasRole(id(role), current.account)),
    );
    const committee = [...(await contract.getCommittee())];
    const roles = roleNames.filter((_, i) => checks[i]);
    if (
      committee.some((a) => a.toLowerCase() === current.account.toLowerCase())
    )
      roles.push("COMMITTEE");
    current = { ...current, roles };
    return { ...current, committee };
  }
  async function chainPet(p) {
    const state = await contract.getPet(requireId(p.id));
    return {
      ...p,
      holder: state.holder,
      cardVersion: Number(state.cardVersion),
      ...Object.fromEntries(
        Object.entries(ENUMS).map(([name, values]) => [
          name,
          values[Number(state[name])],
        ]),
      ),
    };
  }
  return {
    demo: false,
    session: () => current,
    invalidate() {
      revision++;
      current = null;
      csrfToken = undefined;
    },
    async connect() {
      revision++;
      if (!window.ethereum)
        throw new Error("ไม่พบ MetaMask กรุณาติดตั้งก่อนเชื่อมต่อ");
      if (!isAddress(address) || address === ZeroAddress)
        throw new Error(
          "ยังไม่ได้ตั้งค่า Contract Address จาก deployment จริง",
        );
      await window.ethereum.request({ method: "eth_requestAccounts" });
      await switchToSepolia();
      provider = new BrowserProvider(window.ethereum);
      if ((await provider.getCode(address)) === "0x")
        throw new Error("ไม่พบ Contract ในเครือข่ายนี้");
      const signer = await provider.getSigner();
      const account = await signer.getAddress();
      // Account approval/network switching emit expected wallet events. Pin the
      // identity after those steps; changes during SIWE must still invalidate it.
      const started = ++revision;
      contract = getContract(address, ABI, signer);
      const challenge = await request("/auth/nonce", {
        address: account,
        chainId: SEPOLIA_CHAIN_ID,
        domain: location.host,
      });
      // Backend must supply the exact SIWE message and independently verify all fields.
      validateChallenge(challenge, {
        host: location.host,
        origin: location.origin,
        account,
      });
      const signingChain = await window.ethereum.request({
        method: "eth_chainId",
      });
      const signingAccounts = await window.ethereum.request({
        method: "eth_accounts",
      });
      if (
        started !== revision ||
        BigInt(signingChain) !== BigInt(SEPOLIA_CHAIN_ID) ||
        signingAccounts[0]?.toLowerCase() !== account.toLowerCase()
      )
        throw new Error(
          "Wallet หรือเครือข่ายเปลี่ยนก่อนลงนาม กรุณาเชื่อมต่อใหม่",
        );
      const signature = await signer.signMessage(challenge.message);
      const auth = await request("/auth/verify", {
        message: challenge.message,
        signature,
      });
      if (started !== revision)
        throw new Error("Wallet เปลี่ยนระหว่างเชื่อมต่อ กรุณาลองใหม่");
      csrfToken = auth.csrfToken;
      current = { account, roles: [], chainId: SEPOLIA_CHAIN_ID };
      return refreshSession();
    },
    async load() {
      const started = revision;
      const s = await refreshSession();
      const list = async (path) => {
        const body = await request(path);
        if (!Array.isArray(body.items))
          throw new Error("รูปแบบข้อมูล API ไม่ตรงตามข้อตกลง");
        return body.items;
      };
      const vet = s.roles.includes("VET_ROLE")
        ? await list("/vet/requests")
        : [];
      const admin = s.roles.includes("REVIEWER_ROLE")
        ? await list("/admin/requests")
        : [];
      const privileged = s.roles.some((r) =>
        ["REVIEWER_ROLE", "COMMITTEE"].includes(r),
      );
      const disputes = privileged ? await list("/admin/disputes") : [];
      const proposalRecords = s.roles.includes("COMMITTEE")
        ? await list("/admin/proposals")
        : [];
      const audit = s.roles.length ? await list("/admin/audit") : [];
      const pets = await Promise.all(
        [...new Map([...vet, ...admin].map((p) => [p.id, p])).values()].map(
          chainPet,
        ),
      );
      if (started !== revision)
        throw new Error("Wallet เปลี่ยนแล้ว กรุณาเชื่อมใหม่");
      const proposals = await Promise.all(
        proposalRecords.map((q) =>
          hydrateProposal(contract, q, s.account, s.committee),
        ),
      );
      const chainDisputes = await Promise.all(
        disputes.map((d) => hydrateDispute(contract, d)),
      );
      if (started !== revision)
        throw new Error("Wallet เปลี่ยนแล้ว กรุณาเชื่อมใหม่");
      return {
        pets,
        disputes: chainDisputes,
        proposals,
        audit,
        committee: s.committee,
      };
    },
    async evidence(e) {
      if (typeof e.id !== "string" || !/^[a-zA-Z0-9_-]+$/.test(e.id))
        throw new Error("รหัสหลักฐานไม่ถูกต้อง");
      // Never use an arbitrary external URL received in a queue payload.
      const response = await fetch(
        `${apiUrl.replace(/\/$/, "")}/evidence/${e.id}`,
        { credentials: "include", signal: AbortSignal.timeout(20000) },
      );
      if (!response.ok)
        throw new Error(
          "เปิดหลักฐานไม่ได้ กรุณาตรวจสิทธิ์หรือเชื่อม Wallet ใหม่",
        );
      const blob = await response.blob();
      if (!["application/pdf", "image/png", "image/jpeg"].includes(blob.type))
        throw new Error("เปิดได้เฉพาะ PDF, PNG หรือ JPEG");
      return blob;
    },
    async act(action, input, onStatus = () => {}) {
      const started = revision;
      const s = await refreshSession();
      const expectedRole = actionRoles[action] || "COMMITTEE";
      if (!s.roles.includes(expectedRole))
        throw new Error("Wallet นี้ไม่มีสิทธิ์ดำเนินการ");
      if (!events[action]) throw new Error("ไม่รองรับการดำเนินการ");
      let args;
      // Prepare private notes off-chain. Digests and chip HMAC must come from the trusted API.
      if (action === "verifyAnimal" || action === "verifyOwnership") {
        if (action === "verifyAnimal" && (!input.inspected || !input.chipRead))
          throw new Error("กรุณายืนยันผลตรวจตัวสัตว์และชิป");
        if (action === "verifyOwnership" && !input.reviewed)
          throw new Error("กรุณาตรวจหลักฐานก่อนรับรอง");
        const prepared = await request(
          `/${action === "verifyAnimal" ? "vet" : "admin"}/requests/${requireId(input.id)}/review`,
          input,
        );
        args =
          action === "verifyAnimal"
            ? [
                input.id,
                requireDigest(prepared.chipToken),
                requireDigest(prepared.evidenceDigest),
              ]
            : [input.id, requireDigest(prepared.evidenceDigest)];
      } else if (
        action === "issueCard" ||
        action === "suspendRegistration" ||
        action === "reportFound"
      ) {
        const p = await chainPet({ id: requireId(input.id) });
        if (
          action === "issueCard" &&
          (p.identity !== "Verified" ||
            p.ownership !== "Verified" ||
            ["Suspended", "Revoked", "Deceased"].includes(p.registration))
        )
          throw new Error("ยังออกบัตรไม่ได้ กรุณาตรวจสถานะการรับรอง");
        if (action === "suspendRegistration") {
          if (!input.notes?.trim()) throw new Error("กรุณาระบุเหตุผล");
          if (
            !input.suspended &&
            (p.registration !== "Suspended" ||
              p.identity !== "Verified" ||
              p.ownership !== "Verified")
          )
            throw new Error("ยังปลดระงับไม่ได้ กรุณาตรวจสถานะการรับรอง");
          await request(`/admin/requests/${input.id}/review`, {
            ...input,
            action,
          });
          args = [
            input.id,
            input.suspended,
            input.suspended ? "Review suspension" : "Review resumed",
          ];
        } else args = [input.id];
      } else if (action === "reviewDispute") {
        if (!input.notes?.trim()) throw new Error("กรุณาระบุเหตุผลคัดกรอง");
        await request(`/admin/disputes/${requireId(input.id)}/review`, input);
        args = [input.id, input.accept];
      } else if (
        action === "proposeResolution" ||
        action === "proposeGovernanceChange"
      ) {
        if (!input.notes?.trim()) throw new Error("กรุณาระบุเหตุผล");
        const prepared = await request("/admin/proposals/prepare", {
          ...input,
          type: action,
        });
        const digest = requireDigest(prepared.reasonDigest);
        if (action === "proposeResolution") {
          const outcome = [
            "RejectClaim",
            "ChangeHolder",
            "MarkUnresolved",
          ].indexOf(input.outcome);
          if (outcome < 0) throw new Error("ผลตัดสินไม่ถูกต้อง");
          args = [requireId(input.id), outcome, digest];
        } else if (input.action === "RevokeAnimalVerification")
          args = [1, requireId(input.id), ZeroAddress, 0, digest];
        else if (
          input.action === "ReplaceCommitteeSeat" &&
          [0, 1, 2].includes(Number(input.seat))
        )
          args = [
            0,
            0,
            requireAddress(input.address),
            Number(input.seat),
            digest,
          ];
        else throw new Error("ข้อเสนอไม่ถูกต้อง");
      } else if (action.startsWith("approve")) {
        requireDigest(input.id);
        const resolution = action === "approveResolution";
        const fresh = await hydrateProposal(
          contract,
          { id: input.id, type: resolution ? "resolution" : "governance" },
          s.account,
          s.committee,
        );
        if (!input.fingerprint || fresh.fingerprint !== input.fingerprint)
          throw new Error(
            "รายละเอียดข้อเสนอเปลี่ยน กรุณาอัปเดตข้อมูลและตรวจอีกครั้ง",
          );
        if (
          resolution &&
          (await contract.getDispute(fresh.disputeId)).status !== 2n
        )
          throw new Error("ข้อพิพาทไม่ได้อยู่ระหว่างพิจารณาแล้ว");
        const p = await contract[
          resolution ? "resolutionProposals" : "govProposals"
        ](input.id);
        const block = await provider.getBlock("latest");
        if (!p.expiry || p.executed || BigInt(block.timestamp) > p.expiry)
          throw new Error("ข้อเสนอไม่มีอยู่ หมดอายุ หรือดำเนินการแล้ว");
        if (
          await contract[resolution ? "resolutionApproved" : "govApproved"](
            input.id,
            s.account,
          )
        )
          throw new Error("บัญชีนี้โหวตแล้ว");
        args = [input.id];
      } else {
        requireAddress(input.address);
        if (
          action === "revokeRolePublic" &&
          !["VET_ROLE", "REVIEWER_ROLE"].includes(input.role)
        )
          throw new Error("จัดการได้เฉพาะสิทธิ์ Vet และ Reviewer");
        args =
          action === "revokeRolePublic"
            ? [input.address, id(input.role)]
            : [input.address];
      }
      await refreshSession();
      if (started !== revision)
        throw new Error("Wallet เปลี่ยนแล้ว กรุณาลองใหม่");
      // Simulation and fresh chain checks precede every wallet transaction prompt.
      await contract[action].staticCall(...args);
      if (started !== revision)
        throw new Error("Wallet เปลี่ยนแล้ว กรุณาลองใหม่");
      onStatus({ status: "Awaiting signature" });
      const tx = await contract[action](...args);
      return confirmTransaction(
        tx,
        (receipt) =>
          receipt.logs.some((log) => {
            if (log.address.toLowerCase() !== address.toLowerCase())
              return false;
            try {
              return contract.interface.parseLog(log)?.name === events[action];
            } catch {
              return false;
            }
          }),
        onStatus,
      );
    },
  };
}
