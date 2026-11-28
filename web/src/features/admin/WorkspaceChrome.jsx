import { Tooltip, Select } from "./controls";
import { useEffect, useRef, useState } from "react";
import { Icon, labels, shortAddress } from "./components";

export function Navigation({ sections, section, data, demo, onNavigate, account }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(() => innerWidth < 1400);
  const [mobile, setMobile] = useState(() => innerWidth < 768);
  const header = useRef(null), menuButton = useRef(null);
  const order = ["vet", "review", "history", "disputes", "committee", "roles", "audit"];
  useEffect(() => {
    const query = matchMedia("(max-width: 767px)");
    const update = () => { setMobile(query.matches); setMenuOpen(false); };
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);
  useEffect(() => {
    if (!mobile || !menuOpen) return;
    const content = document.querySelector(".pc-workspace-body");
    const overflow = document.body.style.overflow;
    if (content) content.inert = true;
    document.body.style.overflow = "hidden";
    menuButton.current?.focus();
    const keys = (e) => {
      if (e.key === "Escape") { e.preventDefault(); setMenuOpen(false); }
      if (e.key !== "Tab") return;
      const nodes = [...header.current.querySelectorAll('a[href],button:not(:disabled)')].filter((node) => node.getClientRects().length);
      const first = nodes[0], last = nodes.at(-1);
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last?.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first?.focus(); }
    };
    document.addEventListener("keydown", keys);
    return () => {
      if (content) content.inert = false;
      document.body.style.overflow = overflow;
      document.removeEventListener("keydown", keys);
      menuButton.current?.focus();
    };
  }, [mobile, menuOpen]);
  return <>
    {mobile && menuOpen && <button type="button" className="pc-menu-backdrop" aria-label="ปิดเมนูด้านข้าง" tabIndex={-1} onClick={() => setMenuOpen(false)} />}
    <header ref={header} className="pc-navigation-bar" data-collapsed={collapsed} data-open={menuOpen} role={mobile && menuOpen ? "dialog" : undefined} aria-modal={mobile && menuOpen ? true : undefined} aria-label={mobile && menuOpen ? "เมนูผู้รับรอง" : undefined}>
      <div className="pc-brand-row">
        <a className="pc-brand" aria-label="PetChain" href={demo ? "?demo=1" : "?"}><Icon name="paw" /><span>PetChain</span></a>
        <button ref={menuButton} type="button" className="pc-mobile-menu" aria-expanded={menuOpen} aria-controls="pc-navigation" onClick={() => setMenuOpen(!menuOpen)}>{menuOpen ? "ปิดเมนู" : "เปิดเมนูผู้รับรอง"}</button>
      </div>
      <Tooltip content={collapsed ? "ขยายเมนูด้านข้าง" : "ย่อเมนูด้านข้าง"}><button type="button" className="pc-sidebar-toggle" aria-label={collapsed ? "ขยายเมนูด้านข้าง" : "ย่อเมนูด้านข้าง"} aria-expanded={!collapsed} aria-controls="pc-navigation" onClick={() => setCollapsed(!collapsed)}><span className={collapsed ? "" : "rotate-180"}><Icon name="chevron" /></span><span className="pc-collapse-label">ย่อเมนู</span></button></Tooltip>
      <nav id="pc-navigation" aria-label="เมนูผู้รับรอง" className="pc-top-navigation" data-open={menuOpen}>
        {order.map((key) => {
          const item = sections.find((entry) => entry[0] === key);
          const count = key === "vet" ? data.pets.filter((pet) => pet.identity !== "Verified").length : key === "disputes" ? data.disputes.filter((row) => row.status === "Submitted").length : 0;
          const button = <button type="button" aria-label={item[1]} aria-current={section === key ? "page" : undefined} onClick={() => { onNavigate(key); setMenuOpen(false); }}><Icon name={item[2]} /><span className="pc-nav-label">{item[1]}</span>{count > 0 && <span className="pc-nav-count" aria-hidden="true">{count}</span>}</button>;
          return collapsed && !mobile ? <Tooltip key={key} content={item[1]}>{button}</Tooltip> : <span className="pc-nav-entry" key={key}>{button}</span>;
        })}
      </nav>
      {account}
    </header>
  </>;
}
export function WorkspaceHeader({ session, busy, connect }) {
  return (
    <div className="pc-account">
      {session && <div className="pc-account-identity"><span>{session.roles.length ? session.roles.map((role) => labels[role]).join(" / ") : "ไม่มีสิทธิ์ผู้รับรอง"}</span><Tooltip content={session.account}><span className="pc-account-address">{shortAddress(session.account)}</span></Tooltip></div>}
      <Tooltip content={session ? `${session.account} · ${session.roles.map((role) => labels[role]).join(" / ") || "ไม่มีสิทธิ์ผู้รับรอง"} · เชื่อม Wallet ปัจจุบันอีกครั้ง` : "เชื่อม Wallet เพื่อเริ่มทำงาน"}><button type="button" className="pc-wallet-button" aria-label={busy ? "กำลังดำเนินการ…" : session ? "เชื่อมต่ออีกครั้ง" : "เชื่อม Wallet"} disabled={busy} onClick={connect}><Icon name="shield" />{!session && <span>เชื่อม Wallet</span>}</button></Tooltip>
    </div>
  );
}
export function DemoNotice({ role, busy, onChange }) {
  return (
    <div className="pc-demo-notice">
      <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
        <strong className="flex items-center gap-2 font-medium text-ink">
          <span className="h-1.5 w-1.5 rounded-full bg-[#9c742b]" />
          โหมดสาธิต
        </strong>
        <span>ข้อมูลจำลอง ไม่ส่งธุรกรรมจริง</span>
      </div>
      <label className="flex items-center gap-3 whitespace-nowrap">
        สลับบทบาท
        <Select
          aria-label="บทบาทสาธิต"
          className="!w-[180px] shrink-0 rounded-lg border border-control bg-white px-2 py-1.5 text-xs text-ink"
          value={role}
          disabled={busy}
          onChange={(e) => onChange(e.target.value)}
        >
          {Object.entries({
            vet: "สัตวแพทย์",
            reviewer: "ผู้ตรวจหลักฐาน",
            committee1: "กรรมการ 1",
            committee2: "กรรมการ 2",
            committee3: "กรรมการ 3",
            admin: "ผู้ดูแลสิทธิ์",
            owner: "Owner (ไม่มีสิทธิ์รับรอง)",
          }).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </Select>
      </label>
    </div>
  );
}
