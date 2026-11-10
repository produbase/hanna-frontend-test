import { useState } from "react";

export function ProductImage({ product, eager = false }) {
  const [failed, setFailed] = useState(false);
  return (
    <div className="product-image">
      {failed || !product.imgUrl ? (
        <span className="image-fallback">Imagen no disponible</span>
      ) : (
        <img
          src={product.imgUrl}
          alt={`${product.brand} ${product.model}`}
          loading={eager ? "eager" : "lazy"}
          onError={() => setFailed(true)}
          width="260"
          height="320"
        />
      )}
    </div>
  );
}
