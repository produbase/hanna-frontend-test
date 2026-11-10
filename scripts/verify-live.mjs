import { chromium } from "@playwright/test";
import assert from "node:assert/strict";
import { mkdir, writeFile } from "node:fs/promises";

// Explicit, opt-in smoke test against the real service. Executes one cart POST.
const browser = await chromium.launch({ channel: "chrome" });
const report = {
  date: new Date().toISOString(),
  source: "API real, sin interceptar peticiones",
  checks: [],
};
await mkdir("output/screenshots", { recursive: true });
try {
  for (const viewport of [
    { width: 1440, height: 1000 },
    { width: 390, height: 844 },
  ]) {
    const page = await browser.newPage({ viewport });
    const errors = [];
    page.on("pageerror", (error) => errors.push(error.message));
    await page.goto("http://127.0.0.1:5173/");
    await page
      .getByRole("heading", { name: "Iconia Talk S", exact: true })
      .waitFor({ timeout: 30000 });
    const count = await page.locator(".product-card").count();
    assert.ok(count > 0);
    await page
      .locator(".product-card")
      .first()
      .locator("img")
      .evaluate((img) => img.decode());
    assert.ok(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    );
    await page.screenshot({
      path: `output/screenshots/live-catalog-${viewport.width}.png`,
    });
    await page.getByRole("searchbox").fill("Acer Iconia Talk");
    assert.equal(await page.locator(".product-card").count(), 1);
    await page.getByRole("link", { name: /Iconia Talk S/ }).click();
    await page
      .getByRole("heading", { level: 1, name: "Iconia Talk S" })
      .waitFor();
    await page.locator(".detail-visual img").evaluate((img) => img.decode());
    await page.screenshot({
      path: `output/screenshots/live-detail-${viewport.width}.png`,
      fullPage: true,
    });
    if (viewport.width === 1440) {
      const storage = page.getByLabel("Almacenamiento");
      const code = await storage.locator("option").last().getAttribute("value");
      await storage.selectOption(code);
      const responsePromise = page.waitForResponse((response) =>
        response.url().endsWith("/api/cart"),
      );
      await page.getByRole("button", { name: "Añadir a la bolsa" }).click();
      const response = await responsePromise;
      assert.ok(response.ok());
      const { count: cartCount } = await response.json();
      await page.getByText("Dispositivo añadido a tu bolsa.").waitFor();
      assert.equal(await page.locator(".count").innerText(), String(cartCount));
      await page.reload();
      assert.equal(await page.locator(".count").innerText(), String(cartCount));
      report.cartCount = cartCount;
    }
    assert.deepEqual(errors, []);
    report.checks.push({
      viewport,
      products: count,
      search: "passed",
      detail: "passed",
      images: "passed",
      overflow: false,
      runtimeErrors: errors,
    });
    await page.close();
  }
  await writeFile(
    "output/live-verification.json",
    JSON.stringify(report, null, 2),
  );
  console.log(JSON.stringify(report, null, 2));
} finally {
  await browser.close();
}
