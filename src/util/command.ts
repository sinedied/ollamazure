import { promisify } from 'node:util';
import { execSync, exec, spawn } from 'node:child_process';

export function runCommandSync(command: string) {
  execSync(command, { stdio: 'inherit', encoding: 'utf8' });
}

export async function runCommand(command: string): Promise<string> {
  const result = await promisify(exec)(command);
  return result.stdout.toString();
}

export async function runInBackground(command: string, arguments_: string[], waitFor: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const cmd = spawn(command, arguments_);
    const waitForFunction = (data: string) => {
      if (data.includes(waitFor)) {
        resolve();
      }
    };

    cmd.stdout.on('data', waitForFunction);
    cmd.stderr.on('data', waitForFunction);
    cmd.on('close', () => {
      reject(new Error(`Background command "${command}" terminated`));
    });
  });
}
