import { execCommand, commandExists } from './exec.js';

export interface SupabaseConfig {
  mode: 'new' | 'existing' | 'skip';
  projectRef?: string;
  projectName?: string;
  orgId?: string;
  region?: string;
  dbPassword?: string;
}

export async function checkSupabaseCli(): Promise<boolean> {
  return commandExists('supabase');
}

export async function initSupabase(projectDir: string): Promise<void> {
  await execCommand('supabase init', projectDir);
}

export async function linkSupabaseProject(projectDir: string, projectRef: string): Promise<void> {
  await execCommand(`supabase link --project-ref ${projectRef}`, projectDir);
}

export async function createSupabaseProject(config: {
  projectName: string;
  orgId: string;
  region: string;
  dbPassword: string;
}): Promise<string> {
  const result = await execCommand(
    `supabase projects create "${config.projectName}" --org-id ${config.orgId} --region ${config.region} --db-password "${config.dbPassword}"`
  );

  // Parse project ref from output
  const match = result.stdout.match(/Project ref:\s*(\S+)/);
  if (!match) {
    throw new Error('Could not parse project reference from Supabase output');
  }

  return match[1];
}

export async function getSupabaseStatus(projectDir: string): Promise<{
  apiUrl: string;
  dbUrl: string;
  anonKey: string;
  serviceRoleKey: string;
}> {
  const result = await execCommand('supabase status', projectDir);

  const apiUrl = result.stdout.match(/API URL:\s*(\S+)/)?.[1] || '';
  const dbUrl = result.stdout.match(/DB URL:\s*(\S+)/)?.[1] || '';
  const anonKey = result.stdout.match(/anon key:\s*(\S+)/)?.[1] || '';
  const serviceRoleKey = result.stdout.match(/service_role key:\s*(\S+)/)?.[1] || '';

  return { apiUrl, dbUrl, anonKey, serviceRoleKey };
}

export function generateEnvContent(config: {
  supabaseUrl?: string;
  supabaseAnonKey?: string;
  databaseUrl?: string;
}): string {
  return `# Supabase
NEXT_PUBLIC_SUPABASE_URL=${config.supabaseUrl || 'your-supabase-url'}
NEXT_PUBLIC_SUPABASE_ANON_KEY=${config.supabaseAnonKey || 'your-anon-key'}

# Database (for Drizzle)
DATABASE_URL=${config.databaseUrl || 'postgresql://postgres:postgres@localhost:54322/postgres'}
`;
}
