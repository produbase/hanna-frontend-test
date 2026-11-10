import { useEffect, useMemo } from "react";
import { Link, useSearchParams } from "react-router";
import { api } from "../../lib/api";
import { useResource } from "../../lib/useResource";
import { filterProducts, formatPrice } from "./model";
import { ArrowIcon, SearchIcon } from "../../components/Icons";
import { ProductImage } from "../../components/ProductImage";
import { Feedback, Loading } from "../../components/Feedback";

export function CatalogPage() {
  const [params, setParams] = useSearchParams();
  const query = params.get("q") || "";
  const { data, loading, error, retry } = useResource(
    "catalog",
    api.listProducts,
  );
  const products = useMemo(
    () => filterProducts(data || [], query),
    [data, query],
  );
  useEffect(() => {
    document.title = "Hanna | Tienda online";
  }, []);
  function search(value) {
    const next = new URLSearchParams(params);
    if (value) next.set("q", value);
    else next.delete("q");
    setParams(next, { replace: true });
  }

  return (
    <div className="catalog page-shell">
      <section className="catalog-intro">
        <div>
          <p className="eyebrow">
            <span className="small-dot" /> LA COLECCIÓN
          </p>
          <h1>
            Conecta con
            <br /> <span>lo que importa.</span>
          </h1>
        </div>
        <div className="intro-note">
          <span className="editorial-index">01 / DISPOSITIVOS</span>
          <p>
            Diseño, rendimiento y posibilidades.
            <br />
            Encuentra el dispositivo que va contigo.
          </p>
          <a href="#collection" className="text-link">
            Explorar la colección <ArrowIcon />
          </a>
        </div>
      </section>
      <section
        id="collection"
        aria-label="Catálogo de dispositivos"
        className="collection"
      >
        <div className="collection-toolbar">
          <div className="collection-heading">
            <h2>Todos los dispositivos</h2>
            <span aria-live="polite" role="status">
              {loading
                ? "Cargando…"
                : `${products.length} ${products.length === 1 ? "dispositivo" : "dispositivos"}`}
            </span>
          </div>
          <div className="search">
            <SearchIcon />
            <label htmlFor="product-search" className="sr-only">
              Buscar por marca o modelo
            </label>
            <input
              id="product-search"
              type="search"
              placeholder="Buscar por marca o modelo"
              value={query}
              onChange={(event) => search(event.target.value)}
            />
            {query && (
              <button aria-label="Limpiar búsqueda" onClick={() => search("")}>
                ×
              </button>
            )}
          </div>
        </div>
        {loading ? (
          <Loading />
        ) : error ? (
          <Feedback
            title="No pudimos cargar la colección"
            message={error.message}
            retry={retry}
          />
        ) : products.length === 0 ? (
          <div className="empty-state">
            <SearchIcon />
            <h2>
              {query
                ? "No encontramos coincidencias"
                : "La colección estará disponible pronto"}
            </h2>
            <p>
              {query
                ? `Prueba con otra marca o modelo. Tu búsqueda: “${query}”.`
                : "Todavía no hay dispositivos en el catálogo."}
            </p>
            {query && (
              <button
                className="button button-light"
                onClick={() => search("")}
              >
                Ver todos los dispositivos
              </button>
            )}
          </div>
        ) : (
          <ul className="product-grid">
            {products.map((product, index) => (
              <li key={product.id}>
                <Link
                  className="product-card"
                  to={`/products/${product.id}`}
                  state={{ catalogSearch: params.toString() }}
                >
                  <div className="card-visual">
                    <span className="card-number">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <ProductImage product={product} eager={index < 4} />
                    <span className="card-arrow">
                      <ArrowIcon />
                    </span>
                  </div>
                  <div className="card-info">
                    <p className="product-brand">{product.brand}</p>
                    <h3>{product.model}</h3>
                    <p className="product-price">
                      {formatPrice(product.price)}
                    </p>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
      <div className="catalog-end">
        <span className="small-dot" />
        <p>Lo esencial, bien elegido.</p>
        <span>HANNA / 01</span>
      </div>
    </div>
  );
}
