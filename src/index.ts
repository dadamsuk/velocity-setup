#!/usr/bin/env node

import * as p from '@clack/prompts';
import pc from 'picocolors';
import { runScaffolder, getPortFromName } from './scaffolder.js';
import { getProjectPrompts, getSupabasePromptsManual } from './prompts.js';
import { runDestroyer, getDestroyPrompts } from './destroyer.js';
import { config as dotenvConfig } from 'dotenv';
import { fileURLToPath } from 'url';
import path from 'path';

// Load .env from the setup project directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenvConfig({ path: path.resolve(__dirname, '../.env') });

// Parse CLI arguments
const args = process.argv.slice(2);
const command = args.find(arg => !arg.startsWith('--')) || 'create';
const projectNameArg = args.find((arg, i) => i > 0 && !arg.startsWith('--') && args[i - 1] === 'destroy');

// Check for CLI flags
const useManualSupabase = args.includes('--supabase');
const skipDocker = args.includes('--no-docker');
const portFlagIndex = args.findIndex(arg => arg === '--port');
const portArg = portFlagIndex !== -1 ? parseInt(args[portFlagIndex + 1], 10) : undefined;

async function mainCreate() {
  p.intro(pc.bgCyan(pc.black(' Velocity Setup ')));

  p.note(
    `This CLI will scaffold a full-stack Next.js application with:
• Supabase (database & auth)
• Drizzle ORM
• Shadcn/UI + Tailwind
• Vitest + Playwright testing
• Devcontainer for VS Code`,
    'Welcome'
  );

  const projectAnswers = await getProjectPrompts();

  if (p.isCancel(projectAnswers)) {
    p.cancel('Setup cancelled.');
    process.exit(0);
  }

  const projectName = projectAnswers.projectName as string;

  let supabaseConfig;

  if (useManualSupabase) {
    // Manual mode: ask all the supabase questions
    const supabaseAnswers = await getSupabasePromptsManual();

    if (supabaseAnswers.supabaseMode === 'cancel') {
      p.cancel('Setup cancelled.');
      process.exit(0);
    }

    supabaseConfig = {
      mode: supabaseAnswers.supabaseMode,
      projectRef: supabaseAnswers.projectRef,
      projectName: supabaseAnswers.supabaseProjectName,
      orgId: supabaseAnswers.orgId,
      region: supabaseAnswers.region,
      dbPassword: supabaseAnswers.dbPassword,
    };
  } else {
    // Default mode: create new project with defaults
    const orgId = process.env.SUPABASE_ORG_ID;
    if (!orgId) {
      p.cancel('SUPABASE_ORG_ID not found in .env file');
      process.exit(1);
    }

    const dbPassword = await p.password({
      message: 'Database password for Supabase:',
      validate: (value) => {
        if (!value) return 'Password is required';
        if (value.length < 8) return 'Password must be at least 8 characters';
        return undefined;
      },
    });

    if (p.isCancel(dbPassword)) {
      p.cancel('Setup cancelled.');
      process.exit(0);
    }

    supabaseConfig = {
      mode: 'new' as const,
      projectName: projectName,
      orgId: orgId,
      region: 'eu-west-1',
      dbPassword: dbPassword as string,
    };
  }

  const port = portArg || getPortFromName(projectName);

  const config = {
    projectName: projectName,
    supabase: supabaseConfig,
    includeDocker: !skipDocker,
    port: port,
  };

  try {
    await runScaffolder(config);

    p.note(
      `${pc.green('cd')} ${config.projectName}
${pc.green('supabase start')}  # Start local Supabase
${pc.green('npm run dev')}     # Start dev server on port ${pc.cyan(String(port))}`,
      'Next steps'
    );

    p.outro(pc.green('✓ Project created successfully!'));
  } catch (error) {
    p.cancel(`Setup failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    process.exit(1);
  }
}

async function mainDestroy(projectName?: string) {
  p.intro(pc.bgRed(pc.white(' Velocity Destroy ')));

  // If no project name provided, prompt for it
  let targetProject = projectName;
  if (!targetProject) {
    const projectInput = await p.text({
      message: 'Enter the project name to destroy:',
      placeholder: 'my-app',
      validate: (value) => {
        if (!value) return 'Project name is required';
        return undefined;
      },
    });

    if (p.isCancel(projectInput)) {
      p.cancel('Destroy cancelled.');
      process.exit(0);
    }

    targetProject = projectInput as string;
  }

  const config = await getDestroyPrompts(targetProject);

  if (!config) {
    p.cancel('Destroy cancelled.');
    process.exit(0);
  }

  try {
    await runDestroyer(config);
    p.outro(pc.green('✓ Project destroyed successfully!'));
  } catch (error) {
    p.cancel(`Destroy failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    process.exit(1);
  }
}

async function main() {
  console.clear();

  if (command === 'destroy') {
    await mainDestroy(projectNameArg);
  } else {
    await mainCreate();
  }
}

main();
