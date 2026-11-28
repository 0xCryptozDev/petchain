import { useDraftState } from "./Drafts";
import { Tooltip, Form, Select, SearchInput } from "./controls";
import { useState } from "react";
import {
  Badge,
  Evidence,
  Empty,
  Notes,
  labels,
  shortAddress,
} from "./components";
export function DisputePanel({ data, service, session, busy, submit }) {
  const [selected, setSelected] = useState("");
  const d = data.disputes.find((d) => d.id === selected) || data.disputes[0];
  return (
    <div className="pc-governance-layout">
      <section className="pc-management-surface min-w-0 overflow-hidden rounded-xl border border-line bg-white [&>h2]:mx-6 [&>h2]:mb-2 [&>h2]:mt-6 [&>p]:mx-6 [&>p]:mb-4">
        <h2>คำร้องทั้งหมด</h2>
        {data.disputes.length ? (
          data.disputes.map((item) => (
            <button
              type="button"
              className={`flex w-full items-center justify-between gap-4 border-b border-line px-6 py-5 text-left hover:bg-accent-soft [&_strong]:text-sm ${item.id === d?.id ? "!bg-accent-soft" : ""}`}
              key={item.id}
              onClick={() => setSelected(item.id)}
            >
              <span>
                <strong>ข้อพิพาท #{item.id}</strong>
                <small>ทะเบียน #{item.petId}</small>
              </span>
              <Badge value={item.status} />
            </button>
          ))
        ) : (
          <Empty title="ไม่มีข้อพิพาท" />
        )}
      </section>
      {d && (
        <Dispute
          key={d.id}
          dispute={d}
          {...{
            service,
            session,
            busy,
            submit,
          }}
        />
      )}
    </div>
  );
}
function Dispute({ dispute: d, service, session, busy, submit }) {
  const [draft, setDraft] = useDraftState("dispute:" + d.id, {});
  const { outcome = "MarkUnresolved", notes = "" } = draft;
  const setOutcome = (outcome) => setDraft((old) => ({ ...old, outcome }));
  const setNotes = (notes) => setDraft((old) => ({ ...old, notes }));
  const reviewer = session?.roles.includes("REVIEWER_ROLE");
  const committee = session?.roles.includes("COMMITTEE");
  return (
    <section className="min-w-0 overflow-hidden rounded-xl border border-line bg-white p-5 md:p-7">
      <h2>ข้อพิพาท #{d.id}</h2>
      <p>
        ทะเบียน #{d.petId} · ผู้ร้อง{" "}
        <Tooltip content={d.claimant}>
          <span>{shortAddress(d.claimant)}</span>
        </Tooltip>
      </p>
      <Badge value={d.status} />
      <p className="mt-4 rounded-lg bg-[#fbf0e2] px-4 py-3 text-sm text-[#80502f]">
        {d.status === "UnderReview" || d.status === "Unresolved"
          ? "ห้ามโอนทะเบียนระหว่างที่สถานะเจ้าของยังมีข้อพิพาท"
          : "การยื่นคำร้องยังไม่ระงับโอน ต้องผ่านการคัดกรองก่อน"}
      </p>
      {typeof d.evidence === "string" ? (
        <p>{d.evidence}</p>
      ) : (
        <Evidence items={d.evidence} service={service} />
      )}
      <Notes value={notes} onChange={setNotes} />
      {d.status === "Submitted" && !reviewer && <p className="mt-4 text-sm text-muted">ดูคำร้องได้ แต่การรับเรื่องหรือไม่รับคำร้องต้องใช้ Wallet ผู้ตรวจหลักฐานเจ้าของ</p>}
      {d.status === "UnderReview" && !committee && <p className="mt-4 text-sm text-muted">ดูหลักฐานได้ แต่การเสนอผลตัดสินต้องใช้ Wallet กรรมการ</p>}
      {d.status === "Submitted" && (
        <div className="mt-4 flex flex-wrap gap-3">
          <button
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md border px-4 py-2.5 text-sm font-medium transition-colors border-transparent bg-action text-white hover:bg-action-deep"
            disabled={busy || !reviewer || !notes.trim()}
            onClick={() =>
              submit(
                "reviewDispute",
                {
                  id: d.id,
                  accept: true,
                  notes,
                },
                `รับพิจารณาข้อพิพาท #${d.id}`,
              )
            }
          >
            รับเรื่องและระงับโอน
          </button>
          <button
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md border px-4 py-2.5 text-sm font-medium transition-colors border-line bg-white text-ink hover:bg-accent-soft"
            disabled={busy || !reviewer || !notes.trim()}
            onClick={() =>
              submit(
                "reviewDispute",
                {
                  id: d.id,
                  accept: false,
                  notes,
                },
                `ไม่รับคำร้อง #${d.id}`,
              )
            }
          >
            ไม่รับคำร้อง
          </button>
        </div>
      )}
      {d.status === "UnderReview" && (
        <Form
          onSubmit={(e) => {
            e.preventDefault();
            submit(
              "proposeResolution",
              {
                id: d.id,
                outcome,
                notes,
              },
              `เสนอผลตัดสิน: ${labels[outcome]}`,
            );
          }}
        >
          <label className="my-5 block text-sm font-medium">
            ผลตัดสินที่เสนอ
            <Select
              value={outcome}
              onChange={(e) => setOutcome(e.target.value)}
              className="mt-2 block w-full rounded-md border border-control bg-white px-3 py-2.5 text-sm"
              aria-label="ผลตัดสินที่เสนอ"
            >
              {["MarkUnresolved", "RejectClaim", "ChangeHolder"].map((v) => (
                <option key={v} value={v}>
                  {labels[v]}
                </option>
              ))}
            </Select>
          </label>
          <p className="mt-3 text-sm text-muted">
            การเสนอไม่ใช่การอนุมัติ ต้องได้รับเสียงจากกรรมการต่าง Wallet 2 คน
            ภายใน 7 วัน
          </p>
          <button
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md border px-4 py-2.5 text-sm font-medium transition-colors border-transparent bg-action text-white hover:bg-action-deep"
            disabled={busy || !committee || !notes.trim()}
          >
            เสนอให้กรรมการลงมติ
          </button>
        </Form>
      )}
    </section>
  );
}
export function CommitteePanel({ data, session, busy, submit, onOpenRegistry }) {
  const [draft, setDraft] = useDraftState("committee", {});
  const { action = "RevokeAnimalVerification", petId = "", address = "", seat = "0", notes = "" } = draft;
  const change = (key) => (value) => setDraft((old) => ({ ...old, [key]: value }));
  const setAction = change("action"), setPetId = change("petId"), setAddress = change("address"), setSeat = change("seat"), setNotes = change("notes");
  const allowed = session?.roles.includes("COMMITTEE");
  return (
    <>
      <div className="pc-committee-overview">
        <h2>คณะกรรมการ 3 บัญชี</h2>
        <div className="mt-4 grid grid-cols-1 divide-y divide-line md:grid-cols-3 md:divide-x md:divide-y-0">
          {data.committee.map((address, i) => (
            <div className="py-3 md:px-5 md:py-1 md:first:pl-0" key={i}>
              <span className="block text-xs text-muted">ที่นั่ง {i + 1}</span>
              <Tooltip content={address}>
                <code className="mt-2 block text-sm">
                  {shortAddress(address)}
                </code>
              </Tooltip>
            </div>
          ))}
        </div>
      </div>
      <div className="grid grid-cols-1 items-start gap-6 wide:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]">
        <section className="min-w-0 overflow-hidden rounded-xl border border-line bg-white [&>h2]:mx-6 [&>h2]:mb-2 [&>h2]:mt-6 [&>p]:mx-6 [&>p]:mb-4">
          <h2>ข้อเสนอรอลงมติ</h2>
          <p className="mt-3 text-sm text-muted">
            อนุมัติ 2 ใน 3 · นับเฉพาะ Wallet ที่แตกต่างกัน
          </p>
          {data.proposals.length ? (
            data.proposals.map((q) => {
              const voters = Array.isArray(q.approvals) ? q.approvals : [];
              const count =
                q.approvalCount ??
                (Array.isArray(q.approvals) ? voters.length : q.approvals);
              const voted =
                q.voted ||
                voters.some(
                  (a) => a.toLowerCase() === session?.account.toLowerCase(),
                );
              const targetId = q.petId ?? data.disputes.find((d) => d.id === q.disputeId)?.petId;
              const target = data.pets.find((pet) => pet.id === targetId);
              const expired = Date.now() > q.expiry;
              return (
                <article
                  key={q.id}
                  className="border-b border-line px-6 pb-6 pt-1 [&>p]:mt-2 [&>p]:break-words [&>p]:text-sm [&_ul]:my-4 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:text-xs"
                >
                  <h3>{labels[q.outcome || q.action]}</h3>
                  <p>
                    {q.type === "resolution"
                      ? `ข้อพิพาท #${q.disputeId}`
                      : q.action === "ReplaceCommitteeSeat"
                        ? `ที่นั่ง ${Number(q.seat) + 1} → ${shortAddress(q.address)}`
                        : `ทะเบียน #${q.petId}`}
                  </p>
                  {target && <div className="my-3 text-sm"><strong>{registryName(target)}</strong><p className="mt-1 text-muted">{labels[target.identity]} · {labels[target.registration]}</p><button type="button" className="mt-2 text-action underline underline-offset-4" onClick={() => onOpenRegistry(target.id)}>เปิดทะเบียน {registryName(target)}</button></div>}
                  <p>{q.notes}</p>
                  <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-xs text-muted [&_strong]:text-base [&_strong]:tabular-nums [&_strong]:text-action">
                    <strong>{count} / 2 เสียง</strong>
                    <span>
                      {q.executed
                        ? "ดำเนินการแล้ว"
                        : expired
                          ? "หมดอายุ"
                          : `สิ้นสุด ${new Date(q.expiry).toLocaleString("th-TH")}`}
                    </span>
                  </div>
                  <div
                    role="progressbar"
                    aria-label="เสียงอนุมัติ"
                    aria-valuemin={0}
                    aria-valuemax={2}
                    aria-valuenow={count}
                    className="mt-3 h-1.5 overflow-hidden rounded-full bg-line"
                  >
                    <div
                      className="h-full rounded-full bg-action"
                      style={{
                        width: `${(Math.min(Number(count), 2) / 2) * 100}%`,
                      }}
                    />
                  </div>
                  <ul>
                    {voters.map((a) => (
                      <li key={a}>
                        <code>{shortAddress(a)}</code> อนุมัติแล้ว
                      </li>
                    ))}
                  </ul>
                  <button
                    className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md border px-4 py-2.5 text-sm font-medium transition-colors border-transparent bg-action text-white hover:bg-action-deep"
                    disabled={
                      busy || !allowed || q.executed || voted || expired
                    }
                    onClick={() =>
                      submit(
                        q.type === "resolution"
                          ? "approveResolution"
                          : "approveGovernanceChange",
                        {
                          id: q.id,
                          fingerprint: q.fingerprint,
                        },
                        `อนุมัติ${labels[q.outcome || q.action]} · ${q.type === "resolution" ? "ข้อพิพาท #" + q.disputeId : q.action === "ReplaceCommitteeSeat" ? "ที่นั่ง " + (Number(q.seat) + 1) + " ให้ " + q.address : "ทะเบียน #" + q.petId}`,
                      )
                    }
                  >
                    {voted
                      ? "คุณโหวตแล้ว"
                      : q.executed
                        ? "ครบมติแล้ว"
                        : "อนุมัติข้อเสนอ"}
                  </button>
                </article>
              );
            })
          ) : (
            <Empty title="ยังไม่มีข้อเสนอ" />
          )}
        </section>
        <section className="min-w-0 overflow-hidden rounded-xl border border-line bg-white p-5 md:p-7">
          <h2>เสนอการเปลี่ยนแปลงสำคัญ</h2>
          {!allowed && <p className="mt-3 text-sm text-muted">ดูข้อมูลได้ แต่การสร้างข้อเสนอและลงมติต้องใช้ Wallet กรรมการ</p>}
          <p className="mt-3 text-sm text-muted">
            ผู้ดูแลคนเดียวเปลี่ยนกรรมการหรือเพิกถอนชิปไม่ได้
          </p>
          <Form
            onSubmit={(e) => {
              e.preventDefault();
              submit(
                "proposeGovernanceChange",
                {
                  action,
                  id: petId,
                  address,
                  seat: Number(seat),
                  notes,
                },
                `เสนอ${labels[action]}`,
              );
            }}
          >
            <label className="my-5 block text-sm font-medium">
              ประเภทข้อเสนอ
              <Select
                value={action}
                onChange={(e) => setAction(e.target.value)}
                className="mt-2 block w-full rounded-md border border-control bg-white px-3 py-2.5 text-sm"
                aria-label="ประเภทข้อเสนอ"
              >
                <option value="RevokeAnimalVerification">
                  เพิกถอนการรับรองชิป
                </option>
                <option value="ReplaceCommitteeSeat">เปลี่ยนกรรมการ</option>
              </Select>
            </label>
            {action === "RevokeAnimalVerification" ? (
              <RegistryPicker pets={data.pets} value={petId} onChange={setPetId} onOpen={onOpenRegistry} />
            ) : (
              <>
                <label className="my-5 block text-sm font-medium">
                  ที่นั่ง
                  <Select
                    value={seat}
                    onChange={(e) => setSeat(e.target.value)}
                    className="mt-2 block w-full rounded-md border border-control bg-white px-3 py-2.5 text-sm"
                    aria-label="ที่นั่ง"
                  >
                    {[0, 1, 2].map((v) => (
                      <option key={v} value={v}>
                        ที่นั่ง {v + 1}
                      </option>
                    ))}
                  </Select>
                </label>
                <label className="my-5 block text-sm font-medium">
                  Wallet กรรมการใหม่
                  <input
                    required
                    pattern="0x[a-fA-F0-9]{40}"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="0x…"
                    className="mt-2 block w-full rounded-md border border-control bg-white px-3 py-2.5 text-sm"
                  />
                </label>
              </>
            )}
            <Notes value={notes} onChange={setNotes} />
            <button
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md border px-4 py-2.5 text-sm font-medium transition-colors border-transparent bg-action text-white hover:bg-action-deep"
              disabled={busy || !allowed || (action === "RevokeAnimalVerification" && !data.pets.some((pet) => pet.id === petId))}
            >
              สร้างข้อเสนอ
            </button>
          </Form>
        </section>
      </div>
    </>
  );
}
export function RolesPanel({ session, busy, submit }) {
  const [draft, setDraft] = useDraftState("roles", {});
  const { address = "", role = "VET_ROLE", operation = "grant" } = draft;
  const change = (key) => (value) => setDraft((old) => ({ ...old, [key]: value }));
  const setAddress = change("address"), setRole = change("role"), setOperation = change("operation");
  return (
    <section className="pc-role-management">
      <div className="pc-role-intro">
        <h2>สิทธิ์ผู้รับรอง</h2>
        <p className="mt-3 text-sm text-muted">ตรวจตัวตนบุคลากรนอกระบบก่อนมอบสิทธิ์ให้ Wallet ทุกครั้ง</p>
        <dl className="mt-7 space-y-5 text-sm">
          <div><dt className="text-xs text-muted">บทบาทที่เลือก</dt><dd className="mt-1 font-medium">{labels[role]}</dd></div>
          <div><dt className="text-xs text-muted">การดำเนินการ</dt><dd className="mt-1 font-medium">{operation === "revoke" ? "ถอนสิทธิ์" : "มอบสิทธิ์"}</dd></div>
        </dl>
      </div>
      <Form
        onSubmit={(e) => {
          e.preventDefault();
          submit(
            operation === "revoke"
              ? "revokeRolePublic"
              : role === "VET_ROLE"
                ? "grantVet"
                : "grantReviewer",
            {
              address,
              role,
            },
            `${operation === "revoke" ? "ถอน" : "มอบ"}สิทธิ์${labels[role]}ให้ ${shortAddress(address)}`,
          );
        }}
      >
        <label className="my-5 block text-sm font-medium">
          Wallet บุคลากร
          <input
            required
            pattern="0x[a-fA-F0-9]{40}"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="0x…"
            className="mt-2 block w-full rounded-md border border-control bg-white px-3 py-2.5 text-sm"
          />
        </label>
        <label className="my-5 block text-sm font-medium">
          บทบาท
          <Select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="mt-2 block w-full rounded-md border border-control bg-white px-3 py-2.5 text-sm"
            aria-label="บทบาท"
          >
            <option value="VET_ROLE">สัตวแพทย์</option>
            <option value="REVIEWER_ROLE">ผู้ตรวจหลักฐานเจ้าของ</option>
          </Select>
        </label>
        <label className="my-5 block text-sm font-medium">
          การดำเนินการ
          <Select
            value={operation}
            onChange={(e) => setOperation(e.target.value)}
            className="mt-2 block w-full rounded-md border border-control bg-white px-3 py-2.5 text-sm"
            aria-label="การดำเนินการ"
          >
            <option value="grant">มอบสิทธิ์</option>
            <option value="revoke">ถอนสิทธิ์</option>
          </Select>
        </label>
        {!session?.roles.includes("ADMIN_ROLE") && <p className="mb-4 text-sm text-muted">ดูข้อมูลได้ แต่การมอบหรือถอนสิทธิ์ต้องใช้ Wallet ผู้ดูแลสิทธิ์</p>}
        <button
          className={
            operation === "revoke"
              ? "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border px-4 py-2.5 text-sm font-medium transition-colors border-[#e7c5bf] bg-[#fff5f2] text-[#963d32] hover:bg-[#f8e7e2]"
              : "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border px-4 py-2.5 text-sm font-medium transition-colors border-transparent bg-action text-white hover:bg-action-deep"
          }
          disabled={busy || !session?.roles.includes("ADMIN_ROLE")}
        >
          ตรวจสอบการเปลี่ยนสิทธิ์
        </button>
      </Form>
      <p className="mt-3 text-sm text-muted">
        การเปลี่ยนคณะกรรมการต้องเสนอและลงมติในหน้ากรรมการ
      </p>
    </section>
  );
}

