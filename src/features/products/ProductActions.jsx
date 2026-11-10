import { useState } from "react";
import { useCart } from "../cart/CartContext";
import { ArrowIcon } from "../../components/Icons";

export function ProductActions({ product }) {
  const [color, setColor] = useState(
    product.colors.length === 1 ? String(product.colors[0].code) : "",
  );
  const [storage, setStorage] = useState(
    product.storages.length === 1 ? String(product.storages[0].code) : "",
  );
  const [feedback, setFeedback] = useState(null);
  const { pending, add } = useCart();
  const available = product.colors.length > 0 && product.storages.length > 0;

  async function submit(event) {
    event.preventDefault();
    const selectedColor = product.colors.find(
      (option) => String(option.code) === color,
    );
    const selectedStorage = product.storages.find(
      (option) => String(option.code) === storage,
    );
    if (!selectedColor || !selectedStorage || pending) return;
    setFeedback(null);
    try {
      const added = await add({
        id: product.id,
        colorCode: selectedColor.code,
        storageCode: selectedStorage.code,
      });
      if (added)
        setFeedback({
          success: true,
          message: "Dispositivo añadido a tu bolsa.",
        });
    } catch (error) {
      setFeedback({ success: false, message: error.message });
    }
  }

  return (
    <form className="product-actions" onSubmit={submit}>
      <div className="selection-fields">
        {[
          {
            id: "storage",
            label: "Almacenamiento",
            options: product.storages,
            value: storage,
            set: setStorage,
          },
          {
            id: "color",
            label: "Color",
            options: product.colors,
            value: color,
            set: setColor,
          },
        ].map((field) => (
          <div key={field.id} className="select-field">
            <label htmlFor={field.id}>{field.label}</label>
            <select
              id={field.id}
              value={field.value}
              required
              disabled={pending || !field.options.length}
              onChange={(event) => {
                field.set(event.target.value);
                setFeedback(null);
              }}
            >
              {field.options.length !== 1 && (
                <option value="">
                  {field.options.length ? "Seleccionar" : "No disponible"}
                </option>
              )}
              {field.options.map((option) => (
                <option key={option.code} value={String(option.code)}>
                  {option.name}
                </option>
              ))}
            </select>
          </div>
        ))}
      </div>
      <button
        className="button add-button"
        type="submit"
        disabled={!available || !color || !storage || pending}
      >
        {pending ? "Añadiendo…" : "Añadir a la bolsa"}
        <ArrowIcon />
      </button>
      {!available && (
        <p className="action-note">
          Este dispositivo no tiene opciones de compra disponibles.
        </p>
      )}
      {feedback && (
        <p
          className={`action-feedback ${feedback.success ? "success" : "error"}`}
          role={feedback.success ? "status" : "alert"}
        >
          {feedback.message}
        </p>
      )}
      <p className="action-note">Elige tus opciones y hazlo tuyo.</p>
    </form>
  );
}
