import { test, expect } from "@playwright/test";
async function confirm(page) {
  await page
    .getByRole("button", { name: "ยืนยันและลงนาม", exact: true })
    .click();
  await expect(page.getByRole("status")).toContainText(
    "ดำเนินการในโหมดสาธิตแล้ว",
  );
}
async function role(page, value) {
  const names = {
    vet: "สัตวแพทย์",
    reviewer: "ผู้ตรวจหลักฐาน",
    committee1: "กรรมการ 1",
    committee2: "กรรมการ 2",
    committee3: "กรรมการ 3",
    admin: "ผู้ดูแลสิทธิ์",
    owner: "Owner (ไม่มีสิทธิ์รับรอง)",
  };
  await page.getByRole("combobox", { name: "บทบาทสาธิต" }).click();
  await page.getByRole("option", { name: names[value], exact: true }).click();
  await expect(page.getByText("กำลังตรวจข้อมูลล่าสุด…")).toHaveCount(0);
}
test.beforeEach(async ({ page }) => {
  await page.goto("/?demo=1");
});

test("Vet → Reviewer → card, history, audit and no fake explorer links", async ({
  page,
}) => {
  await page
    .getByRole("checkbox", { name: "ตรวจตัวสัตว์และลักษณะตรงกับหลักฐานแล้ว" })
    .check();
  await page
    .getByRole("checkbox", {
      name: "อ่านชิปจากตัวสัตว์และตรวจข้อมูลตรงกันแล้ว",
    })
    .check();
  await page
    .getByLabel("บันทึกการพิจารณา")
    .fill("ตรวจตัวสัตว์และอ่านชิปตรงกัน");
  await page
    .getByRole("button", { name: "รับรองตัวสัตว์", exact: true })
    .click();
  await confirm(page);
  await role(page, "reviewer");
  await page
    .getByRole("button", { name: "ตรวจหลักฐานเจ้าของ", exact: true })
    .click();
  await page
    .getByRole("checkbox", {
      name: "ตรวจความครบถ้วนและความสัมพันธ์ของหลักฐานแล้ว",
    })
    .check();
  await page.getByLabel("บันทึกการพิจารณา").fill("ตรวจหลักฐานการรับเลี้ยงครบ");
  await page
    .getByRole("button", { name: "รับรองหลักฐานเจ้าของ", exact: true })
    .click();
  await confirm(page);
  await page
    .getByRole("button", { name: "ออกบัตรดิจิทัล", exact: true })
    .click();
  await confirm(page);
  await expect(
    page
      .getByLabel("พิจารณาหลักฐานเจ้าของ")
      .getByText("ใช้งานได้", { exact: true }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "บันทึกการดำเนินการ", exact: true })
    .click();
  await expect(
    page.getByRole("cell", { name: "ออกบัตรดิจิทัล", exact: true }),
  ).toBeVisible();
  await expect(page.locator('a[href*="etherscan.io/tx/"]')).toHaveCount(0);
});

test("dispute screens require two different committee wallets", async ({
  page,
}) => {
  await role(page, "reviewer");
  await page.getByRole("button", { name: "ข้อพิพาท", exact: true }).click();
  await page.getByLabel("บันทึกการพิจารณา").fill("รับเรื่องเพื่อตรวจสอบ");
  await page
    .getByRole("button", { name: "รับเรื่องและระงับโอน", exact: true })
    .click();
  await confirm(page);
  await role(page, "committee1");
  await page.getByLabel("บันทึกการพิจารณา").fill("ยังมีหลักฐานไม่เพียงพอ");
  await page
    .getByRole("button", { name: "เสนอให้กรรมการลงมติ", exact: true })
    .click();
  await confirm(page);
  await page.getByRole("button", { name: "มติกรรมการ", exact: true }).click();
  await page
    .getByRole("button", { name: "อนุมัติข้อเสนอ", exact: true })
    .click();
  await confirm(page);
  await expect(
    page.getByRole("button", { name: "คุณโหวตแล้ว", exact: true }),
  ).toBeDisabled();
  await expect(page.getByText("1 / 2 เสียง")).toBeVisible();
  await role(page, "committee2");
  await page
    .getByRole("button", { name: "อนุมัติข้อเสนอ", exact: true })
    .click();
  await confirm(page);
  await expect(page.getByText("2 / 2 เสียง")).toBeVisible();
  await page.getByRole("button", { name: "ข้อพิพาท", exact: true }).click();
  await expect(
    page.getByText("ยังหาข้อยุติไม่ได้", { exact: true }).first(),
  ).toBeVisible();
});

