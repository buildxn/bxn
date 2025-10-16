import { Server } from 'node:http';
import type { RequestHandler } from './types.js';
import { enhanceRequest } from './enhance-request.js';
import { findMatchingRoute } from './find-matching-route.js';
import type { HttpMethod } from './http-methods.js';

export type RouteHandler = RequestHandler<any, any>;

// Routes are path-first: { '/path': { get: handler, post: handler } }
export type Routes = Record<string, Partial<Record<HttpMethod, RouteHandler>>>;

export function createServer(routes: Routes = {}) {
    const http = new Server(async (req, res) => {
        const url = new URL(req.url ?? '/', `http://${req.headers.host}`);
        const pathname = url.pathname;
        const method = req.method?.toLowerCase() || 'get';

        try {
            const routePatterns = Object.keys(routes);
            const match = findMatchingRoute(routePatterns, pathname);

            if (!match) {
                res.statusCode = 404;
                res.end();
                return;
            }

            const handler = routes[match.pattern]?.[method as HttpMethod];
            const params = match.params;

            if (!handler) {
                res.statusCode = 405;
                res.setHeader('Allow', Object.keys(routes[match.pattern] || {}).join(', '));
                res.end();
                return;
            }

            // Enhance the request object with params, query, and body
            const request = await enhanceRequest(req, url, params);

            // Execute handler and get HttpResult
            const result = await handler(request);

            // Execute the result to write to the response
            await result.execute(res);
        } catch (error) {
            console.error('Server error:', error);
            if (!res.headersSent) {
                res.statusCode = 500;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ error: 'Internal Server Error' }));
            }
        }
    });

    return http;
}