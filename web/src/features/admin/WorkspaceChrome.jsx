import { Tooltip, Select } from "./controls";
import { useState } from "react";
import { Icon, labels, shortAddress } from "./components";

export function Navigation({ sections, section, data, demo, onNavigate, account }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const order = ["vet", "review", "history", "disputes", "committee", "roles", "audit"];
  return (
    <header className="pc-navigation-bar">
      <div className="pc-brand-row">
        <a className="pc-brand" href={demo ? "?demo=1" : "?"}><Icon name="paw" />PetChain</a>
        <button type="button" className="pc-mobile-menu" aria-expanded={menuOpen} aria-controls="pc-navigation" onClick={() => setMenuOpen(!menuOpen)}>{menuOpen ? "ปิดเมนู" : "เปิดเมนูผู้รับรอง"}</button>
      </div>
      <nav id="pc-navigation" aria-label="เมนูผู้รับรอง" className="pc-top-navigation" data-open={menuOpen}>
        {order.map((key) => {
          const item = sections.find((entry) => entry[0] === key);
          const count = key === "vet" ? data.pets.filter((pet) => pet.identity !== "Verified").length : key === "disputes" ? data.disputes.filter((row) => row.status === "Submitted").length : 0;
          return <button key={key} type="button" aria-label={item[1]} aria-current={section === key ? "page" : undefined} onClick={() => { onNavigate(key); setMenuOpen(false); }}><Icon name={item[2]} /><span>{item[1]}</span>{count > 0 && <span className="pc-nav-count" aria-hidden="true">{count}</span>}</button>;
        })}
      </nav>
      {account}
    </header>
  );
}
export function WorkspaceHeader({ session, busy, connect }) {
  return (
    <div className="pc-account">
      {session && <div className="pc-account-identity"><span>{session.roles.length ? session.roles.map((role) => labels[role]).join(" / ") : "ไม่มีสิทธิ์ผู้รับรอง"}</span><Tooltip content={session.account}><span className="pc-account-address">{shortAddress(session.account)}</span></Tooltip></div>}
      <Tooltip content={session ? "เชื่อม Wallet ปัจจุบันอีกครั้ง" : "เชื่อม Wallet เพื่อเริ่มทำงาน"}><button type="button" className="pc-wallet-button" aria-label={busy ? "กำลังดำเนินการ…" : session ? "เชื่อมต่ออีกครั้ง" : "เชื่อม Wallet"} disabled={busy} onClick={connect}><Icon name="shield" />{!session && <span>เชื่อม Wallet</span>}</button></Tooltip>
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
