import { describe, expect, it } from "vitest";
import {
  filterProducts,
  formatPrice,
  formatSpec,
  normalizeProduct,
} from "./model";
import { detail, products } from "../../../tests/fixtures";

describe("modelo de producto", () => {
  it("busca por marca y modelo sin mayúsculas ni espacios adicionales", () => {
    expect(filterProducts(products, "  ACER  liquid  ")).toEqual([products[0]]);
    expect(filterProducts(products, "IDOL")).toEqual([products[1]]);
    expect(filterProducts(products, "")).toHaveLength(2);
    expect(filterProducts(products, "inexistente")).toHaveLength(0);
  });
  it("ignora acentos en la búsqueda", () => {
    expect(
      filterProducts([{ brand: "Móvil", model: "Ágil" }], "movil agil"),
    ).toHaveLength(1);
  });
  it("trata los precios vacíos como no disponibles y preserva el cero", () => {
    expect(formatPrice("")).toBe("Precio no disponible");
    expect(formatPrice(null)).toBe("Precio no disponible");
    expect(formatPrice("abc")).toBe("Precio no disponible");
    expect(formatPrice(-1)).toBe("Precio no disponible");
    expect(formatPrice(0)).toContain("0,00");
    expect(formatPrice("120")).toContain("120,00");
    expect(formatPrice("   ")).toBe("Precio no disponible");
    expect(formatPrice(false)).toBe("Precio no disponible");
    expect(formatPrice([])).toBe("Precio no disponible");
    expect(formatPrice(" 120 ")).toContain("120,00");
  });
  it("normaliza las erratas del servicio y conserva códigos reales", () => {
    const result = normalizeProduct(detail);
    expect(result.dimensions).toBe(detail.dimentions);
    expect(result.secondaryCamera).toEqual(["5 MP"]);
    expect(result.screenResolution).toBe("720 x 1280 pixels");
    expect(result.colors[0].code).toBe(1000);
    expect(normalizeProduct({}).storages).toEqual([]);
  });
  it("presenta atributos compuestos y ausentes sin imprimir undefined", () => {
    expect(formatSpec(["13 MP", "autofocus"])).toBe("13 MP · autofocus");
    expect(formatSpec(undefined)).toBe("No disponible");
    expect(formatSpec([])).toBe("No disponible");
  });
});
