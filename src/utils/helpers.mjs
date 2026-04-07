import crypto from 'node:crypto';

export function makeId(prefix = '') {
  return `${prefix}${crypto.randomUUID().replace(/-/g, '')}`;
}

export function nowPlusDays(days) {
  return new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString();
}

export function normalizeText(value) {
  return String(value || '').trim();
}

export function slugify(value) {
  return normalizeText(value)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .slice(0, 120);
}

export function buildPublicImageUrl(imagePath) {
  if (!imagePath) return '';
  if (/^https?:\/\//i.test(imagePath)) return imagePath;
  return imagePath.startsWith('/') ? imagePath : `/${imagePath}`;
}

export function mapCategory(row) {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function mapProduct(row) {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    description: row.description,
    price: Number(row.price || 0),
    categoryId: row.category_id || '',
    image: buildPublicImageUrl(row.image),
    care: row.care,
    active: Boolean(row.active),
    featured: Boolean(row.featured),
    available: Boolean(row.available),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    categoryName: row.category_name || undefined,
  };
}
