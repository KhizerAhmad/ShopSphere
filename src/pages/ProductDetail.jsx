import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { fetchProductById, fetchRelatedProducts } from '../lib/products'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { FALLBACK_IMAGE } from '../lib/fallbackImage'
import ProductCard from '../components/ProductCard'
import './ProductDetail.css'

export default function ProductDetail() {
  const { id } = useParams()
  const [product, setProduct] = useState(null)
  const [related, setRelated] = useState([])
  const [quantity, setQuantity] = useState(1)
  const [activeTab, setActiveTab] = useState('description')
  const [loading, setLoading] = useState(true)
  const [showFullDescription, setShowFullDescription] = useState(false)

  const { addToCart } = useCart()
  const { user } = useAuth()
  const { showToast } = useToast()

  useEffect(() => {
    async function load() {
      setLoading(true)
      const { data } = await fetchProductById(id)
      setProduct(data)
      setQuantity(1)
      if (data?.category_id) {
        const { data: relatedData } = await fetchRelatedProducts(data.category_id, data.id)
        setRelated(relatedData)
      }
      setLoading(false)
    }
    load()
  }, [id])

  async function handleAddToCart() {
    if (!user) {
      showToast('Please log in to add items to your cart', 'error')
      return
    }
    const { error } = await addToCart(product.id, quantity)
    showToast(error ? 'Could not add to cart' : `Added ${quantity} × "${product.name}" to cart`, error ? 'error' : 'success')
  }

  async function handleRelatedAdd(p) {
    if (!user) {
      showToast('Please log in to add items to your cart', 'error')
      return
    }
    const { error } = await addToCart(p.id, 1)
    showToast(error ? 'Could not add to cart' : `Added "${p.name}" to cart`, error ? 'error' : 'success')
  }

  if (loading) return <div className="container detail__loading">Loading...</div>
  if (!product) return <div className="container detail__loading">Product not found.</div>

  const hasDiscount = product.compare_at_price && product.compare_at_price > product.price

  return (
    <div className="container detail">
      <div className="detail__breadcrumb">
        <Link to="/">Home</Link> / <Link to="/products">{product.category?.name || 'Products'}</Link> / <span>{product.name}</span>
      </div>

      {/* ---------- Mobile-only layout (Image 7) ---------- */}
      {/* <div className="detail__mobile-header">
        <button className="detail__mobile-back" onClick={() => window.history.back()} aria-label="Go back">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M15 19l-7-7 7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <div className="detail__mobile-header-icons">
          <Link to="/cart" aria-label="Cart">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M3 3h2l.4 2M7 13h10l3-8H6.4M7 13L5.4 5M7 13l-1.7 5h12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              <circle cx="9" cy="20" r="1.2" fill="currentColor" />
              <circle cx="17" cy="20" r="1.2" fill="currentColor" />
            </svg>
          </Link>
        </div>
      </div> */}

      <div className="detail__mobile-image">
        <img
          src={product.image_url}
          alt={product.name}
          onError={(e) => {
            e.currentTarget.onerror = null
            e.currentTarget.src = FALLBACK_IMAGE
          }}
        />
        <button className="detail__mobile-image-arrow detail__mobile-image-arrow--left" aria-label="Previous image" disabled>
          ‹
        </button>
        <button className="detail__mobile-image-arrow detail__mobile-image-arrow--right" aria-label="Next image" disabled>
          ›
        </button>
      </div>

      <div className="detail__mobile-body">
        <div className="detail__mobile-meta">
          <span className="detail__mobile-rating">
            {'★'.repeat(Math.round(product.rating || 0))}
            <span className="detail__mobile-rating-faint">{'★'.repeat(5 - Math.round(product.rating || 0))}</span>
          </span>
          <span className="detail__mobile-dot">•</span>
          <span>{Math.floor((product.rating || 4) * 7)} reviews</span>
          <span className="detail__mobile-dot">•</span>
          <span>{product.stock * 3 + 12} sold</span>
        </div>

        <h1 className="detail__mobile-name">{product.name}</h1>

        <div className="detail__mobile-price-row">
          <span className="detail__mobile-price">${Number(product.price).toFixed(2)}</span>
        </div>

        <div className="detail__mobile-actions">
          <button className="detail__mobile-inquiry-btn" onClick={handleAddToCart} disabled={product.stock <= 0}>
            {product.stock > 0 ? 'Add to cart' : 'Out of stock'}
          </button>
          <button className="detail__mobile-fav-btn" aria-label="Save for later">♡</button>
        </div>

        <dl className="detail__mobile-specs">
          <div>
            <dt>Condition</dt>
            <dd>Brand new</dd>
          </div>
          {product.brand && (
            <div>
              <dt>Brand</dt>
              <dd>{product.brand}</dd>
            </div>
          )}
          <div>
            <dt>Category</dt>
            <dd>{product.category?.name || '—'}</dd>
          </div>
          <div>
            <dt>Item num</dt>
            <dd>{product.id.slice(0, 8).toUpperCase()}</dd>
          </div>
        </dl>

        <div className="detail__mobile-description">
          <p className={showFullDescription ? '' : 'detail__mobile-description-clamped'}>
            {product.description || 'No description provided for this product yet.'}
          </p>
          {product.description && product.description.length > 80 && (
            <button onClick={() => setShowFullDescription((v) => !v)}>
              {showFullDescription ? 'Show less' : 'Read more'}
            </button>
          )}
        </div>

        <div className="detail__mobile-supplier">
          <span className="detail__mobile-supplier-avatar">{(product.brand || 'B')[0]}</span>
          <div className="detail__mobile-supplier-info">
            <span className="detail__mobile-supplier-label">Sold by</span>
            <span className="detail__mobile-supplier-name">{product.brand || 'Brand'} Official Store</span>
          </div>
          <span className="detail__mobile-supplier-chevron">›</span>
        </div>

        {related.length > 0 && (
          <div className="detail__mobile-similar">
            <h2>Similar products</h2>
            <div className="detail__mobile-similar-scroll">
              {related.map((p) => (
                <Link to={`/products/${p.id}`} key={p.id} className="detail__mobile-similar-card">
                  <img src={p.image_url} alt={p.name} />
                  <span>${Number(p.price).toFixed(2)}</span>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ---------- Desktop layout ---------- */}
      <div className="detail__top">
        <div className="detail__image">
          <img
            src={product.image_url}
            alt={product.name}
            onError={(e) => {
              e.currentTarget.onerror = null
              e.currentTarget.src = FALLBACK_IMAGE
            }}
          />
        </div>

        <div className="detail__info">
          <span className={product.stock > 0 ? 'detail__stock detail__stock--in' : 'detail__stock detail__stock--out'}>
            {product.stock > 0 ? '✓ In stock' : '✕ Out of stock'}
          </span>
          <h1>{product.name}</h1>
          <div className="detail__rating">
            <span className="detail__stars">{'★'.repeat(Math.round(product.rating || 0))}</span>
            <span>{product.rating} rating</span>
          </div>

          <div className="detail__price-box">
            <span className="detail__price">${Number(product.price).toFixed(2)}</span>
            {hasDiscount && <span className="detail__compare-price">${Number(product.compare_at_price).toFixed(2)}</span>}
          </div>

          <dl className="detail__specs">
            <div>
              <dt>Category</dt>
              <dd>{product.category?.name || '—'}</dd>
            </div>
            {product.brand && (
              <div>
                <dt>Brand</dt>
                <dd>{product.brand}</dd>
              </div>
            )}
            <div>
              <dt>Availability</dt>
              <dd>{product.stock} units left</dd>
            </div>
          </dl>

          {product.features?.length > 0 && (
            <ul className="detail__feature-tags">
              {product.features.map((f) => (
                <li key={f}>{f}</li>
              ))}
            </ul>
          )}

          <div className="detail__purchase-row">
            <div className="detail__qty">
              <button onClick={() => setQuantity((q) => Math.max(1, q - 1))} aria-label="Decrease quantity">−</button>
              <span>{quantity}</span>
              <button onClick={() => setQuantity((q) => Math.min(product.stock || 99, q + 1))} aria-label="Increase quantity">+</button>
            </div>
            <button className="detail__add-btn" onClick={handleAddToCart} disabled={product.stock <= 0}>
              {product.stock > 0 ? 'Add to cart' : 'Out of stock'}
            </button>
          </div>
        </div>
      </div>

      <div className="detail__tabs">
        <div className="detail__tab-headers">
          {['description', 'shipping'].map((tab) => (
            <button
              key={tab}
              className={activeTab === tab ? 'is-active' : ''}
              onClick={() => setActiveTab(tab)}
            >
              {tab === 'description' ? 'Description' : 'Shipping & Returns'}
            </button>
          ))}
        </div>
        <div className="detail__tab-content">
          {activeTab === 'description' ? (
            <p>{product.description || 'No description provided for this product yet.'}</p>
          ) : (
            <p>Standard shipping takes 3–7 business days. Returns are accepted within 30 days of delivery in original condition.</p>
          )}
        </div>
      </div>

      {related.length > 0 && (
        <section className="detail__related">
          <h2>You may also like</h2>
          <div className="detail__related-grid">
            {related.map((p) => (
              <ProductCard key={p.id} product={p} onAddToCart={handleRelatedAdd} />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}