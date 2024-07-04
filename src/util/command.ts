import { execSync } from 'node:child_process';

export function runCommand(command: string) {
  execSync(command, { stdio: 'inherit', encoding: 'utf8' });
}
