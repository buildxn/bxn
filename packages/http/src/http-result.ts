import type { ServerResponse } from 'node:http';

/**
 * Represents the result of an HTTP endpoint handler.
 * The generic type T represents the response body type for type safety.
 */
export interface HttpResult<T = unknown> {
  /**
   * Executes the result, writing the response to the ServerResponse object.
   */
  execute(res: ServerResponse): Promise<void> | void;
  /** Type marker for the response body (not present at runtime) */
  readonly __type?: T;
}

/**
 * Helper to write headers to the response.
 */
function writeHeaders(
  res: ServerResponse,
  statusCode: number,
  headers: Record<string, string>
): void {
  res.statusCode = statusCode;
  Object.entries(headers).forEach(([key, value]) => {
    res.setHeader(key, value);
  });
}

/**
 * Creates a JSON result.
 */
function createJsonResult<T>(
  data: T,
  statusCode: number,
  headers: Record<string, string> = {}
): HttpResult<T> {
  return {
    execute(res: ServerResponse) {
      writeHeaders(res, statusCode, {
        'Content-Type': 'application/json',
        ...headers
      });
      res.end(JSON.stringify(data));
    }
  };
}

/**
 * Creates a text result.
 */
function createTextResult(
  text: string,
  statusCode: number,
  headers: Record<string, string> = {}
): HttpResult<string> {
  return {
    execute(res: ServerResponse) {
      writeHeaders(res, statusCode, {
        'Content-Type': 'text/plain',
        ...headers
      });
      res.end(text);
    }
  };
}

/**
 * Creates a status-only result.
 */
function createStatusResult(
  statusCode: number,
  headers: Record<string, string> = {}
): HttpResult<void> {
  return {
    execute(res: ServerResponse) {
      writeHeaders(res, statusCode, headers);
      res.end();
    }
  };
}

// Type helpers for creating response unions

/**
 * Type alias for Ok result (200).
 */
export type Ok<T> = HttpResult<T>;

/**
 * Type alias for Created result (201).
 */
export type Created<T> = HttpResult<T>;

/**
 * Type alias for NotFound result (404).
 */
export type NotFound<T = void> = HttpResult<T>;

/**
 * Type alias for BadRequest result (400).
 */
export type BadRequest<T = void> = HttpResult<T>;

/**
 * Type alias for NoContent result (204).
 */
export type NoContent = HttpResult<void>;

/**
 * Type alias for streaming response.
 */
export type Stream = HttpResult<void>;

/**
 * Returns a 200 OK response with JSON data.
 */
export function ok<T>(data: T, headers?: Record<string, string>): Ok<T> {
  return createJsonResult(data, 200, headers);
}

/**
 * Returns a 201 Created response with JSON data.
 */
export function created<T>(data: T, headers?: Record<string, string>): Created<T> {
  return createJsonResult(data, 201, headers);
}

/**
 * Returns a JSON response with a custom status code.
 */
export function json<T>(data: T, statusCode: number = 200, headers?: Record<string, string>): HttpResult<T> {
  return createJsonResult(data, statusCode, headers);
}

/**
 * Returns a 200 OK response with plain text.
 */
export function text(text: string, headers?: Record<string, string>): HttpResult<string> {
  return createTextResult(text, 200, headers);
}

/**
 * Returns a 404 Not Found response.
 */
export function notFound<T = void>(data?: T): NotFound<T> {
  if (data === undefined) {
    return createStatusResult(404) as NotFound<T>;
  }
  return createJsonResult(data, 404);
}

/**
 * Returns a 400 Bad Request response.
 */
export function badRequest<T = void>(data?: T): BadRequest<T> {
  if (data === undefined) {
    return createStatusResult(400) as BadRequest<T>;
  }
  return createJsonResult(data, 400);
}

/**
 * Returns a 204 No Content response.
 */
export function noContent(): NoContent {
  return createStatusResult(204);
}

/**
 * Returns a custom status code response.
 */
export function status(statusCode: number, headers?: Record<string, string>): HttpResult<void> {
  return createStatusResult(statusCode, headers);
}

/**
 * Returns a streaming response.
 * The writer function receives the response object and has full control
 * over status code, headers, and streaming the body.
 */
export function stream(
  writer: (res: ServerResponse) => Promise<void> | void
): Stream {
  return {
    async execute(res: ServerResponse) {
      await writer(res);
    }
  };
}