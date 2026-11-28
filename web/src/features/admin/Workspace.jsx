import { DraftContext } from "./Drafts";
import petsBanner from "./assets/pets-banner.webp";
import { decisionSummary } from "./decision-summary";
import { Tooltip } from "./controls";
import { useEffect, useRef, useState } from "react";
import { createDemoService } from "./demo";
import { createLiveService } from "./live";
import { etherscanTxUrl } from "../shared/wallet";
import { VetPanel } from "../vet/VetPanel";
import { ReviewPanel } from "./ReviewPanel";
import { CommitteePanel, DisputePanel, RolesPanel } from "./GovernancePanels";
import { Empty, Icon, shortAddress, actionLabels } from "./components";
import { Navigation, WorkspaceHeader, DemoNotice } from "./WorkspaceChrome";
const sections = [
  ["vet", "คิวตรวจสัตว์", "queue", "ตรวจตัวสัตว์และชิปก่อนรับรองทะเบียน"],
  [
    "review",
    "ตรวจหลักฐานเจ้าของ",
    "review",
    "พิจารณาหลักฐาน ออกบัตร และดูแลสถานะทะเบียน",
  ],
  [
    "disputes",
    "ข้อพิพาท",
    "dispute",
    "คัดกรองคำร้องและทบทวนหลักฐานอย่างเป็นขั้นตอน",
  ],
  [
    "committee",
    "มติกรรมการ",
    "vote",
    "ผลตัดสินสำคัญต้องได้รับการอนุมัติจากสอง Wallet",
  ],
  [
    "roles",
    "จัดการสิทธิ์",
    "roles",
    "มอบและถอนสิทธิ์บุคลากรที่ผ่านการตรวจตัวตน",
  ],
  [
    "history",
    "ประวัติการรับรอง",
    "history",
    "ทะเบียนที่ผ่านการตรวจตัวสัตว์และชิป",
  ],
  [
    "audit",
    "บันทึกการดำเนินการ",
    "history",
    "ติดตามผู้ดำเนินการและหลักฐานธุรกรรม",
  ],
];
const emptyData = {
  pets: [],
  disputes: [],
  proposals: [],
  audit: [],
  committee: [],
};
export function Workspace() {
  const [service] = useState(() =>
    new URLSearchParams(location.search).get("demo") === "1"
      ? createDemoService()
      : createLiveService(),
  );
  const [section, setSection] = useState("vet");
  const [session, setSession] = useState(
    service.demo ? service.session() : null,
  );
  const [data, setData] = useState(emptyData);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [busy, setBusy] = useState(false);
  const [confirmation, setConfirmation] = useState(null);
  const [transaction, setTransaction] = useState(null);
  const [demoRole, setDemoRole] = useState("vet");
  const [draftStore, setDraftStore] = useState({});
  const [targetPet, setTargetPet] = useState(null);
  const draftScope = `${session?.account?.toLowerCase() || "disconnected"}:${session?.chainId || "sepolia"}`;
  const [generation, setGeneration] = useState(0);
  const epoch = useRef(0);
  const lock = useRef(false);
  const confirmationRef = useRef(null);
  const lastFocused = useRef(null);
  async function refresh() {
    const stamp = epoch.current;
    setLoading(true);
    setError("");
    try {
      const next = await service.load();
      if (stamp === epoch.current) {
        setData(next);
        setSession(service.session());
      }
    } catch (e) {
      if (stamp === epoch.current) {
        setData(emptyData);
        setError(e.message);
      }
    } finally {
      if (stamp === epoch.current) setLoading(false);
    }
  }
  useEffect(() => {
    if (service.demo) refresh();
    const invalidate = () => {
      epoch.current++;
      service.invalidate?.();
      setDraftStore({});
      setSession(null);
      setData(emptyData);
      setConfirmation(null);
      setTransaction(null);
      setGeneration((n) => n + 1);
      setLoading(false);
      setError("Wallet หรือเครือข่ายเปลี่ยน กรุณาเชื่อมต่อใหม่");
    };
    if (!service.demo && window.ethereum?.on) {
      window.ethereum.on("accountsChanged", invalidate);
      window.ethereum.on("chainChanged", invalidate);
      return () => {
        window.ethereum.removeListener("accountsChanged", invalidate);
        window.ethereum.removeListener("chainChanged", invalidate);
      };
    }
  }, [service]);
  useEffect(() => {
    if (confirmation) confirmationRef.current?.focus();
  }, [confirmation]);
  async function connect() {
    if (lock.current) return;
    lock.current = true;
    setBusy(true);
    setError("");
    try {
      await service.connect();
      setSession(service.session());
      await refresh();
    } catch (e) {
      setError(
        e.code === 4001 || e.code === "ACTION_REJECTED"
          ? "คุณปฏิเสธการเชื่อมต่อ สามารถลองใหม่ได้"
          : e.message,
      );
    } finally {
      lock.current = false;
      setBusy(false);
    }
  }
  function submit(action, input, title) {
    lastFocused.current = document.activeElement;
    setConfirmation({
      action,
      input,
      title,
    });
    setError("");
  }
  async function execute() {
    if (lock.current || !confirmation) return;
    const pending = confirmation;
    const stamp = epoch.current;
    lock.current = true;
    setBusy(true);
    setConfirmation(null);
    setError("");
    setTransaction(null);
    try {
      await service.act(pending.action, pending.input, (tx) => {
        if (stamp === epoch.current) setTransaction(tx);
      });
      if (stamp === epoch.current) {
        await refresh();
        setDraftStore((previous) => {
          const next = { ...previous };
          const bucket = pending.action === "verifyAnimal" ? "vet" : ["verifyOwnership", "issueCard", "suspendRegistration"].includes(pending.action) ? "review" : null;
          if (bucket) {
            const key = draftScope + ":" + bucket;
            next[key] = { ...next[key] };
            delete next[key][pending.input.id];
          } else {
            const key = pending.action === "reviewDispute" || pending.action === "proposeResolution" ? "dispute:" + pending.input.id : pending.action === "proposeGovernanceChange" ? "committee" : ["grantVet", "grantReviewer", "revokeRolePublic"].includes(pending.action) ? "roles" : null;
            if (key) delete next[draftScope + ":" + key];
          }
          return next;
        });
        setGeneration((n) => n + 1);
      }
    } catch (e) {
      if (stamp === epoch.current) {
        const rejected = e.code === 4001 || e.code === "ACTION_REJECTED";
        setTransaction((previous) => ({
          ...previous,
          status: rejected ? "Rejected" : "Failed",
          demo: service.demo,
        }));
        setError(
          rejected
            ? "คุณปฏิเสธธุรกรรม ข้อมูลในแบบฟอร์มยังอยู่ สามารถลองใหม่ได้"
            : e.shortMessage || e.message || "ดำเนินการไม่ได้ กรุณาลองใหม่",
        );
      }
    } finally {
      lock.current = false;
      setBusy(false);
      lastFocused.current?.focus();
    }
  }
  async function changeDemoRole(role) {
    if (busy) return;
    epoch.current++;
    setDemoRole(role);
    service.setAccount(role);
    setSession(service.session());
    setConfirmation(null);
    setTransaction(null);
    setGeneration((n) => n + 1);
    await refresh();
  }
  const active = sections.find((s) => s[0] === section);
  const props = {
    data,
    service,
    session,
    busy,
    submit,
    targetPet,
    onOpenRegistry: (id) => { setTargetPet(id); setSection("review"); setConfirmation(null); },
  };
  const txLabels = {
    "Awaiting signature": "รอคุณลงนามใน Wallet",
    Submitted: "ส่งธุรกรรมแล้ว",
    Confirming: "กำลังรอ 2 confirmations",
    Confirmed: service.demo
      ? "ดำเนินการในโหมดสาธิตแล้ว"
      : "ยืนยันธุรกรรมแล้ว (2 confirmations)",
    Replaced: "ธุรกรรมถูกแทนที่ กำลังตรวจรายการใหม่",
    Failed: "ดำเนินการไม่สำเร็จ",
    Rejected: "คุณปฏิเสธธุรกรรม",
  };
  return (
    <DraftContext.Provider value={{ store: draftStore, setStore: setDraftStore, scope: draftScope }}>
    <div className="pc-app min-h-screen">
      <a
        className="fixed -top-32 left-5 z-50 bg-white p-4 focus:top-3"
        href="#pc-content"
      >
        ข้ามไปเนื้อหา
      </a>
      <Navigation
        account={<WorkspaceHeader session={session} busy={busy} connect={connect} />}
        sections={sections}
        section={section}
        data={data}
        demo={service.demo}
        onNavigate={(key) => {
          setSection(key);
          setTargetPet(null);
          setConfirmation(null);
        }}
      />
      <div className="pc-workspace-body">
        <main
          id="pc-content"
          className="pc-main"
        >
          <div className="pc-page-context">
          <div className="pc-page-title">
            <div className="pc-page-art" aria-hidden="true">
              <img src={petsBanner} width="2172" height="724" alt="" decoding="async" />
            </div>
            <div>
              <h1>{active[1]}</h1>
              <p className="mt-2 max-w-[65ch] text-sm text-muted">
                {active[3]}
              </p>
            </div>
            <button
              className="inline-flex min-h-10 shrink-0 items-center gap-2 rounded-lg border border-line bg-white px-3 py-2 text-xs font-medium text-muted hover:bg-white hover:text-ink [&_svg]:h-4 [&_svg]:w-4"
              disabled={loading || busy || !session}
              onClick={refresh}
            >
              <Icon name="refresh" />
              <span className="sr-only md:not-sr-only">
                {loading ? "กำลังโหลด…" : "อัปเดตข้อมูล"}
              </span>
            </button>
          </div>
          {service.demo ? (
            <DemoNotice role={demoRole} busy={busy} onChange={changeDemoRole} />
          ) : (
            <div className="pc-live-notice mb-6 flex flex-wrap justify-between gap-3 border-y border-line py-3 text-xs text-muted">
              <span>
                Ethereum Sepolia · ต้องเชื่อม API และ deployment ของทีม
              </span>
              <a className="underline" href="?demo=1">
                เปิดโหมดสาธิต
              </a>
            </div>
          )}
          </div>
          {error && (
            <div
              role="alert"
              className="mb-5 rounded-lg border border-[#e3c5bd] bg-[#fbefea] px-4 py-3 text-sm text-[#873c2d]"
            >
              {error}
            </div>
          )}
          {transaction && (
            <div
              role="status"
              className="mb-5 flex flex-wrap justify-between gap-3 rounded-lg border border-[#bfd1c3] bg-accent-soft px-4 py-3 text-sm"
            >
              <strong className="font-medium">
                {txLabels[transaction.status]}
              </strong>
              {transaction.hash && !transaction.demo && (
                <a
                  className="underline"
                  href={etherscanTxUrl(transaction.hash)}
                  target="_blank"
                  rel="noreferrer"
                >
                  ดูธุรกรรมบน Etherscan
                </a>
              )}
            </div>
          )}
          {confirmation && (
            <section
              className="pc-sign-review p-5 [&_p]:my-2 [&_p]:break-words"
              aria-label="ตรวจสอบก่อนลงนาม"
            >
              <h2 ref={confirmationRef} tabIndex={-1}>
                ตรวจสอบก่อนลงนาม
              </h2>
              <p className="font-medium">{confirmation.title}</p>
              <dl>{decisionSummary(confirmation.action, confirmation.input, data).map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl>
              <p>
                Wallet: <code>{session?.account}</code>
              </p>
              {confirmation.input.notes && (
                <p>เหตุผล: {confirmation.input.notes}</p>
              )}
              <p>
                {service.demo
                  ? "รายการนี้เปลี่ยนเฉพาะข้อมูลสาธิต"
                  : "ตรวจรายละเอียดใน Wallet อีกครั้ง การยืนยันบน Chain อาจย้อนคืนไม่ได้"}
              </p>
              <div className="mt-4 flex flex-wrap gap-3">
                <button
                  className="min-h-11 rounded-md bg-action px-4 py-2.5 text-sm font-medium text-white hover:bg-action-deep"
                  disabled={busy}
                  onClick={execute}
                >
                  ยืนยันและลงนาม
                </button>
                <button
                  className="min-h-11 rounded-md border border-line bg-white px-4 py-2.5 text-sm font-medium hover:bg-canvas"
                  onClick={() => {
                    setConfirmation(null);
                    lastFocused.current?.focus();
                  }}
                >
                  กลับไปแก้ไข
                </button>
              </div>
            </section>
          )}
          {loading ? (
            <div
              role="status"
              className="grid min-h-[420px] grid-cols-1 gap-7 rounded-xl border border-line bg-white p-7 motion-safe:animate-pulse md:grid-cols-[240px_1fr]"
            >
              <span className="sr-only">กำลังตรวจข้อมูลล่าสุด…</span>
              <div className="space-y-5">
                <div className="h-8 w-28 rounded bg-[#eadfd2]" />
                <div className="h-20 rounded bg-[#f4eadf]" />
                <div className="h-20 rounded bg-[#f0f3ed]" />
              </div>
              <div className="space-y-7">
                <div className="h-8 w-36 rounded bg-[#e9ede7]" />
                <div className="h-24 rounded bg-[#f0f3ed]" />
                <div className="h-40 rounded bg-[#f0f3ed]" />
              </div>
            </div>
          ) : !session ? (
            <Empty title="เชื่อม Wallet เพื่อเริ่มตรวจงาน">
              ใช้บัญชีที่ได้รับสิทธิ์จากทีม หรือเปิดโหมดสาธิตเพื่อทดลองหน้าจอ
            </Empty>
          ) : (
            <div key={section + "-" + generation}>
              {section === "vet" || section === "history" ? (
                <VetPanel {...props} history={section === "history"} />
              ) : section === "review" ? (
                <ReviewPanel {...props} />
              ) : section === "disputes" ? (
                <DisputePanel {...props} />
              ) : section === "committee" ? (
                <CommitteePanel {...props} />
              ) : section === "roles" ? (
                <RolesPanel {...props} />
              ) : (
                <Audit data={data} />
              )}
            </div>
          )}
          <footer className="mt-7 flex flex-wrap justify-between gap-2 pb-5 text-xs text-muted">
            <span>
              PetChain · บัตรรับรองของระบบ ไม่ใช่เอกสารกรรมสิทธิ์ตามกฎหมาย
            </span>
          </footer>
        </main>
      </div>
    </div>
    </DraftContext.Provider>
  );
}
function Audit({ data }) {
  return (
    <section className="pc-audit-surface min-w-0 overflow-hidden rounded-xl border border-line bg-white [&>h2]:mx-6 [&>h2]:mb-2 [&>h2]:mt-6 [&>p]:mx-6 [&>p]:mb-4">
      {data.audit.length ? (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-sm [&_th]:whitespace-nowrap [&_th]:border-b [&_th]:border-line [&_th]:bg-canvas [&_th]:px-5 [&_th]:py-4 [&_th]:text-xs [&_th]:font-medium [&_th]:text-muted [&_td]:border-b [&_td]:border-line [&_td]:px-5 [&_td]:py-4 [&_small]:mt-1">
            <thead>
              <tr>
                <th>การดำเนินการ</th>
                <th>รายการ</th>
                <th>ผู้ดำเนินการ</th>
                <th>เวลา / หลักฐาน</th>
              </tr>
            </thead>
            <tbody>
              {data.audit.map((row) => (
                <tr key={row.id}>
                  <td>{actionLabels[row.action] || row.action}</td>
                  <td>{row.subject}</td>
                  <Tooltip content={row.actor}>
                    <td>{shortAddress(row.actor)}</td>
                  </Tooltip>
                  <td>
                    {new Date(row.at).toLocaleString("th-TH")}
                    {row.demo ? (
                      <small>ข้อมูลสาธิต</small>
                    ) : /^0x[0-9a-fA-F]{64}$/.test(row.txHash || "") ? (
                      <a
                        href={etherscanTxUrl(row.txHash)}
                        target="_blank"
                        rel="noreferrer"
                      >
                        Etherscan
                      </a>
                    ) : (
                      <small>ยังไม่มีธุรกรรมยืนยัน</small>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <Empty title="ยังไม่มีบันทึกการดำเนินการ" />
      )}
    </section>
  );
}
