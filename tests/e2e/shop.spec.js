import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { detail, products } from "../fixtures";

test.beforeEach(async ({ page }) => {
  await page.route("**/api/product", (route) =>
    route.fulfill({ json: products }),
  );
  await page.route("**/api/product/phone-1", (route) =>
    route.fulfill({ json: detail }),
  );
  await page.route("https://example.com/**", (route) =>
    route.fulfill({
      contentType: "image/svg+xml",
      body: '<svg xmlns="http://www.w3.org/2000/svg" width="150" height="260"><rect x="10" y="5" width="130" height="250" rx="16" fill="#252a25"/><rect x="17" y="25" width="116" height="200" rx="3" fill="#929e76"/></svg>',
    }),
  );
});

test("compra, envía los códigos correctos y persiste el contador", async ({
  page,
}) => {
  let body;
  await page.route("**/api/cart", async (route) => {
    body = route.request().postDataJSON();
    await route.fulfill({ json: { count: 4 } });
  });
  await page.goto("/");
  await page.getByRole("searchbox").fill("ACER liquid");
  await expect(page.getByRole("heading", { name: "Idol 4" })).toHaveCount(0);
  await page.getByRole("link", { name: /Liquid Z6/ }).click();
  await expect(page.getByLabel("Color", { exact: true })).toHaveValue("1000");
  await expect(page.getByRole("button", { name: /Añadir/ })).toBeDisabled();
  await page.getByLabel("Almacenamiento").selectOption("2001");
  await page.getByRole("button", { name: /Añadir/ }).click();
  await expect(page.getByText("Dispositivo añadido a tu bolsa.")).toBeVisible();
  expect(body).toEqual({ id: "phone-1", colorCode: 1000, storageCode: 2001 });
  await page.reload();
  await expect(page.getByLabel("4 productos en la bolsa")).toBeVisible();
  await page.getByRole("link", { name: /Volver a dispositivos/ }).click();
  await expect(page.getByRole("searchbox")).toHaveValue("ACER liquid");
});

test("no repite GET al navegar y recargar antes de una hora", async ({
  page,
}) => {
  let requests = 0;
  page.on("request", (request) => {
    if (request.url().endsWith("/api/product")) requests += 1;
  });
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "Liquid Z6" })).toBeVisible();
  await page.reload();
  await expect(page.getByRole("heading", { name: "Liquid Z6" })).toBeVisible();
  expect(requests).toBe(1);
});

test("revalida la caché caducada en lugar de servir datos antiguos", async ({
  page,
}) => {
  let requests = 0;
  page.on("request", (request) => {
    if (request.url().endsWith("/api/product")) requests += 1;
  });
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "Liquid Z6" })).toBeVisible();
  await page.evaluate(() => {
    for (const key of Object.keys(localStorage)) {
      if (key.startsWith("itx:cache:v1:")) {
        const entry = JSON.parse(localStorage.getItem(key));
        entry.expiresAt = Date.now() - 1;
        localStorage.setItem(key, JSON.stringify(entry));
      }
    }
  });
  await page.reload();
  await expect(page.getByRole("heading", { name: "Liquid Z6" })).toBeVisible();
  expect(requests).toBe(2);
});

test("permite recuperar un fallo del servicio", async ({ page }) => {
  let calls = 0;
  await page.route("**/api/product", (route) =>
    route.fulfill(
      ++calls === 1 ? { status: 503, json: {} } : { json: products },
    ),
  );
  await page.goto("/");
  await expect(page.getByRole("alert")).toContainText(
    "El servicio no está disponible",
  );
  await page.getByRole("button", { name: "Volver a intentar" }).click();
  await expect(page.getByRole("heading", { name: "Liquid Z6" })).toBeVisible();
});

test("muestra ficha abierta por URL, atributos y precio ausente", async ({
  page,
}) => {
  await page.goto("/products/phone-1");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Liquid Z6");
  await expect(page.getByText("720 x 1280 pixels")).toBeVisible();
  await expect(page.getByText("150 x 75 x 8 mm")).toBeVisible();
  await page.getByRole("link", { name: /Volver a dispositivos/ }).click();
  await expect(page.getByText("Precio no disponible")).toBeVisible();
});

test("catálogo y detalle sin infracciones axe y sin desbordamiento", async ({
  page,
}, testInfo) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "Liquid Z6" })).toBeVisible();
  await expect(page.locator(".product-image img").first()).toHaveJSProperty(
    "complete",
    true,
  );
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
  await page.screenshot({
    path: `output/screenshots/catalog-${testInfo.project.name}.png`,
    fullPage: true,
  });
  await page.getByRole("link", { name: /Liquid Z6/ }).click();
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Liquid Z6");
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
  await page.screenshot({
    path: `output/screenshots/detail-${testInfo.project.name}.png`,
    fullPage: true,
  });
});

test("permite búsqueda y compra con teclado y opciones únicas", async ({
  page,
}) => {
  await page.route("**/api/product/phone-1", (route) =>
    route.fulfill({
      json: {
        ...detail,
        options: { ...detail.options, storages: [detail.options.storages[0]] },
      },
    }),
  );
  await page.route("**/api/cart", (route) =>
    route.fulfill({ json: { count: 1 } }),
  );
  await page.goto("/");
  await page.keyboard.press("Tab");
  await expect(
    page.getByRole("link", { name: "Saltar al contenido" }),
  ).toBeFocused();
  await page.keyboard.press("Enter");
  await page.getByRole("searchbox").focus();
  await page.keyboard.type("Acer");
  await expect(page.getByRole("searchbox")).toHaveValue("Acer");
  await page.getByRole("link", { name: /Liquid Z6/ }).press("Enter");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Liquid Z6");
  await expect(page.getByLabel("Almacenamiento")).toHaveValue("2000");
  await page.getByRole("button", { name: /Añadir/ }).press("Enter");
  await expect(page.getByText("Dispositivo añadido a tu bolsa.")).toBeVisible();
});
