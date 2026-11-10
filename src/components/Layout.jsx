import { useEffect, useRef } from "react";
import { Link, Outlet, useLocation, useMatch } from "react-router";
import { useCart } from "../features/cart/CartContext";
import { BagIcon } from "./Icons";

export function Layout() {
  const { count } = useCart();
  const location = useLocation();
  const isDetail = useMatch("/products/:id");
  const main = useRef(null);
  const previousPath = useRef(location.pathname);
  useEffect(() => {
    if (previousPath.current !== location.pathname) {
      main.current?.focus();
      window.scrollTo(0, 0);
      previousPath.current = location.pathname;
    }
  }, [location.pathname]);

  return (
    <>
      <a className="skip-link" href="#main">
        Saltar al contenido
      </a>
      <header>
        <div className="topline">
          <span>Una selección. Tu próxima conexión.</span>
          <span>DISPOSITIVOS / EDICIÓN 01</span>
        </div>
        <div className="header">
          <Link
            to="/"
            className="wordmark"
            aria-label="HANNA TIENDA ONLINE, inicio"
          >
            HANNA <span>TIENDA ONLINE</span>
            <span className="brand-dot" aria-hidden="true">
              ®
            </span>
          </Link>
          <nav aria-label="Ruta de navegación" className="breadcrumbs">
            <Link
              to="/"
              aria-current={location.pathname === "/" ? "page" : undefined}
            >
              Dispositivos
            </Link>
            {isDetail && (
              <>
                <span aria-hidden="true">/</span>
                <span aria-current="page">Detalle</span>
              </>
            )}
          </nav>
          <div className="cart-count" aria-live="polite" aria-atomic="true">
            <BagIcon />
            <span>Tu bolsa</span>
            <span
              className="count"
              aria-label={`${count} productos en la bolsa`}
            >
              {count}
            </span>
          </div>
        </div>
      </header>
      <main id="main" ref={main} tabIndex="-1">
        <Outlet />
      </main>
      <footer className="footer">
        <Link to="/" className="footer-brand">
          Hanna | Tienda online
        </Link>
        <p>Tecnología para tu día a día.</p>
        <span>PROYECTO DE PRUEBA · 2026</span>
      </footer>
    </>
  );
}
