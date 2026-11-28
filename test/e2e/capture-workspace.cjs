// Run from repository root after starting the standalone Vet/Admin dev server.
const { chromium } = require("@playwright/test");
const fs = require("node:fs");

(async () => {
  const output = ".impeccable/review";
  fs.mkdirSync(output, { recursive: true });
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  async function settle() {
    await page.evaluate(async () => {
      await document.fonts.ready;
      await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
      await Promise.all(document.getAnimations().map((animation) => animation.finished.catch(() => {})));
      scrollTo(0, 0);
    });
  }
  async function capture(name) {
    await settle();
    await page.screenshot({ path: `${output}/${name}.png`, fullPage: true });
  }
  async function role(name) {
    await page.getByRole("combobox", { name: "บทบาทสาธิต" }).click();
    await page.getByRole("option", { name, exact: true }).click();
  }
  await page.goto("http://127.0.0.1:5174/?demo=1");
  await page.getByRole("heading", { name: "มะลิ", exact: true }).waitFor();
  await capture("desktop");
  for (const width of [1280, 1024]) {
    await page.setViewportSize({ width, height: 900 });
    if (width === 1024) await page.getByRole("button", { name: "ตรวจ มะลิ", exact: true }).click();
    await capture(`desktop-${width}`);
  }
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await capture("readiness-reduced");
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.getByRole("button", { name: "เอกสารตัวอย่างสำหรับสาธิต เปิดอ่าน" }).click();
  await page.getByRole("button", { name: "ปิดหลักฐาน", exact: true }).waitFor();
  await capture("evidence-open");
  for (const name of ["ตรวจตัวสัตว์และลักษณะตรงกับหลักฐานแล้ว", "อ่านชิปจากตัวสัตว์และตรวจข้อมูลตรงกันแล้ว"])
    await page.getByRole("checkbox", { name }).check();
  await page.getByLabel("บันทึกการพิจารณา").fill("ตรวจตัวสัตว์และอ่านชิปตรงกับหลักฐานแล้ว");
  await page.getByRole("button", { name: "รับรองตัวสัตว์", exact: true }).click();
  await capture("sign-review");
  await page.getByRole("button", { name: "กลับไปแก้ไข", exact: true }).click();
  for (const [account, section, filename] of [
    ["ผู้ตรวจหลักฐาน", "ตรวจหลักฐานเจ้าของ", "reviewer"],
    ["กรรมการ 1", "มติกรรมการ", "committee"],
    ["ผู้ดูแลสิทธิ์", "จัดการสิทธิ์", "admin"],
    ["ผู้ตรวจหลักฐาน", "ข้อพิพาท", "disputes"],
    ["สัตวแพทย์", "ประวัติการรับรอง", "history"],
    ["ผู้ดูแลสิทธิ์", "บันทึกการดำเนินการ", "audit"],
  ]) {
    await role(account);
    await page.getByRole("button", { name: section, exact: true }).click();
    await page.getByRole("heading", { name: section, level: 1, exact: true }).waitFor();
    await capture(filename);
  }
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("http://127.0.0.1:5174/?demo=1");
  await page.getByRole("button", { name: "ตรวจ มะลิ", exact: true }).waitFor();
  await capture("mobile-queue");
  await page.getByRole("button", { name: "ตรวจ มะลิ", exact: true }).click();
  await capture("mobile");
  await browser.close();
  if (errors.length) throw new Error(errors.join("\n"));
  console.log("Saved 14 settled captures; no page errors.");
})().catch((error) => { console.error(error); process.exit(1); });
