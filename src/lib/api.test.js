import { beforeEach, expect, it, vi } from "vitest";
import { detail, products } from "../../tests/fixtures";

let api;
beforeEach(async () => {
  vi.resetModules();
  localStorage.clear();
  api = (await import("./api")).api;
});
const reply = (body, status = 200) => ({
  ok: status >= 200 && status < 300,
  status,
  json: async () => body,
});

it("cachea GET y adapta el detalle", async () => {
  const fetch = vi
    .fn()
    .mockResolvedValueOnce(reply(products))
    .mockResolvedValueOnce(reply(detail));
  vi.stubGlobal("fetch", fetch);
  expect(await api.listProducts()).toEqual(products);
  await api.listProducts();
  expect(fetch).toHaveBeenCalledTimes(1);
  expect((await api.getProduct("phone-1")).dimensions).toBe(detail.dimentions);
});
it("envía códigos numéricos y usa el contador exacto sin cachear POST", async () => {
  const fetch = vi.fn().mockResolvedValue(reply({ count: 9 }));
  vi.stubGlobal("fetch", fetch);
  const payload = { id: "phone-1", colorCode: 1000, storageCode: 2001 };
  expect(await api.addToCart(payload)).toBe(9);
  await api.addToCart(payload);
  expect(fetch).toHaveBeenCalledTimes(2);
  expect(fetch.mock.calls[0][1]).toMatchObject({
    method: "POST",
    body: JSON.stringify(payload),
    headers: { "Content-Type": "application/json" },
  });
});
it.each([-1, "1", null, 1.4])(
  "rechaza un contador inválido %s",
  async (count) => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(reply({ count })));
    await expect(api.addToCart({})).rejects.toThrow("confirmar");
  },
);
it("diferencia un 404 y permite reintentar tras un fallo", async () => {
  vi.stubGlobal(
    "fetch",
    vi
      .fn()
      .mockResolvedValueOnce(reply({}, 404))
      .mockResolvedValueOnce(reply(detail)),
  );
  await expect(api.getProduct("missing")).rejects.toThrow("No encontramos");
  expect((await api.getProduct("missing")).id).toBe("phone-1");
});
it("rechaza respuestas de catálogo con forma inválida", async () => {
  vi.stubGlobal(
    "fetch",
    vi.fn().mockResolvedValue(reply({ unexpected: true })),
  );
  await expect(api.listProducts()).rejects.toThrow("datos");
});
it("explica fallos de red y JSON inválido", async () => {
  vi.stubGlobal(
    "fetch",
    vi
      .fn()
      .mockRejectedValueOnce(new TypeError("fetch failed"))
      .mockResolvedValueOnce({
        ok: true,
        json: async () => {
          throw new Error("JSON");
        },
      }),
  );
  await expect(api.listProducts()).rejects.toThrow("conexión");
  await expect(api.listProducts()).rejects.toThrow("respuesta no válida");
});
it("interrumpe lecturas lentas tras 20 segundos", async () => {
  vi.useFakeTimers();
  vi.stubGlobal(
    "fetch",
    vi.fn(
      (_, options) =>
        new Promise((resolve, reject) => {
          options.signal.addEventListener("abort", () =>
            reject(new DOMException("Aborted", "AbortError")),
          );
        }),
    ),
  );
  try {
    const outcome = expect(api.listProducts()).rejects.toThrow(
      "tardando demasiado",
    );
    await vi.advanceTimersByTimeAsync(20000);
    await outcome;
  } finally {
    vi.useRealTimers();
  }
});
