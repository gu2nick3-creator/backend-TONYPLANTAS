import {
  createCategory,
  deleteCategory,
  listCategories,
  updateCategory,
} from '../services/categories.service.mjs';

export async function list(_req, res, next) {
  try {
    const result = await listCategories();
    res.json(result);
  } catch (error) {
    next(error);
  }
}

export async function create(req, res, next) {
  try {
    const result = await createCategory(req.body);
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
}

export async function update(req, res, next) {
  try {
    const result = await updateCategory(req.params.id, req.body);
    res.json(result);
  } catch (error) {
    next(error);
  }
}

export async function destroy(req, res, next) {
  try {
    const result = await deleteCategory(req.params.id);
    res.json(result);
  } catch (error) {
    next(error);
  }
}
