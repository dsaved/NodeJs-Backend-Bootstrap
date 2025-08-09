import { NextFunction, Response, Request } from 'express';

export function requestLogger() {
  const log = console.log;

  return (req: Request, res: Response, next: NextFunction) => {
    const start = process.hrtime();
    const now = new Date().toISOString();

    // Log the request details before handling the request
    log(`Incoming request: ${req.method} ${req.originalUrl}`, {
      timestamp: now,
      method: req.method,
      originalUrl: req.originalUrl,
    });

    res.on('finish', () => {
      const [seconds, nanoseconds] = process.hrtime(start);
      const elapsed = seconds * 1000 + nanoseconds / 1e6;
      const { method, originalUrl } = req;
      const { statusCode } = res;
      log(`${method} ${originalUrl} ${statusCode} ${elapsed}ms`, {
        timestamp: now,
        responseTimeMs: elapsed,
        method,
        originalUrl,
        statusCode,
      });
    });

    next();
  };
}
