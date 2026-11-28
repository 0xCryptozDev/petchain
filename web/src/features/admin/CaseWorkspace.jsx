import { PetQueue } from "./PetQueue";
import { useEffect, useRef, useState } from "react";
import { Icon } from "./components";

export function CaseWorkspace({ children, onSelect, openTarget, ...queue }) {
  const [detailOpen, setDetailOpen] = useState(Boolean(openTarget));
  const animation = useRef(null);
  const sheet = useRef(null);
  useEffect(() => () => animation.current?.cancel(), []);
  function select(id) {
    onSelect(id);
    setDetailOpen(true);
    requestAnimationFrame(() => {
      animation.current?.cancel();
      if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        animation.current = sheet.current?.animate?.(
          [{ clipPath: "inset(0 1.5% 0 0)", opacity: 0.82 }, { clipPath: "inset(0 0 0 0)", opacity: 1 }],
          { duration: 220, easing: "cubic-bezier(0.22, 1, 0.36, 1)" },
        );
      }
      if (window.matchMedia("(max-width: 1279px)").matches) {
        const heading = document.getElementById("pc-record");
        heading?.focus({ preventScroll: true });
        heading?.scrollIntoView({ block: "start", behavior: "instant" });
      }
    });
  }
  return (
    <div className="pc-case-workspace" data-detail={detailOpen}>
      <div className="pc-case-queue">
        <PetQueue {...queue} onSelect={select} />
      </div>
      <div ref={sheet} className="pc-case-detail min-w-0">
        <button type="button" className="pc-back-to-queue" onClick={() => {
          setDetailOpen(false);
          requestAnimationFrame(() => {
            const selected = document.querySelector('.pc-case-queue [aria-pressed="true"]');
            selected?.focus();
          });
        }}>
          <span className="rotate-180"><Icon name="chevron" /></span>กลับคิวตรวจ
        </button>
        {children}
      </div>
    </div>
  );
}

export function Readiness({ items, hint, title = "ก่อนรับรอง" }) {
  const complete = items.filter((item) => item.done).length;
  return (
    <div className="pc-readiness" data-ready={complete === items.length} aria-label="ความพร้อมก่อนรับรอง">
      <div className="flex items-center justify-between gap-3">
        <span className="font-medium">{title}</span>
        <span className="tabular-nums text-muted" aria-live="polite" aria-atomic="true">ครบ {complete} / {items.length}</span>
      </div>
      <ul className="mt-3 space-y-2">
        {items.map((item) => <li key={item.label} data-complete={item.done} className="flex items-start gap-2">
          <span className={item.done ? "text-[#356a47]" : "text-muted"}>
            <Icon name={item.done ? "check" : "dispute"} />
          </span>
          <span>{item.label}</span>
        </li>)}
      </ul>
      {hint && <p className="mt-3 border-t border-line pt-3 text-muted">{hint}</p>}
    </div>
  );
}
