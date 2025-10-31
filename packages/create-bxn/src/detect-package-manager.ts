import { existsSync } from 'node:fs';
import { join } from 'node:path';

export type PackageManager = 'pnpm' | 'npm' | 'yarn';

/**
 * Detects the package manager being used based on:
 * 1. The npm_config_user_agent environment variable (how the command was invoked)
 * 2. Lock files in the current directory
 * 3. Falls back to pnpm as default
 */
export function detectPackageManager(): PackageManager {
  // Check the user agent that invoked the command (most reliable method)
  const userAgent = process.env['npm_config_user_agent'] || '';

  if (userAgent.startsWith('pnpm')) {
    return 'pnpm';
  }
  if (userAgent.startsWith('yarn')) {
    return 'yarn';
  }
  if (userAgent.startsWith('npm')) {
    return 'npm';
  }

  // Fallback: check for lock files in current directory
  const cwd = process.cwd();

  if (existsSync(join(cwd, 'pnpm-lock.yaml'))) {
    return 'pnpm';
  }
  if (existsSync(join(cwd, 'yarn.lock'))) {
    return 'yarn';
  }
  if (existsSync(join(cwd, 'package-lock.json'))) {
    return 'npm';
  }

  // Default to pnpm
  return 'pnpm';
}
