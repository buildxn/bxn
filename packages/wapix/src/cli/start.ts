import { parseArgs, type ParseArgsOptionsConfig } from 'node:util';
import path from 'node:path';
import { createServer } from '../create-server.js';
import { buildRouteTree, collectRouteFiles, logRoutes } from './route-scanner.js';


export async function start(args: string[]): Promise<void> {
  const { port, routesPath } = parseStartArgs(args);

  await startInternal({ port, routesPath });
}

export interface StartOptions {
  port: number;
  routesPath: string;
}

export function parseStartArgs<TMoreOptions extends {} = {}>(args: string[], defaultOptions: Partial<StartOptions> = {}, moreOptions?: ParseArgsOptionsConfig): StartOptions & TMoreOptions {
  const { port: defaultPort = 3000, routesPath: defaultRoutesPath = './lib/routes' } = defaultOptions;
  const { values } = parseArgs({
    args,
    options: {
      port: { type: 'string', short: 'p', default: defaultPort?.toString() },
      routes: { type: 'string', default: defaultRoutesPath },
      ...moreOptions
    },
    allowPositionals: true,
  });

  const port = parseInt(values.port, 10);
  const routesPath = path.join(process.cwd(), values.routes as string);
  return { ...values, port, routesPath } as unknown as StartOptions & TMoreOptions;
}


export async function startInternal({ port, routesPath }: StartOptions) {
  try {
    console.log(`🛠  Using routes directory: ${routesPath}`);

    // Build route tree for server
    const routes = await buildRouteTree(routesPath);

    // Collect route files for logging
    const routeFiles = await collectRouteFiles(routesPath);
    logRoutes(routeFiles);

    console.log('🚀 Starting server...');
    const server = await createServer(routes);
    server.on('error', (err) => {
      console.error('Server error:', err);
    });
    server.listen(port, () => {
      console.log(`✅ Server is running on http://localhost:${port}`);
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
