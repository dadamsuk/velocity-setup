import { exec, spawn } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export interface ExecResult {
  stdout: string;
  stderr: string;
}

export async function execCommand(command: string, cwd?: string): Promise<ExecResult> {
  try {
    const result = await execAsync(command, {
      cwd,
      maxBuffer: 10 * 1024 * 1024, // 10MB buffer
    });
    return { stdout: result.stdout, stderr: result.stderr };
  } catch (error: unknown) {
    const execError = error as { stdout?: string; stderr?: string; message?: string };
    throw new Error(
      `Command failed: ${command}\n${execError.stderr || execError.message || 'Unknown error'}`
    );
  }
}

export async function execCommandWithOutput(
  command: string,
  args: string[],
  cwd?: string
): Promise<void> {
  return new Promise((resolve, reject) => {
    const proc = spawn(command, args, {
      cwd,
      stdio: 'inherit',
    });

    proc.on('close', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`Command "${command} ${args.join(' ')}" exited with code ${code}`));
      }
    });

    proc.on('error', (error) => {
      reject(error);
    });
  });
}

export async function commandExists(command: string): Promise<boolean> {
  try {
    await execCommand(`which ${command}`);
    return true;
  } catch {
    return false;
  }
}
