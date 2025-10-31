#!/usr/bin/env node
import * as p from '@clack/prompts';
import { join, dirname } from 'node:path';
import { spawn } from 'node:child_process';
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { copyTemplate } from './copy-templates.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function main() {
  console.clear();

  p.intro('create-bxn');

  // Get project name
  const projectName = await p.text({
    message: 'What is your project named?',
    placeholder: 'my-api',
    validate: (value) => {
      if (!value) return 'Please enter a project name';
      if (!/^[a-z0-9-_]+$/i.test(value)) return 'Project name can only contain letters, numbers, hyphens and underscores';
      return;
    }
  });

  if (p.isCancel(projectName)) {
    p.cancel('Operation cancelled');
    process.exit(0);
  }

  const projectPath = join(process.cwd(), projectName);

  // Check if directory exists
  if (existsSync(projectPath)) {
    p.cancel(`Directory ${projectName} already exists`);
    process.exit(1);
  }

  // Ask about package manager
  const packageManager = await p.select({
    message: 'Which package manager do you want to use?',
    options: [
      { value: 'pnpm', label: 'pnpm', hint: 'recommended' },
      { value: 'npm', label: 'npm' },
      { value: 'yarn', label: 'yarn' },
    ],
  });

  if (p.isCancel(packageManager)) {
    p.cancel('Operation cancelled');
    process.exit(0);
  }

  const s = p.spinner();
  s.start('Creating project');

  try {
    // Copy template files
    const templatePath = join(__dirname, '..', 'templates', 'default');
    const replacements = {
      '{{PROJECT_NAME}}': projectName,
      '{{RUN_CMD}}': packageManager === 'npm' ? 'npm run' : packageManager as string,
    };

    await copyTemplate(templatePath, projectPath, replacements);

    s.stop('Project created');

    // Ask to install dependencies
    const shouldInstall = await p.confirm({
      message: 'Install dependencies?',
      initialValue: true,
    });

    if (p.isCancel(shouldInstall)) {
      p.cancel('Operation cancelled');
      process.exit(0);
    }

    if (shouldInstall) {
      const installSpinner = p.spinner();
      installSpinner.start('Installing dependencies');

      await new Promise<void>((resolve, reject) => {
        const child = spawn(packageManager as string, ['install'], {
          cwd: projectPath,
          stdio: 'pipe',
        });

        child.on('close', (code) => {
          if (code === 0) {
            resolve();
          } else {
            reject(new Error(`Installation failed with code ${code}`));
          }
        });
      });

      installSpinner.stop('Dependencies installed');
    }

    // Show next steps
    p.note(
      [
        `cd ${projectName}`,
        shouldInstall ? '' : `${packageManager} install`,
        `${packageManager === 'npm' ? 'npm run' : packageManager} dev`,
      ]
        .filter(Boolean)
        .join('\n'),
      'Next steps'
    );

    p.outro('Ready to build!');
  } catch (error) {
    s.stop('Failed to create project');
    p.cancel((error as Error).message);
    process.exit(1);
  }
}


main().catch(console.error);