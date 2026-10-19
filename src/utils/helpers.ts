import { Product, StoreConfig } from '../types';
import { DEFAULT_CONFIG } from './defaults';

export const STORAGE_KEY = 'storecfg';

export function generateSku(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let res = '';
  for (let i = 0; i < 6; i++) {
    res += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return res;
}

export const WEEKLY_THEMES = [
  { name: 'Pastel Sage & Honey', brand: '#4a6b5d', accent: '#e2bc74' },
  { name: 'Pastel Dusty Rose & Sand', brand: '#7a524a', accent: '#d4b28c' },
  { name: 'Pastel Lavender & Amber', brand: '#5c526d', accent: '#e5b273' },
  { name: 'Pastel Sky & Peach', brand: '#456285', accent: '#e79f66' },
];

export function getWeeklyTheme() {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 1);
  const diff = now.getTime() - start.getTime();
  const oneWeek = 1000 * 60 * 60 * 24 * 7;
  const weekNumber = Math.floor(diff / oneWeek);
  return WEEKLY_THEMES[weekNumber % WEEKLY_THEMES.length];
}

export function loadConfig(isEditMode = false): StoreConfig {
  let cfg: StoreConfig;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      const rawProducts = Array.isArray(parsed.products) && parsed.products.length > 0
        ? parsed.products
        : DEFAULT_CONFIG.products;

      const products = rawProducts.map((p: any) => ({
        ...p,
        sku: p.sku && p.sku.trim() ? p.sku.trim().toUpperCase() : generateSku(),
        images: Array.isArray(p.images) && p.images.length > 0
          ? p.images
          : [p.img || ''],
      }));

      const heroTitle = parsed.heroTitle === 'Beautiful finds for every occasion.' || !parsed.heroTitle
        ? DEFAULT_CONFIG.heroTitle
        : parsed.heroTitle;

      cfg = {
        ...DEFAULT_CONFIG,
        ...parsed,
        heroTitle,
        products,
      };
    } else {
      cfg = JSON.parse(JSON.stringify(DEFAULT_CONFIG));
      cfg.products = cfg.products.map((p: any) => ({
        ...p,
        sku: p.sku || generateSku(),
        images: p.images || [p.img],
      }));
    }
  } catch (err) {
    console.warn('Could not read store configuration from localStorage:', err);
    cfg = JSON.parse(JSON.stringify(DEFAULT_CONFIG));
  }

  // If autoWeeklyTheme is enabled (default), apply current week's theme colors
  if (cfg.autoWeeklyTheme !== false) {
    const weekly = getWeeklyTheme();
    cfg.brand = weekly.brand;
    cfg.accent = weekly.accent;
  }

  return cfg;
}

export function saveConfig(config: StoreConfig): boolean {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
    return true;
  } catch (err) {
    console.error('Failed to save config to localStorage:', err);
    return false;
  }
}

export function formatMoney(amount: number | string | undefined, currency: string = '₹'): string {
  const num = Number(amount || 0);
  return `${currency}${num.toLocaleString('en-IN')}`;
}

export function fixGoogleDriveUrl(url: string = ''): string {
  const trimmed = url.trim();
  const match =
    trimmed.match(/drive\.google\.com\/file\/d\/([\w-]+)/) ||
    trimmed.match(/drive\.google\.com\/(?:open|uc)\?[^#]*id=([\w-]+)/);
  if (match) {
    return `https://drive.google.com/thumbnail?id=${match[1]}&sz=w800`;
  }
  return trimmed;
}

export function generatePlaceholderSvg(product: { name: string; sku?: string }): string {
  const name = product.name || 'Product';
  let hash = 0;
  for (const char of name) {
    hash = (hash * 31 + char.charCodeAt(0)) % 360;
  }
  const letter = (name.trim()[0] || '?').toUpperCase();
  const skuLabel = product.sku ? `SKU: ${product.sku}` : '';
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="100%" height="100%">
    <defs>
      <radialGradient id="g-${hash}" cx="30%" cy="30%" r="70%">
        <stop offset="0%" stop-color="hsl(${hash}, 45%, 88%)" />
        <stop offset="100%" stop-color="hsl(${hash}, 40%, 75%)" />
      </radialGradient>
    </defs>
    <rect width="400" height="400" fill="url(#g-${hash})"/>
    <circle cx="200" cy="200" r="110" fill="hsl(${hash}, 45%, 65%)" opacity="0.4"/>
    <circle cx="200" cy="200" r="85" fill="hsl(${hash}, 50%, 92%)" opacity="0.7"/>
    <text x="200" y="225" font-size="110" text-anchor="middle" font-family="'Bricolage Grotesque', Georgia, serif" font-weight="700" fill="hsl(${hash}, 55%, 22%)">${escapeXml(letter)}</text>
    ${skuLabel ? `<text x="200" y="340" font-size="20" text-anchor="middle" font-family="'Figtree', sans-serif" font-weight="600" fill="hsl(${hash}, 55%, 25%)">${escapeXml(skuLabel)}</text>` : ''}
  </svg>`;
  return 'data:image/svg+xml;utf8,' + encodeURIComponent(svg);
}

function escapeXml(unsafe: string): string {
  return unsafe.replace(/[<>&'"]/g, (c) => {
    switch (c) {
      case '<': return '&lt;';
      case '>': return '&gt;';
      case '&': return '&amp;';
      case '\'': return '&apos;';
      case '"': return '&quot;';
      default: return c;
    }
  });
}

export function getProductImage(product: Product, index: number = 0): string {
  const list = product.images && product.images.length > 0 ? product.images : [product.img];
  const target = list[index] || list[0];
  if (target && target.trim()) {
    return fixGoogleDriveUrl(target);
  }
  return generatePlaceholderSvg(product);
}

export function resizeImage(
  file: File,
  maxDimension: number,
  outputType: string = 'image/jpeg',
  quality: number = 0.82
): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = reject;
    reader.onload = () => {
      const img = new Image();
      img.onerror = reject;
      img.onload = () => {
        const scale = Math.min(1, maxDimension / Math.max(img.width, img.height));
        const canvas = document.createElement('canvas');
        canvas.width = Math.round(img.width * scale);
        canvas.height = Math.round(img.height * scale);
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Canvas context not available'));
          return;
        }
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL(outputType, quality));
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  });
}

export async function computeSha256(str: string): Promise<string> {
  const buffer = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(str));
  return Array.from(new Uint8Array(buffer))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}
