import { useDraftState } from "../admin/Drafts";
import { Form, Checkbox } from "../admin/controls";
import { useState } from "react";
import { CaseWorkspace, Readiness } from "../admin/CaseWorkspace";
import { Evidence, Notes, PetSummary } from "../admin/components";
export function VetPanel({
  data,
  service,
  session,
  busy,
  submit,
  history = false,
}) {
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useDraftState("vet:selected", null);
  const [drafts, setDrafts] = useDraftState("vet", {});
  const pets = data.pets.filter(
    (p) =>
      (history ? p.identity === "Verified" : p.identity !== "Verified") &&
      `${p.name} ${p.id} PC-${p.id.padStart(4, "0")} ${p.species}`
        .toLowerCase()
        .includes(search.toLowerCase()),
  );
  const current = pets.find((p) => p.id === selected) || pets[0];
  return (
    <>
      <CaseWorkspace
          pets={pets}
          selectedId={current?.id}
          onSelect={setSelected}
          search={search}
          onSearch={setSearch}
          history={history}
        >
        {current && (
          <Inspection
            key={current.id}
            draft={drafts[current.id] || {}}
            onDraft={(patch) => setDrafts((previous) => ({ ...previous, [current.id]: { ...previous[current.id], ...patch } }))}
            pet={current}
            {...{
              service,
              session,
              busy,
              submit,
              history,
            }}
          />
        )}
      </CaseWorkspace>
    </>
  );
}
function Inspection({ pet, service, session, busy, submit, history, draft, onDraft }) {
  const { notes = "", inspected = false, chipRead = false } = draft;
  const setNotes = (notes) => onDraft({ notes });
  const allowed = session?.roles.includes("VET_ROLE");
  return (
    <section
      className="pc-case-sheet"
      aria-label="แบบตรวจสัตว์"
    >
      <div className="pc-case-masthead">
        <PetSummary pet={pet} />
      </div>
      <div className="pc-inspection-body">
        <div className="pc-evidence-area">
          <Evidence items={pet.evidence} service={service} workspace />
          <div className="pc-inspection-guide">
            <h3>ข้อมูลสำหรับตรวจเทียบ</h3>
            <p>{pet.name} · {pet.species}</p>
            <p className="mt-2 text-muted">{pet.chip ? "มีข้อมูลชิปในทะเบียน ตรวจค่าจากหลักฐานที่ได้รับอนุญาตเทียบกับการอ่านจากตัวสัตว์ ระบบไม่แสดงเลขชิปดิบในหน้านี้" : "ยังไม่มีชิป ต้องตรวจชิปก่อนรับรองตัวสัตว์และออกบัตรเต็มรูปแบบ"}</p>
          </div>
        </div>
        <div className="pc-decision-area">
        {history && <div className="py-2"><h3 className="!mt-0">รับรองตัวสัตว์แล้ว</h3><p className="text-sm text-muted">เปิดตรวจหลักฐานย้อนหลังได้จากพื้นที่ด้านข้าง การรับรองเจ้าของและการออกบัตรอยู่ในงานผู้ตรวจหลักฐาน</p></div>}
        {!history && (
          <Form
            onSubmit={(e) => {
              e.preventDefault();
              submit(
                "verifyAnimal",
                {
                  id: pet.id,
                  notes,
                  inspected,
                  chipRead,
                },
                `รับรองตัวสัตว์ ${pet.name}`,
              );
            }}
          >
            <h3>ผลการตรวจตัวสัตว์</h3>
            {!pet.chip && (
              <p className="mt-4 rounded-lg bg-[#fbf0e2] px-4 py-3 text-sm text-[#80502f]">
                ยังไม่มีชิป คงทะเบียนชั่วคราวไว้จนกว่าจะตรวจชิปได้
              </p>
            )}
            <label className="my-3 flex min-h-12 items-start gap-3 rounded-xl border border-line bg-[#fffdfa] px-3 py-3 text-[13px] has-[:checked]:border-action has-[:checked]:bg-accent-soft">
              <Checkbox
                checked={inspected}
                onChange={(e) => onDraft({ inspected: e.target.checked })}
              />
              ตรวจตัวสัตว์และลักษณะตรงกับหลักฐานแล้ว
            </label>
            <label className="my-3 flex min-h-12 items-start gap-3 rounded-xl border border-line bg-[#fffdfa] px-3 py-3 text-[13px] has-[:checked]:border-action has-[:checked]:bg-accent-soft">
              <Checkbox
                checked={chipRead}
                onChange={(e) => onDraft({ chipRead: e.target.checked })}
              />
              อ่านชิปจากตัวสัตว์และตรวจข้อมูลตรงกันแล้ว
            </label>
            <Notes value={notes} onChange={setNotes} />
            <Readiness items={[
              { label: "มีชิปสำหรับตรวจเทียบ", done: Boolean(pet.chip) },
              { label: "ตรวจตัวสัตว์และอ่านชิปแล้ว", done: inspected && chipRead },
              { label: "บันทึกเหตุผลแล้ว", done: Boolean(notes.trim()) },
            ]} />
            <button
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-medium transition-colors border-transparent bg-action text-white hover:bg-action-deep"
              disabled={
                busy || !allowed || !pet.chip || !inspected || !chipRead
              }
            >
              รับรองตัวสัตว์
            </button>
            {!allowed && (
              <p className="mt-3 text-sm text-muted">
                ต้องใช้ Wallet ที่ได้รับสิทธิ์สัตวแพทย์
              </p>
            )}
          </Form>
        )}
        {pet.lost === "Missing" && (
          <button
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-medium transition-colors border-line bg-white text-ink hover:bg-accent-soft"
            disabled={busy || !allowed}
            onClick={() =>
              submit(
                "reportFound",
                {
                  id: pet.id,
                },
                `ยืนยันพบสัตว์ ${pet.name}`,
              )
            }
          >
            ยืนยันพบสัตว์แล้ว
          </button>
        )}
        </div>
      </div>
    </section>
  );
}
