import {
  createProduct,
  deleteProduct,
  getProductById,
  listProducts,
  updateProduct,
} from '../services/products.service.mjs';

export async function list(req, res, next) {
  try {
    const result = await listProducts(req.query);
    res.json(result);
  } catch (error) {
    next(error);
  }
}

export async function getById(req, res, next) {
  try {
    const result = await getProductById(req.params.id, req.query);
    res.json(result);
  } catch (error) {
    next(error);
  }
}

export async function create(req, res, next) {
  try {
    const result = await createProduct(req.body);
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
}

export async function update(req, res, next) {
  try {
    const result = await updateProduct(req.params.id, req.body);
    res.json(result);
  } catch (error) {
    next(error);
  }
}

export async function destroy(req, res, next) {
  try {
    const result = await deleteProduct(req.params.id);
    res.json(result);
  } catch (error) {
    next(error);
  }
}
