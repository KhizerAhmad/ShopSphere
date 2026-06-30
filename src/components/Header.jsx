import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'
import { fetchCategories } from '../lib/products'
import './Header.css'
import { ShoppingBag } from 'lucide-react'

// Routes that get a slim back-arrow header on mobile instead of the full
// logo/search/category-pill header (avoids the double-header stacking issue).
function isCompactRoute(pathname) {
  return pathname === '/cart' || pathname === '/products' || pathname.startsWith('/products/') || pathname.startsWith('/checkout')
}

function compactTitle(pathname, search) {
  if (pathname === '/cart') return 'Shopping cart'
  if (pathname === '/checkout') return 'Checkout'
  if (pathname.startsWith('/products/')) return 'Product'
  if (pathname === '/products') {
    const params = new URLSearchParams(search)
    if (params.get('featured') === 'true') return 'Hot Offers'
    return 'All products'
  }
  return ''
}

export default function Header() {
  const [query, setQuery] = useState('')
  const [categorySlug, setCategorySlug] = useState('')
  const [categories, setCategories] = useState([])
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()
  const { user, profile, isAdmin, signOut } = useAuth()
  const { itemCount } = useCart()
  const profileRef = useRef(null)
  const compact = isCompactRoute(location.pathname)
  const title = compactTitle(location.pathname, location.search)

  useEffect(() => {
    fetchCategories().then((res) => setCategories(res.data))
  }, [])

  useEffect(() => {
    function onClickOutside(e) {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileOpen(false)
      }
    }
    document.addEventListener('click', onClickOutside)
    return () => document.removeEventListener('click', onClickOutside)
  }, [])

  useEffect(() => {
    document.body.style.overflow = drawerOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [drawerOpen])

  function handleSearch(e) {
    e.preventDefault()
    const params = new URLSearchParams()
    if (query.trim()) params.set('search', query.trim())
    if (categorySlug) params.set('category', categorySlug)
    navigate(`/products${params.toString() ? `?${params.toString()}` : ''}`)
  }

  async function handleSignOut() {
    await signOut()
    setProfileOpen(false)
    setDrawerOpen(false)
    navigate('/')
  }

  return (
    <header className="site-header" data-compact={compact ? 'true' : 'false'}>
      <div className="site-header__compact-row container">
        <button onClick={() => navigate(-1)} aria-label="Go back">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M15 19l-7-7 7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <span className="site-header__compact-title">{title}</span>
        <div className="site-header__compact-actions">
          <div className="site-header__profile" ref={profileRef}>
            <button
              onClick={() => setProfileOpen((v) => !v)}
              aria-haspopup="true"
              aria-expanded={profileOpen}
              aria-label="Account"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="1.8" />
                <path d="M4 20c0-3.3 3.6-6 8-6s8 2.7 8 6" stroke="currentColor" strokeWidth="1.8" />
              </svg>
            </button>
            {profileOpen && (
              <div className="site-header__dropdown">
                {user ? (
                  <>
                    <span className="site-header__dropdown-name">{profile?.full_name || user.email}</span>
                    <Link to="/orders" onClick={() => setProfileOpen(false)}>My Orders</Link>
                    {isAdmin && <Link to="/admin" onClick={() => setProfileOpen(false)}>Admin Panel</Link>}
                    <button onClick={handleSignOut}>Log out</button>
                  </>
                ) : (
                  <>
                    <Link to="/login" onClick={() => setProfileOpen(false)}>Log in</Link>
                    <Link to="/signup" onClick={() => setProfileOpen(false)}>Sign up</Link>
                  </>
                )}
              </div>
            )}
          </div>
          <Link to="/cart" className="site-header__cart" aria-label="Cart">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M3 3h2l.4 2M7 13h10l3-8H6.4M7 13L5.4 5M7 13l-1.7 5h12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              <circle cx="9" cy="20" r="1.2" fill="currentColor" />
              <circle cx="17" cy="20" r="1.2" fill="currentColor" />
            </svg>
            {itemCount > 0 && <span className="site-header__cart-badge">{itemCount}</span>}
          </Link>
        </div>
      </div>

      <div className="container site-header__row">
        <button
          className="site-header__hamburger"
          aria-label="Open menu"
          onClick={() => setDrawerOpen(true)}
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
            <path d="M3 6h18M3 12h18M3 18h18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </button>

        <Link to="/" className="site-header__logo">
          <span className="site-header__logo-badge"><ShoppingBag size={18} color="#fff" /></span>
          <span>Brand</span>
        </Link>

        <form className="site-header__search" onSubmit={handleSearch}>
          <input
            type="search"
            placeholder="Search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-label="Search products"
          />
          <select
            value={categorySlug}
            onChange={(e) => setCategorySlug(e.target.value)}
            aria-label="Filter by category"
            className="site-header__search-category"
          >
            <option value="">All category</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.slug}>{cat.name}</option>
            ))}
          </select>
          <button type="submit">Search</button>
        </form>

        <nav className="site-header__actions">
          <div className="site-header__profile" ref={profileRef}>
            <button
              className="site-header__action"
              onClick={() => setProfileOpen((v) => !v)}
              aria-haspopup="true"
              aria-expanded={profileOpen}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="1.8" />
                <path d="M4 20c0-3.3 3.6-6 8-6s8 2.7 8 6" stroke="currentColor" strokeWidth="1.8" />
              </svg>
              <span className="site-header__action-label">{user ? 'Profile' : 'Sign in'}</span>
            </button>

            {profileOpen && (
              <div className="site-header__dropdown">
                {user ? (
                  <>
                    <span className="site-header__dropdown-name">{profile?.full_name || user.email}</span>
                    <Link to="/orders" onClick={() => setProfileOpen(false)}>My Orders</Link>
                    {isAdmin && <Link to="/admin" onClick={() => setProfileOpen(false)}>Admin Panel</Link>}
                    <button onClick={handleSignOut}>Log out</button>
                  </>
                ) : (
                  <>
                    <Link to="/login" onClick={() => setProfileOpen(false)}>Log in</Link>
                    <Link to="/signup" onClick={() => setProfileOpen(false)}>Sign up</Link>
                  </>
                )}
              </div>
            )}
          </div>

          <Link to="/cart" className="site-header__action site-header__cart">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
              <path d="M3 3h2l.4 2M7 13h10l3-8H6.4M7 13L5.4 5M7 13l-1.7 5h12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              <circle cx="9" cy="20" r="1.2" fill="currentColor" />
              <circle cx="17" cy="20" r="1.2" fill="currentColor" />
            </svg>
            <span className="site-header__action-label">My cart</span>
            {itemCount > 0 && <span className="site-header__cart-badge">{itemCount}</span>}
          </Link>
        </nav>
      </div>

      <form className="site-header__search site-header__search--mobile container" onSubmit={handleSearch}>
        <input
          type="search"
          placeholder="Search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          aria-label="Search products"
        />
        <button type="submit" aria-label="Search">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" />
            <path d="M21 21l-4.3-4.3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </button>
      </form>

      <div className="site-header__pillnav container">
        <Link to="/products">All category</Link>
        <Link to="/products?category=electronics">Gadgets</Link>
        <Link to="/products?category=clothing">Clothes</Link>
        <Link to="/products?category=accessories">Accessories</Link>
        <Link to="/products?category=home-outdoor">Home</Link>
      </div>

      <div className="site-header__subnav container">
        <div className="site-header__subnav-left">
          <Link to="/products?featured=true">Hot offers</Link>
          <Link to="/products?category=accessories">Gift boxes</Link>
          <Link to="/products">Products</Link>
          <Link to="/products?category=home-outdoor">Menu item</Link>
          <Link to="/help">Help</Link>
        </div>
        <div className="site-header__subnav-right">
          <select
            className="site-header__locale-select"
            defaultValue="en-usd"
            aria-label="Language and Currency"
          >
            <option value="en-usd">English, USD</option>
            <option value="en-gbp">English, GBP</option>
            <option value="ur-pkr">Urdu, PKR</option>
            <option value="en-aud">English, AUD</option>
            <option value="ar-aed">Arabic, AED</option>
            <option value="en-cad">English, CAD</option>
          </select>

          <select
            className="site-header__locale-select"
            defaultValue="de"
            aria-label="Ship To"
          >
            <option value="de">Ship to DE </option>
            <option value="us">Ship to US</option>
            <option value="gb">Ship to GB</option>
            <option value="pk">Ship to PK</option>
            <option value="au">Ship to AU</option>
            <option value="ae">Ship to AE</option>
            <option value="ca">Ship to CA</option>
          </select>
        </div>
      </div>

      {drawerOpen && (
        <div className="site-drawer-backdrop" onClick={() => setDrawerOpen(false)}>
          <aside className="site-drawer" onClick={(e) => e.stopPropagation()}>
            <div className="site-drawer__top">
              <div className="site-drawer__avatar" />
              <div className="site-drawer__top-text">
                {user ? (
                  <span>{profile?.full_name || user.email}</span>
                ) : (
                  <span>
                    <Link to="/login" onClick={() => setDrawerOpen(false)}>Sign in</Link>
                    {' | '}
                    <Link to="/signup" onClick={() => setDrawerOpen(false)}>Register</Link>
                  </span>
                )}
              </div>
              <button className="site-drawer__close" onClick={() => setDrawerOpen(false)} aria-label="Close menu">
                ×
              </button>
            </div>

            <nav className="site-drawer__section">
              <Link to="/" onClick={() => setDrawerOpen(false)}>
                <DrawerIcon path="M3 11l9-8 9 8M5 10v10h14V10" /> Home
              </Link>
              <Link to="/products" onClick={() => setDrawerOpen(false)}>
                <DrawerIcon path="M4 6h16M4 12h16M4 18h16" /> Categories
              </Link>
              <Link to="/cart" onClick={() => setDrawerOpen(false)}>
                <DrawerIcon path="M5 8h14l-1.5 9.5a2 2 0 0 1-2 1.5H8.5a2 2 0 0 1-2-1.5L5 8ZM9 8V6a3 3 0 0 1 6 0v2" /> Favorites
              </Link>
              <Link to="/orders" onClick={() => setDrawerOpen(false)}>
                <DrawerIcon path="M4 7h16v12H4V7Zm0 0 2-3h12l2 3" /> My orders
              </Link>
            </nav>

            <nav className="site-drawer__section">
              <span className="site-drawer__static">
                <DrawerIcon path="M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Zm-9-9h18M12 3a13 13 0 0 1 0 18 13 13 0 0 1 0-18Z" />
                English | USD
              </span>
              <Link to="/help" onClick={() => setDrawerOpen(false)}>
                <DrawerIcon path="M12 18.5a8.5 8.5 0 1 1 6-2.5l1 4-4-1a8.4 8.4 0 0 1-3 .5Z" /> Contact us
              </Link>
              <Link to="/help" onClick={() => setDrawerOpen(false)}>
                <DrawerIcon path="M4 21V9l8-5 8 5v12M9 21v-6h6v6" /> About
              </Link>
            </nav>

            <nav className="site-drawer__section site-drawer__section--muted">
              <Link to="/help" onClick={() => setDrawerOpen(false)}>User agreement</Link>
              <Link to="/help" onClick={() => setDrawerOpen(false)}>Partnership</Link>
              <Link to="/help" onClick={() => setDrawerOpen(false)}>Privacy policy</Link>
            </nav>

            {user && (
              <button className="site-drawer__logout" onClick={handleSignOut}>
                Log out
              </button>
            )}
          </aside>
        </div>
      )}
    </header>
  )
}

function DrawerIcon({ path }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <path d={path} stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}