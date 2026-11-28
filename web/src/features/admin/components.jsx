import { Tooltip, TextArea } from "./controls";
import { useEffect, useState } from "react";
export const labels = {
  Unverified: "ยังไม่ตรวจ",
  Verified: "รับรองแล้ว",
  Uncertain: "ยังไม่มีชิป",
  Pending: "รอพิจารณา",
  Active: "ใช้งานได้",
  Suspended: "ระงับ",
  Revoked: "เพิกถอน",
  Deceased: "เสียชีวิต",
  Disputed: "มีข้อพิพาท",
  Rejected: "ไม่ผ่าน",
  Normal: "ปกติ",
  Missing: "สัตว์หาย",
  Submitted: "รอคัดกรอง",
  UnderReview: "กำลังพิจารณา",
  Resolved: "ตัดสินแล้ว",
  Unresolved: "ยังหาข้อยุติไม่ได้",
  RejectClaim: "ยกคำร้อง",
  ChangeHolder: "เปลี่ยนผู้ถือทะเบียน",
  MarkUnresolved: "หลักฐานไม่เพียงพอ",
  ReplaceCommitteeSeat: "เปลี่ยนกรรมการ",
  RevokeAnimalVerification: "เพิกถอนการรับรองชิป",
  VET_ROLE: "สัตวแพทย์",
  REVIEWER_ROLE: "ผู้ตรวจหลักฐาน",
  ADMIN_ROLE: "ผู้ดูแลสิทธิ์",
  COMMITTEE: "กรรมการ",
};
export const actionLabels = {
  verifyAnimal: "รับรองตัวสัตว์",
  verifyOwnership: "รับรองหลักฐานเจ้าของ",
  issueCard: "ออกบัตรดิจิทัล",
  suspendRegistration: "เปลี่ยนสถานะระงับทะเบียน",
  reportFound: "ยืนยันพบสัตว์",
  reviewDispute: "คัดกรองข้อพิพาท",
  proposeResolution: "เสนอผลตัดสิน",
  approveResolution: "อนุมัติผลตัดสิน",
  proposeGovernanceChange: "เสนอการเปลี่ยนแปลงสำคัญ",
  approveGovernanceChange: "อนุมัติการเปลี่ยนแปลงสำคัญ",
  grantVet: "มอบสิทธิ์สัตวแพทย์",
  grantReviewer: "มอบสิทธิ์ผู้ตรวจหลักฐาน",
  revokeRolePublic: "ถอนสิทธิ์ผู้รับรอง",
};
export const shortAddress = (address) =>
  address ? `${address.slice(0, 6)}…${address.slice(-4)}` : "ยังไม่เชื่อมต่อ";
