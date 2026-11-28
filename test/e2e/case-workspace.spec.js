import { test, expect } from "@playwright/test";

test("desktop places evidence beside decisions and retains per-case drafts", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto("/?demo=1");
  const evidence = page.locator(".pc-evidence-area");
  const decision = page.locator(".pc-decision-area");
  const left = await evidence.boundingBox();
  const right = await decision.boundingBox();
  expect(Math.abs(left.y - right.y)).toBeLessThan(2);
  expect(left.x + left.width).toBeLessThanOrEqual(right.x + 1);
  await page.getByLabel("บันทึกการพิจารณา").fill("ร่างตรวจเฉพาะมะลิ");
  await page.getByRole("checkbox", { name: "ตรวจตัวสัตว์และลักษณะตรงกับหลักฐานแล้ว" }).check();
  await page.getByRole("button", { name: "ตรวจ ถั่วแดง", exact: true }).click();
  await expect(page.getByLabel("บันทึกการพิจารณา")).toHaveValue("");
  await page.getByRole("button", { name: "ตรวจ มะลิ", exact: true }).click();
  await expect(page.getByLabel("บันทึกการพิจารณา")).toHaveValue("ร่างตรวจเฉพาะมะลิ");
  await expect(page.getByRole("checkbox", { name: "ตรวจตัวสัตว์และลักษณะตรงกับหลักฐานแล้ว" })).toBeChecked();
  await page.getByRole("searchbox").fill("PC-0003");
  await expect(page.getByRole("button", { name: "ตรวจ ถั่วแดง", exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: "ตรวจ มะลิ", exact: true })).toHaveCount(0);
});

test("mobile opens a case from queue and restores queue focus with reduced motion", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/?demo=1");
  await expect(page.getByLabel("บันทึกการพิจารณา")).not.toBeVisible();
  await page.getByRole("button", { name: "ตรวจ มะลิ", exact: true }).click();
  await expect(page.getByRole("heading", { name: "มะลิ", exact: true })).toBeFocused();
  await expect(page.getByRole("searchbox")).not.toBeVisible();
  await expect(page.getByLabel("บันทึกการพิจารณา")).toBeVisible();
  expect(await page.locator(".pc-case-detail").evaluate((el) => el.getAnimations().length)).toBe(0);
  await page.getByRole("button", { name: "กลับคิวตรวจ", exact: true }).click();
  await expect(page.getByRole("button", { name: "ตรวจ มะลิ", exact: true })).toBeFocused();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});

test("1024 desktop keeps paired evidence and decision after choosing a case", async ({ page }) => {
  await page.setViewportSize({ width: 1024, height: 900 });
  await page.goto("/?demo=1");
  await page.getByRole("button", { name: "ตรวจ มะลิ", exact: true }).click();
  await expect(page.getByRole("searchbox")).not.toBeVisible();
  const left = await page.locator(".pc-evidence-area").boundingBox();
  const right = await page.locator(".pc-decision-area").boundingBox();
  expect(Math.abs(left.y - right.y)).toBeLessThan(2);
  expect(left.x + left.width).toBeLessThanOrEqual(right.x + 1);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  const check = page.locator('.pc-readiness [data-complete="true"] svg');
  expect(await check.evaluate((el) => el.getBoundingClientRect().width)).toBeGreaterThanOrEqual(18);
  expect(await check.locator("path").evaluate((el) => getComputedStyle(el).strokeDasharray)).toBe("none");
});

test("signing review shows the full role recipient and consequence before confirmation", async ({ page }) => {
  await page.goto("/?demo=1");
  await page.getByRole("combobox", { name: "บทบาทสาธิต" }).click();
  await page.getByRole("option", { name: "ผู้ดูแลสิทธิ์", exact: true }).click();
  await page.getByRole("button", { name: "จัดการสิทธิ์", exact: true }).click();
  const recipient = "0x0000000000000000000000000000000000000001";
  await page.getByLabel("Wallet บุคลากร").fill(recipient);
  await page.getByRole("button", { name: "ตรวจสอบการเปลี่ยนสิทธิ์" }).click();
  const review = page.getByRole("region", { name: "ตรวจสอบก่อนลงนาม" });
  await expect(review).toContainText(recipient);
  await expect(review).toContainText("มอบสิทธิ์สัตวแพทย์ให้ Wallet เป้าหมาย");
  await expect(page.getByRole("heading", { name: "ตรวจสอบก่อนลงนาม", exact: true })).toBeFocused();
  await page.getByRole("button", { name: "กลับไปแก้ไข", exact: true }).click();
  await expect(page.getByLabel("Wallet บุคลากร")).toHaveValue(recipient);
});
