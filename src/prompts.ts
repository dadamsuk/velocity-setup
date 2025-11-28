import * as p from '@clack/prompts';

export interface SupabasePromptResult {
  supabaseMode: 'new' | 'existing' | 'skip' | 'cancel';
  projectRef?: string;
  supabaseProjectName?: string;
  orgId?: string;
  region?: string;
  dbPassword?: string;
}

export async function getProjectPrompts() {
  return await p.group(
    {
      projectName: () =>
        p.text({
          message: 'What is the name of your project?',
          placeholder: 'my-app',
          validate: (value) => {
            if (!value) return 'Project name is required';
            if (!/^[a-z0-9-]+$/.test(value)) {
              return 'Project name must be lowercase with hyphens only (e.g., my-app)';
            }
            if (value.length > 50) {
              return 'Project name must be 50 characters or less';
            }
            return undefined;
          },
        }),
    },
    {
      onCancel: () => {
        p.cancel('Setup cancelled.');
        process.exit(0);
      },
    }
  );
}

export async function getSupabasePromptsManual(): Promise<SupabasePromptResult> {
  const supabaseMode = await p.select<{ value: string; label: string; hint?: string }[], string>({
    message: 'How would you like to configure Supabase?',
    options: [
      { value: 'existing', label: 'Link to existing project', hint: 'Use an existing Supabase project' },
      { value: 'new', label: 'Create new project', hint: 'Create a new Supabase project' },
      { value: 'skip', label: 'Skip for now', hint: 'Configure Supabase later' },
    ],
  });

  if (p.isCancel(supabaseMode)) {
    return { supabaseMode: 'cancel' as const };
  }

  if (supabaseMode === 'skip') {
    return { supabaseMode: 'skip' as const };
  }

  if (supabaseMode === 'existing') {
    const projectRef = await p.text({
      message: 'Enter your Supabase project reference:',
      placeholder: 'abcdefghijklmnop',
      validate: (value) => {
        if (!value) return 'Project reference is required';
        if (value.length < 10) return 'Invalid project reference';
        return undefined;
      },
    });

    if (p.isCancel(projectRef)) {
      return { supabaseMode: 'cancel' as const };
    }

    return { supabaseMode: 'existing' as const, projectRef: projectRef as string };
  }

  // New project flow - collect each prompt individually to avoid type issues
  const supabaseProjectName = await p.text({
    message: 'Supabase project name:',
    placeholder: 'my-project',
    validate: (value) => {
      if (!value) return 'Project name is required';
      return undefined;
    },
  });

  if (p.isCancel(supabaseProjectName)) {
    p.cancel('Setup cancelled.');
    process.exit(0);
  }

  const orgId = await p.text({
    message: 'Supabase organization ID:',
    placeholder: 'org-id',
    validate: (value) => {
      if (!value) return 'Organization ID is required';
      return undefined;
    },
  });

  if (p.isCancel(orgId)) {
    p.cancel('Setup cancelled.');
    process.exit(0);
  }

  const region = await p.select({
    message: 'Select a region:',
    options: [
      { value: 'us-east-1', label: 'US East (N. Virginia)' },
      { value: 'us-west-1', label: 'US West (N. California)' },
      { value: 'eu-west-1', label: 'EU (Ireland)' },
      { value: 'eu-west-2', label: 'EU (London)' },
      { value: 'eu-central-1', label: 'EU (Frankfurt)' },
      { value: 'ap-southeast-1', label: 'Asia Pacific (Singapore)' },
      { value: 'ap-southeast-2', label: 'Asia Pacific (Sydney)' },
      { value: 'ap-northeast-1', label: 'Asia Pacific (Tokyo)' },
    ],
  });

  if (p.isCancel(region)) {
    p.cancel('Setup cancelled.');
    process.exit(0);
  }

  const dbPassword = await p.password({
    message: 'Database password:',
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

  return {
    supabaseMode: 'new' as const,
    supabaseProjectName: supabaseProjectName as string,
    orgId: orgId as string,
    region: region as string,
    dbPassword: dbPassword as string,
  };
}
