import { useCallback, useEffect } from 'react';
import { Link, useLocation, useParams } from 'react-router';
import { api } from '../../lib/api';
import { useResource } from '../../lib/useResource';
import { ArrowIcon } from '../../components/Icons';
import { Feedback, Loading } from '../../components/Feedback';
import { ProductImage } from '../../components/ProductImage';
import { ProductActions } from './ProductActions';
import { formatPrice, formatSpec } from './model';

const specs = [
  ['Marca', 'brand'], ['Modelo', 'model'], ['Procesador', 'cpu'], ['Memoria RAM', 'ram'],
  ['Sistema operativo', 'os'], ['Resolución de pantalla', 'screenResolution'], ['Pantalla', 'screenSize'],
  ['Batería', 'battery'], ['Cámara principal', 'primaryCamera'], ['Cámara frontal', 'secondaryCamera'],
  ['Dimensiones', 'dimensions'], ['Peso', 'weight'],
];

export function ProductPage() {
  const { id } = useParams();
  const location = useLocation();
  const load = useCallback(() => api.getProduct(id), [id]);
  const { data: product, error, loading, retry } = useResource(id, load);
  const returnTo = location.state?.catalogSearch ? `/?${location.state.catalogSearch}` : '/';
  useEffect(() => { document.title = product ? `${product.brand} ${product.model} — ATELIER MOBILE` : 'Detalle — ATELIER MOBILE'; }, [product]);

  return <div className="detail page-shell"><Link to={returnTo} className="back-link"><ArrowIcon back />Volver a dispositivos</Link>
    {loading ? <Loading detail /> : error ? <Feedback title="No pudimos abrir este dispositivo" message={error.message} retry={retry} /> :
      <article className="product-detail">
        <div className="detail-visual"><div className="detail-visual-label"><span className="eyebrow">LA COLECCIÓN</span><span>ATELIER / 01</span></div><ProductImage key={product.id} product={product} eager /><span className="image-caption">{product.brand} / {product.model}</span></div>
        <div className="detail-content"><p className="eyebrow">{product.brand}</p><h1>{product.model}</h1><p className="detail-price">{formatPrice(product.price)}</p>
          <ProductActions key={product.id} product={product} />
          <section className="specifications" aria-labelledby="specs-title"><div className="spec-heading"><h2 id="specs-title">En detalle</h2><span>ESPECIFICACIONES</span></div><dl>{specs.map(([label, field]) => <div className="spec-row" key={field}><dt>{label}</dt><dd>{formatSpec(product[field])}{field === 'weight' && product[field] && /^\d+(\.\d+)?$/.test(String(product[field])) ? ' g' : ''}</dd></div>)}</dl></section>
        </div>
      </article>}
  </div>;
}
