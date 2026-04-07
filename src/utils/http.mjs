export class AppError extends Error {
  constructor(statusCode, message, details = null) {
    super(message);
    this.name = 'AppError';
    this.statusCode = statusCode;
    this.details = details;
  }
}

export function badRequest(message, details = null) {
  return new AppError(400, message, details);
}

export function unauthorized(message = 'Não autenticado.') {
  return new AppError(401, message);
}

export function notFound(message = 'Recurso não encontrado.') {
  return new AppError(404, message);
}
