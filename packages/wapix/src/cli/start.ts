import { parseArgs, type ParseArgsOptionsConfig } from 'node:util';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { createServer } from '../create-server.js';
import { buildRouteTree, collectRouteFiles, logRoutes } from './route-scanner.js';


export async function start(args: string[]): Promise<void> {
  const options = parseStartArgs(args);

  await startInternal(options);
}

export interface StartOptions {
  port: number;
  routesPath: string;
  key?: string;
  cert?: string;
}

export function parseStartArgs<TMoreOptions extends {} = {}>(args: string[], defaultOptions: Partial<StartOptions> = {}, moreOptions?: ParseArgsOptionsConfig): StartOptions & TMoreOptions {
  const { port: defaultPort = 3000, routesPath: defaultRoutesPath = './lib/routes' } = defaultOptions;
  const { values } = parseArgs({
    args,
    options: {
      port: { type: 'string', short: 'p', default: defaultPort?.toString() },
      routes: { type: 'string', default: defaultRoutesPath },
      key: { type: 'string' },
      cert: { type: 'string' },
      ...moreOptions
    },
    allowPositionals: true,
  });

  const port = parseInt(values.port, 10);
  const routesPath = path.join(process.cwd(), values.routes as string);
  const key = values.key ? path.join(process.cwd(), values.key as string) : undefined;
  const cert = values.cert ? path.join(process.cwd(), values.cert as string) : undefined;
  return { ...values, port, routesPath, key, cert } as unknown as StartOptions & TMoreOptions;
}


export async function startInternal({ port, routesPath, key, cert }: StartOptions) {
  try {
    // Validate SSL certificate options
    if ((key && !cert) || (!key && cert)) {
      console.error('❌ Both --key and --cert must be provided together for HTTPS');
      process.exit(1);
    }

    console.log(`🛠  Using routes directory: ${routesPath}`);

    // Build route tree for server
    const routes = await buildRouteTree(routesPath);

    // Collect route files for logging
    const routeFiles = await collectRouteFiles(routesPath);
    logRoutes(routeFiles);

    // Prepare server options
    let httpsOptions = undefined;
    if (key && cert) {
      console.log('🔒 HTTPS enabled');
      httpsOptions = {
        key: readFileSync(key),
        cert: readFileSync(cert)
      };
    }

    console.log('🚀 Starting server...');
    const server = createServer(routes, httpsOptions ? { https: httpsOptions } : undefined);
    server.on('error', (err) => {
      console.error('Server error:', err);
    });

    const protocol = httpsOptions ? 'https' : 'http';
    server.listen(port, () => {
      console.log(`✅ Server is running on ${protocol}://localhost:${port}`);
    });
    return server;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      console.error(`❌ Routes directory not found: ${routesPath}`);
      process.exit(1);
    }
    throw error;
  }
}
