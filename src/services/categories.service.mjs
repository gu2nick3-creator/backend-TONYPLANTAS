import { query, queryOne } from '../config/database.mjs';
import { makeId, mapCategory, normalizeText, slugify } from '../utils/helpers.mjs';
import { badRequest, notFound } from '../utils/http.mjs';

async function ensureUniqueCategorySlug(name, currentId = null) {
  const base = slugify(name) || 'categoria';
  let slug = base;
  let counter = 2;

  while (true) {
    const existing = currentId
      ? await queryOne('SELECT id FROM categories WHERE slug = ? AND id <> ?', [slug, currentId])
      : await queryOne('SELECT id FROM categories WHERE slug = ?', [slug]);

    if (!existing) return slug;
    slug = `${base}-${counter++}`;
  }
}

async function validateCategory(body, currentId = null) {
  const errors = [];
  const name = normalizeText(body?.name);

  if (name.length < 2) {
    errors.push('Nome da categoria é obrigatório.');
  } else {
    const existing = currentId
      ? await queryOne('SELECT id FROM categories WHERE LOWER(name) = LOWER(?) AND id <> ?', [name, currentId])
      : await queryOne('SELECT id FROM categories WHERE LOWER(name) = LOWER(?)', [name]);

    if (existing) errors.push('Já existe uma categoria com esse nome.');
  }

  return { errors, name };
}

export async function listCategories() {
  const rows = await query('SELECT * FROM categories ORDER BY name ASC');
  return rows.map(mapCategory);
}

export async function createCategory(payload) {
  const { errors, name } = await validateCategory(payload);

  if (errors.length) {
    throw badRequest(errors[0], errors);
  }

  const id = makeId('cat_');
  const slug = await ensureUniqueCategorySlug(name);

  await query('INSERT INTO categories (id, name, slug) VALUES (?, ?, ?)', [id, name, slug]);
  const category = await queryOne('SELECT * FROM categories WHERE id = ?', [id]);
  return mapCategory(category);
}

export async function updateCategory(id, payload) {
  const category = await queryOne('SELECT * FROM categories WHERE id = ?', [id]);

  if (!category) {
    throw notFound('Categoria não encontrada.');
  }

  const { errors, name } = await validateCategory(payload, id);
  if (errors.length) {
    throw badRequest(errors[0], errors);
  }

  const slug = await ensureUniqueCategorySlug(name, id);

  await query('UPDATE categories SET name = ?, slug = ? WHERE id = ?', [name, slug, id]);
  const updated = await queryOne('SELECT * FROM categories WHERE id = ?', [id]);
  return mapCategory(updated);
}

export async function deleteCategory(id) {
  const category = await queryOne('SELECT * FROM categories WHERE id = ?', [id]);

  if (!category) {
    throw notFound('Categoria não encontrada.');
  }

  const countRow = await queryOne('SELECT COUNT(*) AS total FROM products WHERE category_id = ?', [id]);
  if (Number(countRow?.total || 0) > 0) {
    throw badRequest(`Esta categoria possui ${countRow.total} produto(s).`);
  }

  await query('DELETE FROM categories WHERE id = ?', [id]);
  return { ok: true };
}
