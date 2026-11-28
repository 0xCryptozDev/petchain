import { SearchInput } from "./controls";
import { Badge, Empty, Icon } from "./components";
export function PetQueue({
  pets,
  selectedId,
  onSelect,
  search,
  onSearch,
  history = false,
  review = false,
}) {
  return (
    <section
      className="pc-pet-queue"
      aria-label={review ? "คิวผู้ตรวจหลักฐาน" : "คิวสัตวแพทย์"}
    >
      <div className="px-5 pb-4 pt-5">
        <div className="flex items-center justify-between">
          <h2 className="!text-sm">
            {review
              ? "ทะเบียนสัตว์เลี้ยง"
              : history
                ? "รายการที่รับรองแล้ว"
                : "รายการรอตรวจ"}
          </h2>
          <span className="text-xs tabular-nums text-muted">
            {pets.length} รายการ
          </span>
        </div>
        <SearchInput
          value={search}
          onChange={(e) => onSearch(e.target.value)}
          placeholder="ค้นหาชื่อ หรือเลขทะเบียน"
        />
      </div>
      <div className="border-t border-line">
        {pets.length ? (
          pets.map((p) => (
            <button
              type="button"
              key={p.id}
              aria-label={(review ? "พิจารณา" : "ตรวจ") + " " + p.name}
              aria-pressed={selectedId === p.id}
              onClick={() => onSelect(p.id)}
              className="pc-queue-item flex w-full items-start gap-3 text-left transition-colors"
            >
              <span className="pc-queue-initial" aria-hidden="true">{p.name.slice(0, 1)}</span>
              <span className="min-w-0 flex-1">
                <span className="flex flex-wrap items-baseline justify-between gap-x-2 gap-y-1">
                  <strong className="text-base font-medium">{p.name}</strong>
                  <span className="text-xs tabular-nums text-muted">
                    PC-{p.id.padStart(4, "0")}
                  </span>
                </span>
                <small className="mt-1.5">{p.species}</small>
                <span className="mt-3 block">
                  <Badge value={review ? p.registration : p.identity} />
                </span>
              </span>
              <span className="mt-1 text-muted [&_svg]:h-3.5 [&_svg]:w-3.5">
                <Icon name={selectedId === p.id ? "check" : "chevron"} />
              </span>
            </button>
          ))
        ) : (
          <Empty />
        )}
      </div>
      <p className="border-t border-line bg-[#fff7ed] px-5 py-4 text-xs leading-6 text-muted">
        {review
          ? "ตรวจหลักฐานก่อนออกบัตรทุกครั้ง"
          : "รับรองจากการตรวจตัวสัตว์และชิปจริง"}
      </p>
    </section>
  );
}
