#!/usr/bin/env node

import * as p from '@clack/prompts';
import pc from 'picocolors';
import { runScaffolder } from './scaffolder.js';
import { getProjectPrompts, getSupabasePromptsManual } from './prompts.js';
import { config as dotenvConfig } from 'dotenv';
import { fileURLToPath } from 'url';
import path from 'path';

// Load .env from the setup project directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenvConfig({ path: path.resolve(__dirname, '../.env') });

// Check for --supabase flag
const useManualSupabase = process.argv.includes('--supabase');

async function main() {
  console.clear();

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

  const config = {
    projectName: projectName,
    supabase: supabaseConfig,
  };

  try {
    await runScaffolder(config);

    p.note(
      `${pc.green('cd')} ${config.projectName}
${pc.green('supabase start')}  # Start local Supabase
${pc.green('npm run dev')}     # Start development server`,
      'Next steps'
    );

    p.outro(pc.green('✓ Project created successfully!'));
  } catch (error) {
    p.cancel(`Setup failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    process.exit(1);
  }
}

main();
