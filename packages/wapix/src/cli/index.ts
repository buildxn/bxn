import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

function getVersion(): string {
  try {
    const packageJsonPath = join(__dirname, '../../package.json');
    const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf-8'));
    return packageJson.version;
  } catch {
    return '0.0.0';
  }
}

function printBanner(): void {
  const version = getVersion();

  console.log(`⚡ wapix v${version} - Fast file-based HTTP routing`);
}

export async function run(): Promise<void> {
  const args = process.argv.slice(2);
  const command = args[0];

  printBanner();

  if (!command || command === 'start') {
    const startArgs = command === 'start' ? args.slice(1) : args;
    const { start } = await import('./start.js');
    await start(startArgs);
  } else if (command === 'dev') {
    const devArgs = args.slice(1);
    const { dev } = await import('./dev.js')
    await dev(devArgs);
  } else {
    console.error(`Unknown command: ${command}`);
    console.log('\nUsage: wapix [start|dev] [options]');
    console.log('\nCommands:');
    console.log('  start    Start production server (uses ./lib/routes)');
    console.log('  dev      Start development server with hot reload (uses ./src/routes)');
    console.log('\nOptions:');
    console.log('  --port, -p <port>    Port to listen on (default: 3000)');
    console.log('  --routes <path>      Routes directory');
    console.log('  --key <path>         Path to SSL private key file (for HTTPS)');
    console.log('  --cert <path>        Path to SSL certificate file (for HTTPS)');
    process.exit(1);
  }
}

// Only run if called directly (not when imported)
const isMainModule = process.argv[1] && import.meta.url === `file://${process.argv[1]}`;
if (isMainModule) {
  run().catch((error) => {
    console.error('Error:', error);
    process.exit(1);
  });
}
