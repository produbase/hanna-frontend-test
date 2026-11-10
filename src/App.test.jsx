import { beforeEach, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router";
import { App } from "./App";
import { api } from "./lib/api";
import { normalizeProduct } from "./features/products/model";
import { detail, products } from "../tests/fixtures";

vi.mock("./lib/api", () => ({
  api: { listProducts: vi.fn(), getProduct: vi.fn(), addToCart: vi.fn() },
}));
beforeEach(() => {
  localStorage.clear();
  api.listProducts.mockResolvedValue(products);
  api.getProduct.mockResolvedValue(normalizeProduct(detail));
  api.addToCart.mockResolvedValue(7);
});
function mount(path = "/") {
  return render(
    <MemoryRouter initialEntries={[path]} useTransitions={false}>
      <App />
    </MemoryRouter>,
  );
}

it("filtra, navega al detalle, compra y mantiene el contador al volver y remontar", async () => {
  const user = userEvent.setup();
  const view = mount();
  await screen.findByRole("heading", { name: "Liquid Z6" });
  await user.type(screen.getByRole("searchbox"), "acer");
  expect(
    screen.queryByRole("heading", { name: "Idol 4" }),
  ).not.toBeInTheDocument();
  await user.click(screen.getByRole("link", { name: /Liquid Z6/ }));
  await screen.findByRole("heading", { name: "Liquid Z6", level: 1 });
  expect(screen.getByLabelText("Color")).toHaveValue("1000");
  expect(screen.getByRole("button", { name: /Añadir/ })).toBeDisabled();
  await user.selectOptions(screen.getByLabelText("Almacenamiento"), "2001");
  await user.click(screen.getByRole("button", { name: /Añadir/ }));
  await screen.findByText("Dispositivo añadido a tu bolsa.");
  expect(api.addToCart).toHaveBeenCalledWith({
    id: "phone-1",
    colorCode: 1000,
    storageCode: 2001,
  });
  expect(screen.getByLabelText("7 productos en la bolsa")).toBeInTheDocument();
  await user.click(screen.getByRole("link", { name: /Volver a dispositivos/ }));
  await screen.findByRole("heading", { name: "Liquid Z6" });
  expect(screen.getByRole("searchbox")).toHaveValue("acer");
  view.unmount();
  mount();
  expect(screen.getByLabelText("7 productos en la bolsa")).toBeInTheDocument();
});
it("recupera el catálogo al reintentar y muestra un estado sin resultados", async () => {
  api.listProducts.mockRejectedValueOnce(new Error("Sin conexión"));
  const user = userEvent.setup();
  mount();
  expect(await screen.findByRole("alert")).toHaveTextContent("Sin conexión");
  await user.click(screen.getByRole("button", { name: "Volver a intentar" }));
  await screen.findByRole("heading", { name: "Liquid Z6" });
  await user.type(screen.getByRole("searchbox"), "no existe");
  expect(screen.getByText("No encontramos coincidencias")).toBeInTheDocument();
  await user.click(screen.getByRole("button", { name: "Limpiar búsqueda" }));
  expect(screen.getByRole("heading", { name: "Idol 4" })).toBeInTheDocument();
});
it("mantiene el contador previo cuando falla el carrito y permite reintentar", async () => {
  localStorage.setItem("itx:cart:v1", "3");
  api.addToCart.mockRejectedValueOnce(new Error("Servicio caído"));
  const user = userEvent.setup();
  mount("/products/phone-1");
  await screen.findByRole("heading", { level: 1 });
  await user.selectOptions(screen.getByLabelText("Almacenamiento"), "2000");
  await user.click(screen.getByRole("button", { name: /Añadir/ }));
  expect(await screen.findByRole("alert")).toHaveTextContent("Servicio caído");
  expect(screen.getByLabelText("3 productos en la bolsa")).toBeInTheDocument();
  await user.click(screen.getByRole("button", { name: /Añadir/ }));
  await screen.findByText("Dispositivo añadido a tu bolsa.");
  expect(screen.getByLabelText("7 productos en la bolsa")).toBeInTheDocument();
});
it("bloquea compras simultáneas mientras el servidor responde", async () => {
  let resolve;
  api.addToCart.mockImplementationOnce(
    () =>
      new Promise((done) => {
        resolve = done;
      }),
  );
  const user = userEvent.setup();
  mount("/products/phone-1");
  await screen.findByRole("heading", { level: 1 });
  await user.selectOptions(screen.getByLabelText("Almacenamiento"), "2000");
  const initialCalls = api.addToCart.mock.calls.length;
  await user.dblClick(screen.getByRole("button", { name: /Añadir/ }));
  expect(screen.getByRole("button", { name: "Añadiendo…" })).toBeDisabled();
  expect(api.addToCart.mock.calls.length).toBe(initialCalls + 1);
  resolve(8);
  await waitFor(() =>
    expect(
      screen.getByLabelText("8 productos en la bolsa"),
    ).toBeInTheDocument(),
  );
});
it("presenta una ruta inexistente con salida al catálogo", () => {
  mount("/unknown");
  expect(
    screen.getByRole("heading", { name: /Esta página/ }),
  ).toBeInTheDocument();
});
