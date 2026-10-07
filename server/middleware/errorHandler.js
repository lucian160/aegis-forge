export function notFoundHandler(request, response) {
  response.status(404).json({
    error: 'Not found',
    message: `No route matches ${request.method} ${request.originalUrl}`,
  });
}

export function errorHandler(error, _request, response, _next) {
  const status = error.status || 500;
  const message = status >= 500
    ? error.publicMessage || 'An unexpected server error occurred.'
    : error.message || 'An unexpected server error occurred.';

  if (status >= 500) {
    console.error(error);
  }

  response.status(status).json({ error: message, ...(error.publicCode ? { code: error.publicCode } : {}) });
}