function registryName(pet) { return pet.name + " · PC-" + String(pet.id).padStart(4, "0"); }
function RegistryPicker({ pets, value, onChange, onOpen }) {
  const [search, setSearch] = useState("");
  const chosen = pets.find((pet) => pet.id === value);
  const matches = pets.filter((pet) => (registryName(pet) + " " + pet.id).toLowerCase().includes(search.trim().toLowerCase()));
  return <fieldset className="my-5 min-w-0"><legend className="mb-2 text-sm font-medium">ทะเบียนเป้าหมาย</legend>
    <SearchInput label="ค้นหาทะเบียนเป้าหมาย" placeholder="ชื่อสัตว์หรือ PC-0002" value={search} onChange={(e) => setSearch(e.target.value)} />
    <div className="pc-registry-options" role="group" aria-label="ผลค้นหาทะเบียน">
      {matches.map((pet) => <button type="button" key={pet.id} aria-pressed={pet.id === value} onClick={() => onChange(pet.id)}><span className="font-medium">{registryName(pet)}</span><span className="text-xs text-muted">{labels[pet.identity]} · {labels[pet.registration]}</span><span className="text-xs">{pet.id === value ? "เลือกแล้ว" : "เลือกทะเบียน"}</span></button>)}
      {!matches.length && <p className="p-4 text-sm text-muted">ไม่พบทะเบียน ลองค้นหาด้วยชื่อหรือรหัส PC อื่น</p>}
    </div>
    {chosen ? <div className="mt-3 text-sm"><p>เป้าหมาย: <strong>{registryName(chosen)}</strong></p><button type="button" className="mt-2 text-action underline underline-offset-4" onClick={() => onOpen(chosen.id)}>เปิดทะเบียน {registryName(chosen)}</button></div> : <p className="mt-3 text-sm text-muted">เลือกทะเบียนก่อนสร้างข้อเสนอ</p>}
  </fieldset>;
}
