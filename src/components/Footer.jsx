import { Link } from 'react-router-dom'
import './Footer.css'
import { ShoppingBag } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="container site-footer__newsletter">
        <h3>Subscribe to our newsletter</h3>
        <p>Get updates on new arrivals and offers, straight to your inbox.</p>

        <form
          className="site-footer__form"
          onSubmit={(e) => {
            e.preventDefault()
            e.target.reset()
          }}
        >
          <input
            type="email"
            placeholder="Email address"
            required
            aria-label="Email address"
          />
          <button type="submit">Subscribe</button>
        </form>
      </div>

      <div className="container site-footer__columns">
        <div className="site-footer__brand">
          <Link to="/" className="site-footer__logo">
            <span className="site-footer__logo-badge"><ShoppingBag size={18} color="#fff" /></span>
            <span>Brand</span>
          </Link>

          <p>
            Brand, Provides the best service all around the world.
          </p>

          <div className="site-footer__socials">
            <a href="#" aria-label="Facebook">
              <i className="fab fa-facebook-f"></i>
            </a>

            <a href="#" aria-label="Twitter">
              <i className="fab fa-twitter"></i>
            </a>

            <a href="#" aria-label="LinkedIn">
              <i className="fab fa-linkedin-in"></i>
            </a>

            <a href="#" aria-label="Instagram">
              <i className="fab fa-instagram"></i>
            </a>

            <a href="#" aria-label="YouTube">
              <i className="fab fa-youtube"></i>
            </a>
          </div>
        </div>

        <div className="site-footer__col">
          <h4>About</h4>
          <Link to="/products">About Us</Link>
          <Link to="/products">Find store</Link>
          <Link to="/products">Categories</Link>
          <Link to="/help">Blogs</Link>
        </div>

        <div className="site-footer__col">
          <h4>Partnership</h4>
          <Link to="/products">About Us</Link>
          <Link to="/products">Find store</Link>
          <Link to="/products">Categories</Link>
          <Link to="/help">Blogs</Link>
        </div>

        <div className="site-footer__col">
          <h4>Information</h4>
          <Link to="/help">Help Center</Link>
          <Link to="/help">Money Refund</Link>
          <Link to="/help">Shipping</Link>
          <Link to="/help">Contact us</Link>
        </div>
      </div>

      <div className="container site-footer__bottom">
        <span>© {new Date().getFullYear()} Ecommerce.</span>
        <div className="site-footer__locale">
          <img src="https://th.bing.com/th/id/OIP.o6qGMJjK3eeBHQYMGaV3pQHaEC?w=247&h=150&c=6&o=7&pid=1.7&rm=3" alt="US-flag" width={"15px"}/>
          English
        </div>
      </div>
    </footer>
  )
}