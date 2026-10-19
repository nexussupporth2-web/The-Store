# Hearth & Home — Artisanal Storefront

Your application is fully built, tested, and configured with:
- React + Vite + Tailwind CSS
- Firebase Firestore & Auth integration
- Store Designer & Catalog management
- Order Tracker with SKU lookup
- Wishlist & Product Reviews
- 4 Weekly Pastel Rotating Themes

## Project File Structure
- `index.html`: Main HTML entry point with meta tags and Google Fonts.
- `src/App.tsx`: Main application router, state management, and view switching.
- `src/components/`:
  - `Header.tsx`: Top header with branding, cart, wishlist, and menu toggle.
  - `NavigationDrawer.tsx`: Mobile menu drawer with custom subtitle.
  - `StoreDesigner.tsx`: Admin panel for product catalog and branding.
  - `ProductCard.tsx`: Product grid card with category, title, SKU, stock dot, and wishlist heart.
  - `ProductModal.tsx`: Detailed product modal with reviews, rating, share, and quantity selector.
  - `CartDrawer.tsx`: Shopping cart and WhatsApp checkout.
  - `WishlistDrawer.tsx`: Saved wishlist items.
  - `PolicyAndPages.tsx`: Order Tracker with SKU support, Contact Us, Shipping & Refund policies.
  - `Footer.tsx`: Footer with NGO info, contact links, and 5-second secret admin hold on "Powered by".
- `src/utils/firebase.ts`: Firebase Firestore client initialization and sync.
- `src/utils/helpers.ts`: Money formatting, image resizing, 6-digit alphanumeric SKU generator, and weekly theme rotation logic.
- `src/utils/defaults.ts`: Default store configuration and artisanal product catalog.
