export const isProduct = (value) =>
  Boolean(
    value &&
    typeof value.id === "string" &&
    typeof value.brand === "string" &&
    typeof value.model === "string",
  );
export const isCatalog = (value) =>
  Array.isArray(value) && value.every(isProduct);

export function normalizeProduct(raw) {
  return {
    ...raw,
    dimensions: raw.dimensions || raw.dimentions,
    secondaryCamera: raw.secondaryCamera || raw.secondaryCmera,
    // The API names these fields in reverse: displaySize contains the pixel resolution.
    screenResolution: raw.displaySize,
    screenSize: raw.displayResolution,
    colors: validOptions(raw.options?.colors),
    storages: validOptions(raw.options?.storages),
  };
}

function validOptions(options) {
  return Array.isArray(options)
    ? options.filter(
        (item) =>
          item &&
          (typeof item.code === "number" || typeof item.code === "string") &&
          typeof item.name === "string",
      )
    : [];
}

export function formatPrice(value) {
  const price = typeof value === "string" ? value.trim() : value;
  if (
    (typeof price !== "string" && typeof price !== "number") ||
    price === "" ||
    !Number.isFinite(Number(price)) ||
    Number(price) < 0
  )
    return "Precio no disponible";
  return new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 2,
  }).format(Number(price));
}

export function filterProducts(products, query) {
  const normalize = (text) =>
    text
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase();
  const words = normalize(query.trim()).split(/\s+/);
  return products.filter((product) =>
    words.every((word) =>
      normalize(`${product.brand} ${product.model}`).includes(word),
    ),
  );
}

export function formatSpec(value) {
  if (Array.isArray(value))
    return value.filter(Boolean).join(" · ") || "No disponible";
  return value || "No disponible";
}
