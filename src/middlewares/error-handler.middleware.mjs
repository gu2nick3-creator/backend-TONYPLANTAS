export function errorHandler(error, _req, res, _next) {
  console.error(error);

  if (error?.message?.includes('Apenas imagens')) {
    return res.status(400).json({ message: error.message });
  }

  const statusCode = error?.statusCode || 500;
  const response = {
    message: error?.message || 'Erro interno no servidor.',
  };

  if (error?.details) {
    response.errors = error.details;
  }

  return res.status(statusCode).json(response);
}
