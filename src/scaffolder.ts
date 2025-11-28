import * as p from '@clack/prompts';
import pc from 'picocolors';
import path from 'path';
import { fileURLToPath } from 'url';
import { promises as fs } from 'fs';
import { execCommand, execCommandWithOutput, commandExists } from './utils/exec.js';
import { writeFile, ensureDir, writeTemplate, readJsonFile, writeJsonFile } from './utils/files.js';
import { SupabaseConfig, checkSupabaseCli, initSupabase, linkSupabaseProject } from './utils/supabase.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export interface ScaffolderConfig {
  projectName: string;
  supabase: SupabaseConfig;
}

export async function runScaffolder(config: ScaffolderConfig): Promise<void> {
  const projectDir = path.resolve(process.cwd(), config.projectName);
  const templatesDir = path.resolve(__dirname, 'templates');

  const s = p.spinner();

  // Step 1: Create Next.js app
  s.start('Creating Next.js application...');
  await createNextApp(config.projectName);
  s.stop(pc.green('✓ Next.js application created'));

  // Step 2: Install additional dependencies
  s.start('Installing dependencies...');
  await installDependencies(projectDir);
  s.stop(pc.green('✓ Dependencies installed'));

  // Step 3: Set up Shadcn/UI
  s.start('Setting up Shadcn/UI...');
  await setupShadcn(projectDir);
  s.stop(pc.green('✓ Shadcn/UI configured'));

  // Step 4: Copy configuration files
  s.start('Generating configuration files...');
  await copyConfigFiles(templatesDir, projectDir);
  s.stop(pc.green('✓ Configuration files generated'));

  // Step 5: Set up devcontainer
  s.start('Setting up devcontainer...');
  await setupDevcontainer(templatesDir, projectDir, config.projectName);
  s.stop(pc.green('✓ Devcontainer configured'));

  // Step 6: Set up VS Code
  s.start('Setting up VS Code...');
  await setupVSCode(templatesDir, projectDir);
  s.stop(pc.green('✓ VS Code configured'));

  // Step 7: Copy example code
  s.start('Generating example code...');
  await copyExampleCode(templatesDir, projectDir);
  s.stop(pc.green('✓ Example code generated'));

  // Step 8: Create environment files
  s.start('Creating environment files...');
  await createEnvFiles(templatesDir, projectDir);
  s.stop(pc.green('✓ Environment files created'));

  // Step 9: Update package.json scripts
  s.start('Updating package.json...');
  await updatePackageJson(projectDir);
  s.stop(pc.green('✓ Package.json updated'));

  // Step 10: Create README
  s.start('Creating README...');
  await createReadme(templatesDir, projectDir, config.projectName);
  s.stop(pc.green('✓ README created'));

  // Step 11: Set up Supabase (if not skipped)
  if (config.supabase.mode !== 'skip') {
    const hasSupabaseCli = await checkSupabaseCli();
    if (!hasSupabaseCli) {
      p.log.warn('Supabase CLI not found. Skipping Supabase setup.');
      p.log.info('Install it with: brew install supabase/tap/supabase');
    } else {
      s.start('Initializing Supabase...');
      await initSupabase(projectDir);

      if (config.supabase.mode === 'existing' && config.supabase.projectRef) {
        await linkSupabaseProject(projectDir, config.supabase.projectRef);
      }
      s.stop(pc.green('✓ Supabase initialized'));
    }
  }

  // Step 12: Initialize git and create GitHub repo
  s.start('Initializing git repository...');
  await initGit(projectDir, config.projectName);
  s.stop(pc.green('✓ Git repository initialized and pushed to GitHub'));
}

async function createNextApp(projectName: string): Promise<void> {
  await execCommandWithOutput('npx', [
    'create-next-app@latest',
    projectName,
    '--typescript',
    '--tailwind',
    '--eslint',
    '--app',
    '--src-dir',
    '--import-alias', '@/*',
    '--use-npm',
    '--no-turbopack',
    '--no-react-compiler',
  ]);
}

