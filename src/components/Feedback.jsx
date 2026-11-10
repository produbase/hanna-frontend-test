export function Feedback({ title, message, retry }) {
  return <section className="feedback" role="alert">
    <span className="eyebrow">Un momento</span><h2>{title}</h2><p>{message}</p>
    {retry && <button className="button" onClick={retry}>Volver a intentar</button>}
  </section>;
}

export function Loading({ detail = false }) {
  return <div role="status" aria-label="Cargando productos" className={detail ? 'detail-skeleton' : 'product-grid loading-grid'}>
    {Array.from({ length: detail ? 2 : 8 }, (_, index) => <div key={index} className="skeleton" aria-hidden="true" />)}
    <span className="sr-only">Cargando productos…</span>
  </div>;
}
