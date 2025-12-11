import * as p from '@clack/prompts';
import pc from 'picocolors';
import path from 'path';
import { promises as fs } from 'fs';
import { execCommand, execCommandWithOutput, commandExists } from './utils/exec.js';

export interface DestroyerConfig {
  projectName: string;
  deleteGitHub: boolean;
  deleteSupabase: boolean;
  deleteDocker: boolean;
}

export async function runDestroyer(config: DestroyerConfig): Promise<void> {
  const projectDir = path.resolve(process.cwd(), config.projectName);

  const s = p.spinner();

  // Check if project directory exists
  try {
    await fs.access(projectDir);
  } catch {
    p.log.error(`Project directory not found: ${projectDir}`);
    return;
  }

  // Step 1: Delete GitHub repository
  if (config.deleteGitHub) {
    s.start('Deleting GitHub repository...');
    try {
      // Get the GitHub username
      const result = await execCommand('gh api user -q .login', projectDir);
      const username = result.stdout.trim();
      const repoName = `velocity-${config.projectName}`;
      const fullRepoName = `${username}/${repoName}`;
      await execCommand(`gh repo delete ${fullRepoName} --yes`, projectDir);
      s.stop(pc.green('✓ GitHub repository deleted'));
    } catch (error) {
      s.stop(pc.yellow('⚠ GitHub repository not found or already deleted'));
    }
  }

  // Step 2: Delete Supabase project
  if (config.deleteSupabase) {
    s.start('Stopping local Supabase...');
    try {
      await execCommand('npx supabase stop', projectDir);
      s.stop(pc.green('✓ Local Supabase stopped'));
    } catch {
      s.stop(pc.yellow('⚠ Local Supabase was not running'));
    }

    // Check if linked to a remote project and offer to delete it
    s.start('Checking for linked Supabase project...');
    try {
      const result = await execCommandWithOutput('npx', ['supabase', 'projects', 'list', '--output', 'json'], projectDir);
      // If there's a linked project, we could delete it, but this is dangerous
      // For now, just inform the user
      s.stop(pc.yellow('⚠ Remote Supabase project must be deleted manually via dashboard'));
    } catch {
      s.stop(pc.dim('No remote Supabase project linked'));
    }
  }

  // Step 3: Delete Docker resources
  if (config.deleteDocker) {
    s.start('Removing Docker containers and volumes...');
    try {
      // Stop and remove containers created by docker-compose
      await execCommand('docker compose down -v --remove-orphans 2>/dev/null || true', projectDir);

      // Also clean up any supabase containers
      await execCommand('docker rm -f $(docker ps -aq --filter "name=supabase") 2>/dev/null || true', projectDir);

      // Remove supabase volumes
      await execCommand('docker volume rm $(docker volume ls -q --filter "name=supabase") 2>/dev/null || true', projectDir);

      s.stop(pc.green('✓ Docker resources cleaned up'));
    } catch {
      s.stop(pc.yellow('⚠ Some Docker resources may not have been cleaned'));
    }
  }

  // Step 4: Delete project directory
  s.start('Deleting project directory...');
  try {
    await fs.rm(projectDir, { recursive: true, force: true });
    s.stop(pc.green('✓ Project directory deleted'));
  } catch (error) {
    s.stop(pc.red(`✗ Failed to delete project directory: ${error}`));
  }
}

export async function getDestroyPrompts(projectName: string): Promise<DestroyerConfig | null> {
  p.log.warn(pc.red('⚠️  DANGER ZONE ⚠️'));
  p.log.message(`This will permanently destroy the project "${projectName}" and associated resources.`);
  p.log.message('');

  const confirm = await p.confirm({
    message: `Are you sure you want to destroy "${projectName}"?`,
    initialValue: false,
  });

  if (p.isCancel(confirm) || !confirm) {
    return null;
  }

  const options = await p.multiselect({
    message: 'What should be deleted?',
    options: [
      { value: 'github', label: 'GitHub repository', hint: `velocity-${projectName}` },
      { value: 'supabase', label: 'Supabase project', hint: 'Local containers + data' },
      { value: 'docker', label: 'Docker resources', hint: 'Containers, volumes, networks' },
    ],
    initialValues: ['github', 'supabase', 'docker'],
    required: true,
  });

  if (p.isCancel(options)) {
    return null;
  }

  const selectedOptions = options as string[];

  // Final confirmation with project name typing
  const confirmName = await p.text({
    message: `Type "${projectName}" to confirm destruction:`,
    validate: (value) => {
      if (value !== projectName) {
        return `Please type "${projectName}" exactly to confirm`;
      }
      return undefined;
    },
  });

  if (p.isCancel(confirmName)) {
    return null;
  }

  return {
    projectName,
    deleteGitHub: selectedOptions.includes('github'),
    deleteSupabase: selectedOptions.includes('supabase'),
    deleteDocker: selectedOptions.includes('docker'),
  };
}
