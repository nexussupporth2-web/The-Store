# E-Commerce Store Generator & Custom Storefront

A high-performance, full-featured E-Commerce Store Generator and custom storefront built with React, TypeScript, Tailwind CSS, and Firebase. Designed for modern online merchants, creators, and entrepreneurs to instantly launch, customize, and manage their online stores with real-time inventory, secure checkout, and WhatsApp order placement.

---

## 🌟 Key Features

- **🛍️ Complete E-Commerce Storefront**: Product catalogs, category filtering, instant search, detailed product modal with zoomable image galleries, and recent view history.
- **🎨 Interactive Store Designer**: Real-time customization of store name, branding colors, banner images, currency, and inventory management.
- **🛒 Cart & Wishlist Management**: Local state management synchronized with cloud persistence via Firebase Firestore.
- **📦 Order Management & WhatsApp Checkout**: Streamlined checkout flow supporting instant WhatsApp order placement with order details pre-filled.
- **🔐 Secure Firebase Integration**: Firestore database and authentication for multi-user management and secure cloud persistence.
- **⚡ Modern Tech Stack**: React 18, Vite, TypeScript, Tailwind CSS v4, Lucide icons.

---

## 🚀 Quick Start

1. **Clone the Repository**
   ```bash
   git clone https://github.com/nexussupporth2-web/e-commerce-store.git
   cd e-commerce-store
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Run Development Server**
   ```bash
   npm run dev
   ```

4. **Build for Production**
   ```bash
   npm run build
   ```

---

## 📁 Project Structure

```text
├── src/
│   ├── components/     # UI components (Storefront, Cart, Designer, ProductModal, etc.)
│   ├── firebase/       # Firebase initialization and configuration
│   ├── types/          # TypeScript interfaces and types
│   ├── App.tsx         # Root application component
│   └── main.tsx        # Application entry point
├── firestore.rules     # Firestore security rules
├── firebase-applet-config.json # Firebase project configuration
├── package.json        # Dependencies and scripts
├── tsconfig.json       # TypeScript configuration
└── vite.config.ts      # Vite build configuration
```

---

## 📄 License

This project is open-source and available under the MIT License.
