import type { IncomingMessage } from 'node:http';
import type { HttpResult } from './http-result.ts';

export interface EnhancedRequest<
  Params = {},
  RequestBody = any,
  Query = {}
> extends IncomingMessage {
  /** URL path params */
  params: Params;
  /** Parsed query string */
  query: Query;
  /** Parsed body */
  body: RequestBody;
}

export type RequestHandler<
  Params = Record<string, string>,
  Result extends HttpResult = HttpResult,
  RequestBody = any,
  Query = {}
> =
  ((
    req: EnhancedRequest<Params, RequestBody, Query>
  ) => Promise<Result> | Result)