async function installDependencies(projectDir: string): Promise<void> {
  // Core dependencies
  const coreDeps = [
    'drizzle-orm',
    'postgres',
    '@supabase/supabase-js',
    '@supabase/ssr',
    'zod',
  ];

  // Dev dependencies
  const devDeps = [
    'drizzle-kit',
    'dotenv',
    'vitest',
    '@vitejs/plugin-react',
    'jsdom',
    '@testing-library/react',
    '@testing-library/jest-dom',
    '@playwright/test',
    'prettier',
    'prettier-plugin-tailwindcss',
    'eslint-config-prettier',
    '@eslint/eslintrc',
  ];

  await execCommand(`npm install ${coreDeps.join(' ')}`, projectDir);
  await execCommand(`npm install -D ${devDeps.join(' ')}`, projectDir);
}

async function setupShadcn(projectDir: string): Promise<void> {
  // Initialize shadcn with defaults
  await execCommand(
    'npx shadcn@latest init -d -y',
    projectDir
  );

  // Install base components
  const components = ['button', 'input', 'card', 'label', 'textarea'];
  for (const component of components) {
    await execCommand(`npx shadcn@latest add ${component} -y`, projectDir);
  }
}

async function copyConfigFiles(templatesDir: string, projectDir: string): Promise<void> {
  const configFiles = [
    { src: 'config/drizzle.config.ts', dest: 'drizzle.config.ts' },
    { src: 'config/vitest.config.ts', dest: 'vitest.config.ts' },
    { src: 'config/playwright.config.ts', dest: 'playwright.config.ts' },
    { src: 'config/prettier.config.js', dest: 'prettier.config.js' },
    { src: 'config/next.config.ts', dest: 'next.config.ts' },
  ];

  for (const { src, dest } of configFiles) {
    const content = await fs.readFile(path.join(templatesDir, src), 'utf-8');
    await writeFile(path.join(projectDir, dest), content);
  }

  // Copy and merge ESLint config
  const eslintContent = await fs.readFile(
    path.join(templatesDir, 'config/eslint.config.mjs'),
    'utf-8'
  );
  await writeFile(path.join(projectDir, 'eslint.config.mjs'), eslintContent);
}

async function setupDevcontainer(
  templatesDir: string,
  projectDir: string,
  projectName: string
): Promise<void> {
  const devcontainerDir = path.join(projectDir, '.devcontainer');
  await ensureDir(devcontainerDir);

  // Copy and process devcontainer.json
  let devcontainerJson = await fs.readFile(
    path.join(templatesDir, 'devcontainer/devcontainer.json'),
    'utf-8'
  );
  devcontainerJson = devcontainerJson.replace(/\{\{projectName\}\}/g, projectName);
  await writeFile(path.join(devcontainerDir, 'devcontainer.json'), devcontainerJson);

  // Copy Dockerfile
  const dockerfile = await fs.readFile(
    path.join(templatesDir, 'devcontainer/Dockerfile'),
    'utf-8'
  );
  await writeFile(path.join(devcontainerDir, 'Dockerfile'), dockerfile);
}

async function setupVSCode(templatesDir: string, projectDir: string): Promise<void> {
  const vscodeDir = path.join(projectDir, '.vscode');
  await ensureDir(vscodeDir);

  const vscodeFiles = ['settings.json', 'extensions.json'];

  for (const file of vscodeFiles) {
    const content = await fs.readFile(path.join(templatesDir, 'vscode', file), 'utf-8');
    await writeFile(path.join(vscodeDir, file), content);
  }
}

