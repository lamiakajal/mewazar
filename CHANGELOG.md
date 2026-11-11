# Changelog

All notable changes to this project are documented here. The format follows
[Keep a Changelog](https://keepachangelog.com) and the project uses [Semantic Versioning](https://semver.org).

## [1.1.0] - 2026-11-11

### Added
- Moderators: the owner can add helpers by email and choose what each may do; settings, staff and activity are owner-only
- Activity log of admin actions
- Provider-agnostic online payment layer: payment gateway contract, callback and webhook routes, safe idempotent order updates, order confirmed page
- Wallet and bank orders must include a transaction ID; Guest or Account label on admin orders
- Product photos for the starter catalog, best-looking products first, and an admin button to apply them to products already in the database
- Cover photos for home page category tiles (uploaded, or the best product photo)

### Security
- Staff access requires a Google or GitHub sign-in and is re-checked in the database on every request

## [1.0.0] - 2026-11-07

### Added
- Project foundation: Next.js 16, TypeScript, Tailwind CSS v4, ESLint and shared configuration
- Design system with plum, honey and leaf tokens, light and dark themes, custom scrollbar and motion
- Mewazar logo, built-in product illustrations, loading screen, marquee, honey drip, floating hexagons
- Product catalog with 11 categories, 50 starter products, shop filters, sorting and product pages
- Cart drawer, wishlist and toast notifications
- Customer accounts with Google, GitHub and email sign-in, password reset and email confirmation
- Checkout with Cash on Delivery, bank transfer and wallets, coupons, server-side pricing and atomic stock reservation
- Order tracking page and "My orders" with progress and courier tracking links
- Storefront pages: home sections, About, Contact, delivery and return policies, privacy, terms, FAQ, 404 and error pages
- Admin panel: dashboard, products with photo upload, orders, invoices and customers
- Store settings: contact, delivery, payments, coupons, couriers, announcement and offer banner, store switches
- Easy courier tracking-link setup that creates a link template from a sample tracking page
- Customer reviews with moderation and verified-buyer badge
- Reward coins earned on delivery and spent at checkout, with a full ledger and admin adjustments
- Contact form with admin inbox and email alerts
- Owner-editable content: shop name, logo, home page text, FAQ, About page and policies, and categories
- Rate limiting (memory or Upstash Redis), secure headers, sitemap, robots and schema.org data
- Documentation: README, setup guide, admin guide, architecture notes, security policy, contributing guide and CI workflow

### Security
- Prices, discounts, stock, coupons and coins are always recalculated on the server
- Admin role is re-checked in the database on every admin request
- Uploads are validated by file signature