test("unauthorized users, no chip, search empty state and private evidence preview", async ({
  page,
}) => {
  await page
    .getByRole("button", { name: "เอกสารตัวอย่างสำหรับสาธิต เปิดอ่าน" })
    .click();
  await expect(
    page.getByText("ข้อมูลจำลอง: หลักฐานการรับเลี้ยง", { exact: false }),
  ).toBeVisible();
  await page.getByRole("button", { name: "ตรวจ ถั่วแดง" }).click();
  await expect(
    page.getByRole("button", { name: "รับรองตัวสัตว์", exact: true }),
  ).toBeDisabled();
  await role(page, "owner");
  await expect(
    page.getByText("ต้องใช้ Wallet ที่ได้รับสิทธิ์สัตวแพทย์"),
  ).toBeVisible();
  await page.getByRole("searchbox").fill("ไม่พบชื่อนี้");
  await expect(
    page.getByText("ไม่มีรายการในคิว", { exact: true }),
  ).toBeVisible();
});

test("roles can be granted and revoked without changing committee", async ({
  page,
}) => {
  await role(page, "admin");
  await page.getByRole("button", { name: "จัดการสิทธิ์", exact: true }).click();
  await page
    .getByLabel("Wallet บุคลากร")
    .fill("0x0000000000000000000000000000000000000001");
  await page.getByRole("button", { name: "ตรวจสอบการเปลี่ยนสิทธิ์" }).click();
  await confirm(page);
  await role(page, "owner");
  await page.getByRole("button", { name: "คิวตรวจสัตว์", exact: true }).click();
  await expect(
    page.getByText("ต้องใช้ Wallet ที่ได้รับสิทธิ์สัตวแพทย์"),
  ).toHaveCount(0);
  await role(page, "admin");
  await page.getByRole("button", { name: "จัดการสิทธิ์", exact: true }).click();
  await page
    .getByLabel("Wallet บุคลากร")
    .fill("0x0000000000000000000000000000000000000001");
  await page
    .getByRole("combobox", { name: "การดำเนินการ", exact: true })
    .click();
  await page.getByRole("option", { name: "ถอนสิทธิ์", exact: true }).click();
  await page.getByRole("button", { name: "ตรวจสอบการเปลี่ยนสิทธิ์" }).click();
  await confirm(page);
  await role(page, "owner");
  await page.getByRole("button", { name: "คิวตรวจสัตว์", exact: true }).click();
  await expect(
    page.getByText("ต้องใช้ Wallet ที่ได้รับสิทธิ์สัตวแพทย์"),
  ).toBeVisible();
});

test("live mode never silently falls back to demonstration", async ({
  page,
}) => {
  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: "เชื่อม Wallet เพื่อเริ่มตรวจงาน" }),
  ).toBeVisible();
  await expect(page.getByText("มะลิ", { exact: true })).toHaveCount(0);
  await page
    .getByRole("button", { name: "เชื่อม Wallet", exact: true })
    .click();
  await expect(page.getByRole("alert")).toContainText("MetaMask");
});

test("phone layout has no page overflow and remains keyboard accessible", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await expect(
    page.getByRole("heading", { name: "คิวตรวจสัตว์", exact: true }),
  ).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await page.keyboard.press("Tab");
  await expect(page.getByRole("link", { name: "ข้ามไปเนื้อหา" })).toBeFocused();
  await page
    .getByRole("link", { name: "ข้ามไปเนื้อหา" })
    .evaluate((element) => element.blur());
  await page.screenshot({
    path: "test-results/vet-mobile.png",
    fullPage: true,
  });
  await page.getByRole("button", { name: "ตรวจ ถั่วแดง", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "ถั่วแดง", exact: true }),
  ).toBeInViewport();
});

test("desktop rendering has no console errors", async ({ page }) => {
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.setViewportSize({ width: 1440, height: 1080 });
  await page.reload();
  await expect(page.getByRole("heading", { name: "มะลิ" })).toBeVisible();
  await page.screenshot({
    path: "test-results/vet-desktop.png",
    fullPage: true,
  });
  for (const width of [1024, 390]) {
    await page.setViewportSize({ width, height: 900 });
    for (const [account, section] of [
      ["reviewer", "ตรวจหลักฐานเจ้าของ"],
      ["committee1", "มติกรรมการ"],
      ["admin", "จัดการสิทธิ์"],
      ["reviewer", "ข้อพิพาท"],
      ["vet", "ประวัติการรับรอง"],
    ]) {
      await role(page, account);
      const menu = page.getByRole("button", {
        name: "เปิดเมนูผู้รับรอง",
        exact: true,
      });
      if (await menu.isVisible()) await menu.click();
      await page.getByRole("button", { name: section, exact: true }).click();
      await expect(
        page.getByRole("heading", { name: section, exact: true, level: 1 }),
      ).toBeVisible();
      if (width === 1024 && section === "มติกรรมการ")
        await page.screenshot({
          path: "test-results/committee-tablet.png",
          fullPage: true,
        });
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
      ).toBe(true);
    }
  }
  expect(errors).toEqual([]);
});
