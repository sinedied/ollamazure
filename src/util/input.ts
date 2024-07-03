import { confirm } from '@inquirer/prompts';
import checkbox from '@inquirer/checkbox';

export async function askForConfirmation(question: string): Promise<boolean> {
  try {
    return await confirm({ message: question, default: true });
  } catch {
    return false;
  }
}

export async function selectMany(question: string, choices: string[]): Promise<string[]> {
  try {
    const selected = await checkbox({
      message: question,
      choices: choices.map((choice) => ({ value: choice }))
    });
    return selected;
  } catch {
    return [];
  }
}