async function copyExampleCode(templatesDir: string, projectDir: string): Promise<void> {
  const examplesDir = path.join(templatesDir, 'examples');
  const srcDir = path.join(projectDir, 'src');

  // Copy db files
  await ensureDir(path.join(srcDir, 'db'));
  const dbFiles = ['schema.ts', 'index.ts'];
  for (const file of dbFiles) {
    const content = await fs.readFile(path.join(examplesDir, 'db', file), 'utf-8');
    await writeFile(path.join(srcDir, 'db', file), content);
  }

  // Copy supabase client files
  await ensureDir(path.join(srcDir, 'lib', 'supabase'));
  const supabaseFiles = ['client.ts', 'server.ts'];
  for (const file of supabaseFiles) {
    const content = await fs.readFile(path.join(examplesDir, 'lib', 'supabase', file), 'utf-8');
    await writeFile(path.join(srcDir, 'lib', 'supabase', file), content);
  }

  // Copy test setup
  await ensureDir(path.join(srcDir, 'test'));
  const testSetup = await fs.readFile(path.join(examplesDir, 'test', 'setup.ts'), 'utf-8');
  await writeFile(path.join(srcDir, 'test', 'setup.ts'), testSetup);

  // Create e2e directory
  await ensureDir(path.join(projectDir, 'e2e'));
  await writeFile(
    path.join(projectDir, 'e2e', '.gitkeep'),
    '# E2E tests go here\n'
  );
}

async function createEnvFiles(templatesDir: string, projectDir: string): Promise<void> {
  // Create .env.local with local development defaults
  const envLocal = `# Supabase (Local Development)
NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0

# Database (Local Development)
DATABASE_URL=postgresql://postgres:postgres@localhost:54322/postgres
`;
  await writeFile(path.join(projectDir, '.env.local'), envLocal);

  // Copy .env.example
  const envExample = await fs.readFile(
    path.join(templatesDir, 'env', '.env.example'),
    'utf-8'
  );
  await writeFile(path.join(projectDir, '.env.example'), envExample);
}

async function createReadme(
  templatesDir: string,
  projectDir: string,
  projectName: string
): Promise<void> {
  let readme = await fs.readFile(path.join(templatesDir, 'README.md'), 'utf-8');
  readme = readme.replace(/\{\{projectName\}\}/g, projectName);
  await writeFile(path.join(projectDir, 'README.md'), readme);
}

async function updatePackageJson(projectDir: string): Promise<void> {
  const packageJsonPath = path.join(projectDir, 'package.json');
  const packageJson = await readJsonFile<Record<string, unknown>>(packageJsonPath);

  packageJson.scripts = {
    ...(packageJson.scripts as Record<string, string>),
    'test': 'vitest',
    'test:ui': 'vitest --ui',
    'test:coverage': 'vitest --coverage',
    'test:e2e': 'playwright test',
    'test:e2e:ui': 'playwright test --ui',
    'db:generate': 'drizzle-kit generate',
    'db:migrate': 'drizzle-kit migrate',
    'db:push': 'drizzle-kit push',
    'db:studio': 'drizzle-kit studio',
    'format': 'prettier --write .',
    'format:check': 'prettier --check .',
  };

  await writeJsonFile(packageJsonPath, packageJson);
}

async function initGit(projectDir: string, projectName: string): Promise<void> {
  // Update .gitignore to include additional entries
  const gitignorePath = path.join(projectDir, '.gitignore');
  const additionalEntries = `
# Environment files
.env*.local

# Playwright
/test-results/
/playwright-report/
/blob-report/
/playwright/.cache/

# Vitest
coverage/

# Drizzle
drizzle/meta/

# Supabase
.supabase/
`;

  await fs.appendFile(gitignorePath, additionalEntries);

  // Initialize git and make initial commit
  await execCommand('git init', projectDir);
  await execCommand('git add .', projectDir);
  await execCommand('git commit -m "Initial commit from Velocity Setup"', projectDir);

  // Create GitHub repo and push
  const repoName = `velocity-${projectName}`;
  await execCommand(`gh repo create ${repoName} --private --source=. --remote=origin --push`, projectDir);
}
