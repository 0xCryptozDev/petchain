import { useDraftState } from "./Drafts";
import { Form, Checkbox } from "./controls";
import { useEffect, useState } from "react";
import { CaseWorkspace, Readiness } from "./CaseWorkspace";
import { Evidence, Notes, PetSummary } from "./components";
export function ReviewPanel({ data, service, session, busy, submit, targetPet }) {
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useDraftState("review:selected", null);
  useEffect(() => { if (targetPet) setSelected(targetPet); }, [targetPet]);
  const [drafts, setDrafts] = useDraftState("review", {});
  const pets = data.pets.filter((p) =>
    `${p.name} ${p.id} PC-${p.id.padStart(4, "0")}`.toLowerCase().includes(search.toLowerCase()),
  );
  const pet = pets.find((p) => p.id === selected) || pets[0];
  return (
    <>
      <CaseWorkspace
          pets={pets}
          selectedId={pet?.id}
          onSelect={(id) => { setSelected(id); }}
          search={search}
          onSearch={setSearch}
          review
          openTarget={targetPet}
        >
        {pet && (
          <Review
            key={pet.id}
            draft={drafts[pet.id] || {}}
            onDraft={(patch) => setDrafts((previous) => ({ ...previous, [pet.id]: { ...previous[pet.id], ...patch } }))}
            {...{
              pet,
              service,
              session,
              busy,
              submit,
            }}
          />
        )}
      </CaseWorkspace>
    </>
  );
}
function Review({ pet, service, session, busy, submit, draft, onDraft }) {
  const { reviewed = false, notes = "" } = draft;
  const setNotes = (notes) => onDraft({ notes });
  const allowed = session?.roles.includes("REVIEWER_ROLE");
  const blocked = ["Suspended", "Revoked", "Deceased"].includes(
    pet.registration,
  );
  const canIssue =
    pet.identity === "Verified" && pet.ownership === "Verified" && !blocked;
  return (
    <section
      className="pc-case-sheet"
      aria-label="พิจารณาหลักฐานเจ้าของ"
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
        <Form
          onSubmit={(e) => {
            e.preventDefault();
            submit(
              "verifyOwnership",
              {
                id: pet.id,
                reviewed,
                notes,
              },
              `รับรองหลักฐานเจ้าของ ${pet.name}`,
            );
          }}
        >
          <h3>ตรวจหลักฐานเจ้าของ</h3>
          <label className="my-3 flex min-h-12 items-start gap-3 rounded-xl border border-line bg-[#fffdfa] px-3 py-3 text-[13px] has-[:checked]:border-action has-[:checked]:bg-accent-soft">
            <Checkbox
              checked={reviewed}
              onChange={(e) => onDraft({ reviewed: e.target.checked })}
            />
            ตรวจความครบถ้วนและความสัมพันธ์ของหลักฐานแล้ว
          </label>
          <Notes value={notes} onChange={setNotes} />
          <button
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-medium transition-colors border-transparent bg-action text-white hover:bg-action-deep"
            disabled={
              busy ||
              !allowed ||
              !reviewed ||
              pet.ownership === "Disputed" ||
              pet.ownership === "Verified"
            }
          >
            รับรองหลักฐานเจ้าของ
          </button>
        </Form>
        <Readiness title="ก่อนออกบัตร" items={[
          { label: "ตัวสัตว์รับรองแล้ว", done: pet.identity === "Verified" },
          { label: "เจ้าของรับรองแล้ว", done: pet.ownership === "Verified" },
          { label: "ไม่มีเหตุระงับทะเบียน", done: !blocked },
        ]} />
        <div className="mt-4 flex flex-wrap gap-3">
          <button
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-medium transition-colors border-line bg-white text-ink hover:bg-accent-soft"
            disabled={busy || !allowed || !canIssue}
            onClick={() =>
              submit(
                "issueCard",
                {
                  id: pet.id,
                },
                `ออกบัตร ${pet.name} รุ่น ${pet.cardVersion + 1}`,
              )
            }
          >
            ออกบัตรดิจิทัล{pet.cardVersion ? "รุ่นใหม่" : ""}
          </button>
          <button
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-medium transition-colors border-[#e7c5bf] bg-[#fff5f2] text-[#963d32] hover:bg-[#f8e7e2]"
            disabled={
              busy ||
              !allowed ||
              !notes.trim() ||
              ["Revoked", "Deceased"].includes(pet.registration) ||
              (pet.registration === "Suspended" &&
                (pet.identity !== "Verified" || pet.ownership !== "Verified"))
            }
            onClick={() =>
              submit(
                "suspendRegistration",
                {
                  id: pet.id,
                  suspended: pet.registration !== "Suspended",
                  notes,
                },
                `${pet.registration === "Suspended" ? "ปลดระงับ" : "ระงับ"}ทะเบียน ${pet.name}`,
              )
            }
          >
            {pet.registration === "Suspended"
              ? "ปลดระงับทะเบียน"
              : "ระงับทะเบียน"}
          </button>
        </div>
        {!canIssue && (
          <p className="mt-3 text-sm text-muted">
            ออกบัตรได้เมื่อรับรองตัวสัตว์และเจ้าของครบ และไม่มีเหตุระงับ
          </p>
        )}
        {!allowed && (
          <p className="mt-4 rounded-lg bg-[#fbf0e2] px-4 py-3 text-sm text-[#80502f]">
            ต้องใช้ Wallet ผู้ตรวจหลักฐานเพื่อพิจารณา
          </p>
        )}
        </div>
      </div>
    </section>
  );
}