export function Badge({ value }) {
  const tone = ["Verified", "Active", "Resolved"].includes(value)
    ? "text-[#356a47]"
    : ["Pending", "Submitted", "Unverified"].includes(value)
      ? "text-[#876322]"
      : [
            "Suspended",
            "Revoked",
            "Disputed",
            "Unresolved",
            "Missing",
            "Uncertain",
            "Rejected",
            "Deceased",
          ].includes(value)
        ? "text-[#9a4e37]"
        : "text-[#65736a]";
  return (
    <span
      className={
        "inline-flex items-center gap-1.5 text-[13px] leading-5 " + tone
      }
    >
      <span
        aria-hidden="true"
        className="h-1.5 w-1.5 shrink-0 rounded-full bg-current"
      />
      {labels[value] || value}
    </span>
  );
}
export function Icon({ name }) {
  const paths = {
    chip: "M8 8h8v8H8zM9 3v5m6-5v5M9 16v5m6-5v5M3 9h5m-5 6h5m8-6h5m-5 6h5",
    search: "m21 21-5-5M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0",
    chevron: "m9 5 7 7-7 7",
    shield: "M12 3 3 7v6c0 5 9 9 9 9s9-4 9-9V7l-9-4zm-4 9 3 3 5-6",
    file: "M14 2H5v20h14V7l-5-5zm0 0v5h5M8 12h8m-8 4h6",
    refresh: "M20 7v5h-5M4 17v-5h5m-5 0a8 8 0 0 1 14-5m2 5a8 8 0 0 1-14 5",
    check: "m5 12 4 4L19 6",
    paw: "M9 15c-3 0-5 3-3 5 2 2 4-1 6-1s4 3 6 1c2-2 0-5-3-5M7 7c-2-3-5 0-3 3s5 0 3-3m5-3c-2-3-5 0-3 3s5 0 3-3m5 0c-2-3-5 0-3 3s5 0 3-3m5 3c-2-3-5 0-3 3s5 0 3-3",
    queue: "M4 5h16v15H4zM8 2v6m8-6v6M8 12h8m-8 4h5",
    review: "M5 3h14v18H5zM8 8h8m-8 4h4m-4 4 2 2 5-5",
    dispute: "M12 3 2 21h20L12 3zm0 6v5m0 3v1",
    vote: "M5 13H3v8h18v-8h-3M8 3h8v13H8zM10 8l2 2 3-3",
    roles:
      "M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zm-7 10v-3c0-6 14-6 14 0v3m3-12v8m-4-4h8",
    history: "M3 5v5h5M3 10a9 9 0 1 1 0 6m9-10v6l4 2",
  };
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d={paths[name] || paths.queue} />
    </svg>
  );
}
export function Evidence({ items = [], service, workspace = false }) {
  const [preview, setPreview] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  useEffect(
    () => () => {
      if (preview?.url) URL.revokeObjectURL(preview.url);
    },
    [preview],
  );
  async function open(item) {
    setLoading(true);
    setError("");
    try {
      const result = await service.evidence(item);
      setPreview(
        typeof result === "string"
          ? {
              text: result,
            }
          : {
              url: URL.createObjectURL(result),
              type: result.type,
            },
      );
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }
  return (
    <section className="pc-evidence">
      <h3>หลักฐานประกอบ</h3>
      <p className="mb-4 text-[13px] text-muted">เปิดอ่านและตรวจเทียบก่อนบันทึกผล</p>
      {items.length ? (
        items.map((e) => (
          <button
            className="flex w-full items-center gap-3 rounded-xl border border-line bg-[#faf6ef] p-4 text-left text-sm transition-colors hover:bg-accent-soft"
            aria-label={`${e.name || "เปิดเอกสารหลักฐาน"} เปิดอ่าน`}
            type="button"
            key={e.id}
            disabled={loading}
            onClick={() => open(e)}
          >
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-[#f3e5d5] text-action [&_svg]:h-5 [&_svg]:w-5">
              <Icon name="file" />
            </span>
            <span className="min-w-0 flex-1 break-words font-medium [&_small]:mt-1">
              {e.name || "เปิดเอกสารหลักฐาน"}
              <small>หลักฐานสำหรับการพิจารณา</small>
            </span>
            <span className="ml-auto flex shrink-0 items-center gap-1 text-xs font-medium text-action [&_svg]:h-3.5 [&_svg]:w-3.5">
              เปิดอ่าน
              <Icon name="chevron" />
            </span>
          </button>
        ))
      ) : (
        <p className="mt-3 text-sm text-muted">ยังไม่มีหลักฐานให้ตรวจ</p>
      )}
      {workspace && !preview && items.length > 0 && (
        <div className="pc-evidence-placeholder">
          <Icon name="file" />
          <p className="font-medium text-ink">เลือกหลักฐานเพื่อเปิดอ่าน</p>
          <p>เปิดเอกสารเพื่อตรวจเทียบข้อมูลทะเบียน</p>
        </div>
      )}
      {error && (
        <p
          role="alert"
          className="my-4 break-words rounded-xl border border-[#ebc7c0] bg-[#fbedE8] px-5 py-4 text-sm text-[#932e28]"
        >
          {error}
        </p>
      )}
      {preview && (
        <div className="pc-evidence-preview mt-4 text-sm [&_img]:h-auto [&_img]:w-full [&_object]:min-h-[350px] [&_object]:w-full">
          <button
            type="button"
            className="inline-flex min-h-10 items-center gap-2 bg-transparent py-2 text-sm font-medium text-action underline underline-offset-4"
            onClick={() => setPreview(null)}
          >
            ปิดหลักฐาน
          </button>
          {preview.text ? (
            <p>{preview.text}</p>
          ) : preview.type.startsWith("image/") ? (
            <img src={preview.url} alt="หลักฐานสำหรับพิจารณา" />
          ) : (
            <object
              data={preview.url}
              type="application/pdf"
              aria-label="เอกสารหลักฐาน"
            >
              <a href={preview.url} download="evidence.pdf">
                ดาวน์โหลด PDF
              </a>
            </object>
          )}
        </div>
      )}
    </section>
  );
}
export function Notes({
  value,
  onChange,
  label = "บันทึกการพิจารณา",
  required = true,
}) {
  return (
    <label className="my-5 block text-sm font-medium">
      {label}
      <TextArea
        required={required}
        maxLength={2000}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="บันทึกข้อเท็จจริงและเหตุผลประกอบ"
        rows={3}
        className="mt-2 block w-full resize-y rounded-xl border border-control bg-[#fffdfa] px-4 py-3 text-sm"
      />
      <small className="mt-2">บันทึกภายในสำหรับทีมผู้พิจารณา</small>
    </label>
  );
}
export function Empty({ title = "ไม่มีรายการในคิว", children }) {
  return (
    <div className="px-6 py-14 text-center text-muted [&>svg]:mx-auto [&>svg]:h-9 [&>svg]:w-9 [&>svg]:text-action [&_h3]:mb-2 [&_h3]:mt-4 [&_h3]:text-ink [&_p]:mx-auto [&_p]:max-w-[50ch] [&_p]:text-sm">
      <Icon name="review" />
      <h3>{title}</h3>
      <p>{children || "เมื่อมีคำขอใหม่ รายการจะแสดงที่นี่"}</p>
    </div>
  );
}
export function PetSummary({ pet }) {
  const [expanded, setExpanded] = useState(false);
  return (
    <header className="pc-registry-header">
      <div className="pc-registry-identity">
        <span className="pc-registry-mark" aria-hidden="true">{pet.name.slice(0, 1)}</span>
        <div className="min-w-0">
          <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
            <h2 id="pc-record" tabIndex={-1} className="scroll-mt-5 !text-[27px] !font-semibold">{pet.name}</h2>
            <span className="text-sm tabular-nums text-action">PC-{pet.id.padStart(4, "0")}</span>
          </div>
          <p className="mt-1 text-sm text-muted">{pet.species}</p>
        </div>
        <button type="button" className="pc-reference-toggle" aria-expanded={expanded} onClick={() => setExpanded(!expanded)}>
          {expanded ? "ปิดข้อมูลทะเบียน" : "ข้อมูลทะเบียน"}<Icon name="chevron" />
        </button>
      </div>
      <dl className="pc-registry-states">
        <div><dt>ตัวสัตว์</dt><dd><Badge value={pet.identity} /></dd></div>
        <div><dt>เจ้าของ</dt><dd><Badge value={pet.ownership} /></dd></div>
        <div><dt>ทะเบียน</dt><dd><Badge value={pet.registration} /></dd></div>
      </dl>
      {expanded && <dl className="pc-registry-reference">
        <div><dt>สถานะสัตว์หาย</dt><dd><Badge value={pet.lost} /></dd></div>
        <div><dt>ผู้ถือทะเบียน</dt><dd className="break-all">{pet.holder}</dd></div>
        <div><dt>บัตรดิจิทัล</dt><dd>{pet.cardVersion ? "บัตรรุ่น " + pet.cardVersion : "ยังไม่ออกบัตร"}</dd></div>
      </dl>}
      {pet.lost === "Missing" && !expanded && <p className="mt-3 text-sm text-[#9a4e37]">ทะเบียนนี้มีสถานะสัตว์หาย</p>}
    </header>
  );
}
