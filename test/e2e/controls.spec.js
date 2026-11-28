import { test, expect } from "@playwright/test";

test("custom dropdown supports keyboard, Escape, outside click", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 1080 });
  await page.goto("/?demo=1");
  const role = page.getByRole("combobox", { name: "บทบาทสาธิต" });
  await role.click();
  await expect(page.getByRole("listbox")).toBeVisible();
  await role.press("End");
  await role.press("Enter");
  await expect(role).toContainText("Owner");
  await expect(
    page.getByText("ต้องใช้ Wallet ที่ได้รับสิทธิ์สัตวแพทย์"),
  ).toBeVisible();
  await role.click();
  await role.press("Escape");
  await expect(page.getByRole("listbox")).toHaveCount(0);
  await expect(role).toBeFocused();
  await role.click();
  await page
    .getByRole("heading", { name: "คิวตรวจสัตว์", exact: true })
    .click();
  await expect(page.getByRole("listbox")).toHaveCount(0);
  await role.click();
  await role.press("Home");
  await role.press("Enter");
  await expect(role).toContainText("สัตวแพทย์");
  const checkbox = page.getByRole("checkbox", {
    name: "ตรวจตัวสัตว์และลักษณะตรงกับหลักฐานแล้ว",
  });
  await checkbox.focus();
  await checkbox.press("Space");
  await expect(checkbox).toBeChecked();
  await role.click();
  await page.screenshot({
    path: "test-results/custom-controls.png",
    fullPage: true,
  });
});

test("search clear, wallet tooltip and auto-growing notes use the app controls", async ({
  page,
}) => {
  await page.goto("/?demo=1");
  const search = page.getByRole("searchbox");
  await search.fill("ไม่มีชื่อนี้");
  await expect(
    page.getByText("ไม่มีรายการในคิว", { exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: "ล้างคำค้น", exact: true }).click();
  await expect(search).toHaveValue("");
  await expect(search).toBeFocused();
  await expect(
    page.getByRole("heading", { name: "มะลิ", exact: true }),
  ).toBeVisible();
  const expand = page.getByRole("button", { name: "ขยายเมนูด้านข้าง", exact: true });
  if (await expand.isVisible()) await expand.click();
  const wallet = page.getByText("0x0000…0003", { exact: true });
  await wallet.hover();
  await expect(page.getByRole("tooltip")).toContainText(
    "0x0000000000000000000000000000000000000003",
  );
  const tooltipBox = await page.getByRole("tooltip").boundingBox();
  await page.mouse.move(tooltipBox.x + 10, tooltipBox.y + 10);
  await expect(page.getByRole("tooltip")).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("tooltip")).toHaveCount(0);
  const notes = page.getByLabel("บันทึกการพิจารณา");
  await notes.fill("ผลการตรวจสัตว์\n".repeat(12));
  expect((await notes.boundingBox()).height).toBeGreaterThan(150);
});

test("forms show inline validation instead of browser validation bubbles", async ({
  page,
}) => {
  await page.goto("/?demo=1");
  await page.getByRole("combobox", { name: "บทบาทสาธิต" }).click();
  await page
    .getByRole("option", { name: "ผู้ดูแลสิทธิ์", exact: true })
    .click();
  await page.getByRole("button", { name: "จัดการสิทธิ์", exact: true }).click();
  const address = page.getByLabel("Wallet บุคลากร");
  await address.fill("bad-address");
  await page.getByRole("button", { name: "ตรวจสอบการเปลี่ยนสิทธิ์" }).click();
  await expect(page.getByRole("alert")).toContainText("รูปแบบข้อมูลไม่ถูกต้อง");
  await expect(address).toHaveAttribute("aria-invalid", "true");
  await expect(address).toBeFocused();
  await address.fill("0x0000000000000000000000000000000000000001");
  await page.getByRole("button", { name: "ตรวจสอบการเปลี่ยนสิทธิ์" }).click();
  await expect(
    page.getByRole("heading", { name: "ตรวจสอบก่อนลงนาม", exact: true }),
  ).toBeVisible();
});
