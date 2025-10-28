#!/usr/bin/env node

import { spawn } from 'node:child_process';

// Check if --watch flag is present and we're not already running under node --watch
const hasWatchFlag = process.argv.includes('--watch');
const isUnderNodeWatch = process.env.NODE_RUN_WATCH_MODE === '1';

if (hasWatchFlag && !isUnderNodeWatch) {
  // Re-spawn with node --watch, removing our --watch flag
  const args = process.argv.slice(2).filter(arg => arg !== '--watch');
  const child = spawn('node', ['--watch', process.argv[1], ...args], {
    stdio: 'inherit',
    env: { ...process.env, NODE_RUN_WATCH_MODE: '1' }
  });

  child.on('exit', (code) => {
    process.exit(code || 0);
  });
} else {
  // Normal execution
  const { run } = await import('../lib/cli/index.js');
  run();
}
