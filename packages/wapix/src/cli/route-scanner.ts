import fs from 'node:fs/promises';
import path from 'node:path';
import type { Routes } from '../create-server.ts';
import { isHttpMethod, type HttpMethod } from '../http-methods.ts';

export async function buildRouteTree(dir: string, basePath = ''): Promise<Routes> {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const routes: Routes = {};
  const timestamp = Date.now();

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      // Convert $param directories to :param route segments
      const segment = entry.name.startsWith('$')
        ? `:${entry.name.slice(1)}`
        : entry.name;

      // Recursively scan subdirectories
      const subRoutes = await buildRouteTree(fullPath, `${basePath}/${segment}`);
      // Merge subdirectory routes
      for (const [path, methods] of Object.entries(subRoutes)) {
        if (!routes[path]) {
          routes[path] = {};
        }
        Object.assign(routes[path], methods);
      }
    } else if (entry.isFile()) {
      const ext = path.extname(entry.name);
      const basename = path.basename(entry.name, ext);

      // Handle HTTP methods
      if (isHttpMethod(basename) && ['.ts', '.js'].includes(ext)) {
        // Convert to absolute file:// URL for dynamic import
        const absolutePath = path.resolve(fullPath);
        const fileUrl = `file://${absolutePath}?t=${timestamp}`;
        const module = await import(fileUrl);
        const handler = module.default;

        // Build path-first structure: { '/path': { method: handler } }
        const routePath = basePath || '/';
        if (!routes[routePath]) {
          routes[routePath] = {};
        }
        routes[routePath][basename as HttpMethod] = handler;
      }
    }
  }

  return routes;
}

export interface RouteFile {
  method: string;
  path: string;
  filePath: string;
}

// Helper to extract all route files (for build process)
export async function collectRouteFiles(
  dir: string,
  basePath = ''
): Promise<RouteFile[]> {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const files: RouteFile[] = [];

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      const segment = entry.name.startsWith('$')
        ? `:${entry.name.slice(1)}`
        : entry.name;

      const subFiles = await collectRouteFiles(
        fullPath,
        `${basePath}/${segment}`
      );
      files.push(...subFiles);
    } else if (entry.isFile()) {
      const ext = path.extname(entry.name);
      const basename = path.basename(entry.name, ext);

      if (isHttpMethod(basename) && ['.ts', '.js'].includes(ext)) {
        files.push({
          method: basename.toUpperCase(),
          path: basePath || '/',
          filePath: fullPath,
        });
      }
    }
  }

  return files;
}

// Log discovered routes in a nice format
export function logRoutes(routeFiles: RouteFile[]): void {
  if (routeFiles.length === 0) {
    console.log('⚠️  No routes found');
    return;
  }

  console.log('📋 Discovered routes:');
  routeFiles.forEach((route) => {
    console.log(`  ${route.method.padEnd(7)} ${route.path}`);
  });
  console.log('');
}
