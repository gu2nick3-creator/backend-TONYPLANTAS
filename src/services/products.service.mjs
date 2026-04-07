import fs from 'node:fs';
import path from 'node:path';
import { query, queryOne } from '../config/database.mjs';
import { projectRoot } from '../config/paths.mjs';
import { makeId, mapProduct, normalizeText, slugify } from '../utils/helpers.mjs';
import { badRequest, notFound } from '../utils/http.mjs';

async function ensureUniqueProductSlug(name, currentId = null) {
  const base = slugify(name) || 'produto';
  let slug = base;
  let counter = 2;

  while (true) {
    const existing = currentId
      ? await queryOne('SELECT id FROM products WHERE slug = ? AND id <> ?', [slug, currentId])
      : await queryOne('SELECT id FROM products WHERE slug = ?', [slug]);

    if (!existing) return slug;
    slug = `${base}-${counter++}`;
  }
}

async function validateProduct(body, currentId = null) {
  const errors = [];
  const name = normalizeText(body?.name);
  const price = Number(body?.price);
  const categoryId = normalizeText(body?.categoryId);

  if (name.length < 2) errors.push('Nome é obrigatório.');
  if (Number.isNaN(price) || price < 0) errors.push('Preço inválido.');

  if (!categoryId) {
    errors.push('Categoria inválida.');
  } else {
    const category = await queryOne('SELECT id FROM categories WHERE id = ?', [categoryId]);
    if (!category) errors.push('Categoria inválida.');
  }

  if (currentId) {
    const existing = await queryOne('SELECT id FROM products WHERE id = ?', [currentId]);
    if (!existing) errors.push('Produto não encontrado.');
  }

  return { errors, values: { name, price, categoryId } };
}

function resolvePagination(queryParams) {
  const page = Math.max(1, Number(queryParams.page || 1));
  const limit = Math.min(100, Math.max(1, Number(queryParams.limit || 100)));
  const offset = (page - 1) * limit;

  return { page, limit, offset };
}

export async function listProducts(queryParams) {
  const adminMode = queryParams.admin === '1';
  const featured = queryParams.featured === '1';
  const categoryId = typeof queryParams.categoryId === 'string' ? queryParams.categoryId.trim() : '';
  const search = typeof queryParams.search === 'string' ? queryParams.search.trim() : '';
  const { page, limit, offset } = resolvePagination(queryParams);

  const clauses = [];
  const params = [];

  if (!adminMode) clauses.push('p.active = 1');
  if (featured) clauses.push('p.featured = 1');
  if (categoryId) {
    clauses.push('p.category_id = ?');
    params.push(categoryId);
  }
  if (search) {
    clauses.push('(LOWER(p.name) LIKE ? OR LOWER(p.description) LIKE ?)');
    const like = `%${search.toLowerCase()}%`;
    params.push(like, like);
  }

  const whereSql = clauses.length ? `WHERE ${clauses.join(' AND ')}` : '';
  const [countRow] = await query(`SELECT COUNT(*) AS total FROM products p ${whereSql}`, params);
  const total = Number(countRow?.total || 0);

  const rows = await query(`
    SELECT p.*, c.name AS category_name
    FROM products p
    INNER JOIN categories c ON c.id = p.category_id
    ${whereSql}
    ORDER BY p.created_at DESC, p.name ASC
    LIMIT ${limit} OFFSET ${offset}
  `, params);

  const items = rows.map(mapProduct);

  if (queryParams.withMeta === '1') {
    return {
      items,
      meta: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    };
  }

  return items;
}

export async function getProductById(id, queryParams = {}) {
  const row = await queryOne(`
    SELECT p.*, c.name AS category_name
    FROM products p
    INNER JOIN categories c ON c.id = p.category_id
    WHERE p.id = ?
    LIMIT 1
  `, [id]);

  if (!row) {
    throw notFound('Produto não encontrado.');
  }

  if (!row.active && queryParams.admin !== '1') {
    throw notFound('Produto não encontrado.');
  }

  return mapProduct(row);
}

export async function createProduct(payload) {
  const { errors } = await validateProduct(payload);

  if (errors.length) {
    throw badRequest(errors[0], errors);
  }

  const id = makeId('prd_');
  const slug = await ensureUniqueProductSlug(payload.name);

  await query(`
    INSERT INTO products (id, category_id, name, slug, description, price, image, care, active, featured, available)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `, [
    id,
    normalizeText(payload.categoryId),
    normalizeText(payload.name),
    slug,
    normalizeText(payload.description),
    Number(payload.price),
    normalizeText(payload.image),
    normalizeText(payload.care),
    payload.active ? 1 : 0,
    payload.featured ? 1 : 0,
    payload.available ? 1 : 0,
  ]);

  return getProductById(id, { admin: '1' });
}

export async function updateProduct(id, payload) {
  const { errors } = await validateProduct(payload, id);

  if (errors.length) {
    const statusError = errors.includes('Produto não encontrado.')
      ? notFound('Produto não encontrado.')
      : badRequest(errors[0], errors);
    throw statusError;
  }

  const existing = await queryOne('SELECT * FROM products WHERE id = ?', [id]);
  const slug = normalizeText(payload.name) !== existing.name
    ? await ensureUniqueProductSlug(payload.name, id)
    : existing.slug;

  await query(`
    UPDATE products
    SET category_id = ?, name = ?, slug = ?, description = ?, price = ?, image = ?, care = ?, active = ?, featured = ?, available = ?
    WHERE id = ?
  `, [
    normalizeText(payload.categoryId),
    normalizeText(payload.name),
    slug,
    normalizeText(payload.description),
    Number(payload.price),
    normalizeText(payload.image),
    normalizeText(payload.care),
    payload.active ? 1 : 0,
    payload.featured ? 1 : 0,
    payload.available ? 1 : 0,
    id,
  ]);

  return getProductById(id, { admin: '1' });
}

export async function deleteProduct(id) {
  const product = await queryOne('SELECT id, image FROM products WHERE id = ?', [id]);

  if (!product) {
    throw notFound('Produto não encontrado.');
  }

  await query('DELETE FROM products WHERE id = ?', [id]);

  if (product.image && String(product.image).startsWith('/uploads/')) {
    const filePath = path.join(projectRoot, 'public', String(product.image).replace(/^\//, ''));
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
  }

  return { ok: true };
}
