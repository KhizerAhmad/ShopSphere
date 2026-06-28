# ShopSphere 🛍️ — Fullstack E-Commerce (React + Supabase)

A complete eCommerce storefront — home page, product listing with filters, product details, cart, auth, order history, and a full admin panel. Built with React (Vite) on the frontend and Supabase as the entire backend.

There's no separate Node/Express server here. Supabase **is** the backend — the React app talks to it directly via `@supabase/supabase-js`, and Postgres Row Level Security (RLS) policies control exactly what each user or admin is allowed to do at the database level.

---

## What it does

**Storefront**
- Home page with hero banner, category rail, featured deals, recommended products, and shipping info
- Product listing with category filters, brand/feature checkboxes, price range slider, sorting, grid/list toggle, and search
- Product detail pages with images, tags, pricing (with discount support), quantity selector, and related products
- Full cart — quantity controls, remove, save for later, coupon codes (`SAVE10` works as a demo), order summary with tax + shipping
- Fully responsive across every page

**Auth**
- Email/password sign up and login via Supabase Auth
- A profile is auto-created for every new user via a Postgres trigger
- Session persists across page reloads

**Cart that actually persists**
- Cart items are stored server-side per user (not just localStorage) — so it follows you across devices and browsers

**Checkout**
- Places an order with snapshotted product details (name/price at time of purchase), then clears the cart
- Full order history visible at `/orders`

**Admin panel** (`/admin`)
- Full product CRUD — create, edit, delete
- Image upload to Supabase Storage with live preview
- Toggle "featured" status to control what shows up on the homepage

**Security**
- Row Level Security enabled on every table
- Users can only see/edit their own cart and orders
- Only admins can write products or upload images — enforced at the database level, not just hidden in the UI

---

## Why I built this

Wanted to build something that actually feels production-grade rather than a typical CRUD tutorial app. Used Supabase as a full backend replacement (Postgres + Auth + Storage) instead of writing a custom API, and focused heavily on getting RLS policies right so security isn't just a frontend illusion.

---

## Tech Stack

| Technology | Usage |
|------------|-------|
| React | Frontend UI |
| JavaScript | Core logic |
| Vite | Build tool and dev server |
| Supabase | Backend — Postgres database, Auth, Storage |
| PostgreSQL + RLS | Data storage and row-level security policies |
| Context API | Global state — Auth, Cart, Toast |

---

## Setup

### 1. Connect your Supabase project

1. Open your Supabase project → **Project Settings → API**
2. Copy the **Project URL** and **anon public** key
3. Open `.env` at the project root and paste them in:

```
VITE_SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 2. Run the database schema

1. In Supabase, go to **SQL Editor → New query**
2. Open `supabase/schema.sql`, copy the entire file, paste into the SQL editor, and run it

This creates all tables (`profiles`, `categories`, `products`, `cart_items`, `orders`, `order_items`), sets up RLS policies, creates a public `product-images` storage bucket, and seeds 24 sample products across 4 categories so the app isn't empty on first load.

> Safe to re-run — won't duplicate data or touch your own rows. Seed images use Unsplash links; if one goes stale you'll just see a placeholder, easily fixed by re-uploading an image via `/admin`.

### 3. Install and run

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

### 4. Make yourself an admin

1. Sign up for an account inside the running app (`/signup`)
2. In Supabase SQL Editor, run:

```sql
update public.profiles set is_admin = true
where id = (select id from auth.users where email = 'your-email@example.com');
```

3. Refresh — you'll see an **Admin** link in the header, and `/admin` unlocks full product management

---

## Project Structure

```
ShopSphere/
│
├── src/
│   ├── components/   # Header, Footer, ProductCard, route guards, toast
│   ├── context/      # AuthContext, CartContext, ToastContext
│   ├── lib/           # supabaseClient.js, products.js, orders.js
│   └── pages/         # Home, ProductListing, ProductDetail, Cart, Login,
│                       # Signup, Orders, Admin, NotFound
├── supabase/
│   └── schema.sql     # Full DB schema + RLS policies + seed data
├── .env.example
└── package.json
```

---

## Deploying

This is a static Vite app, so it deploys cleanly to Vercel, Netlify, or Render:

1. Push to GitHub
2. Import into Vercel/Netlify
3. Set `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` in the hosting dashboard
4. Build command: `npm run build` — Output directory: `dist`

---

## Screenshot

<img width="1892" height="922" alt="image" src="https://github.com/user-attachments/assets/71a1eac4-eb39-4afd-9951-72e1bd30908b" />


---

## Author

**Khizer Ahmad** — built this to go beyond a basic CRUD app and build a properly secured, production-style eCommerce platform using Supabase as a complete backend.

Feel free to fork it and build on top of it.
