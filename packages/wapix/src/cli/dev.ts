// @ts-ignore
import 'tsx';
import chokidar from 'chokidar';
import picomatch from 'picomatch';
import type { Server } from 'node:http';

export async function dev(args: string[]): Promise<void> {
  const { startInternal, parseStartArgs } = await import('./start');

  const parsedArgs = parseStartArgs<{ include: string[], exclude: string[] }>(args, { routesPath: './src/routes' }, {
    include: { type: 'string', short: 'i', default: [] as string[], multiple: true },
    exclude: { type: 'string', short: 'e', default: [] as string[], multiple: true },
  });

  const cwd = process.cwd();

  // Default ignore patterns
  const defaultIgnorePatterns = [
    '**/.*',
    '**/.*/**',
    '**/{node_modules,bower_components,vendor}/**',
    '**/dist/**',
    '**/build/**',
    '**/lib/**',
  ];

  // Combine default and user-specified exclude patterns
  const ignorePatterns = [...defaultIgnorePatterns, ...parsedArgs.exclude];

  // Create picomatch matcher for ignore patterns
  const isIgnored = picomatch(ignorePatterns, {
    dot: true,
    ignore: parsedArgs.include.length > 0 ? parsedArgs.include : undefined,
  });

  // watch with chokidar and restart on changes
  const watcher = chokidar.watch(cwd, {
    cwd,
    ignored: (path: string) => {
      // Normalize path to be relative to cwd
      const relativePath = path.startsWith(cwd) ? path.slice(cwd.length + 1) : path;
      return isIgnored(relativePath);
    },
    ignoreInitial: true,
    persistent: true,
  });
  
  let server: Server | null = null;
  let isRestarting = false;
  let restartTimer: NodeJS.Timeout | null = null;

  async function restart() {
    if (isRestarting) {
      return;
    }

    console.log('\n🔄 Changes detected, restarting server...');
    isRestarting = true;

    if (server) {
      // Close all connections immediately for faster restart
      server.closeAllConnections?.();
      server.closeIdleConnections?.();

      // Close the server with a timeout
      await Promise.race([
        new Promise<void>((resolve, reject) => {
          server!.close((err) => {
            if (err) {
              console.error('Error closing server:', err);
              reject(err);
            } else {
              resolve();
            }
          });
        }),
        new Promise<void>((resolve) => setTimeout(resolve, 1000)),
      ]);
    }

    try {
      server = await startInternal(parsedArgs);
    } catch (err) {
      console.error('Error starting server:', err);
    } finally {
      isRestarting = false;
    }
  }

  function scheduleRestart() {
    if (restartTimer) {
      clearTimeout(restartTimer);
    }
    restartTimer = setTimeout(() => {
      restart();
      restartTimer = null;
    }, 300);
  }

  watcher
    .on('all', scheduleRestart)
    .on('error', (error) => {
      console.error(`❌ Watcher error: ${error}`);
    });

  // Handle graceful shutdown
  process.on('SIGINT', () => {
    console.log('\n👋 Shutting down...');
    if (restartTimer) {
      clearTimeout(restartTimer);
    }
    watcher.close();
    server?.close();
    process.exit(0);
  });

  server = await startInternal(parsedArgs);
}
