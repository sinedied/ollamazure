import { createInterface } from 'node:readline';
import process from 'node:process';
import { Buffer } from 'node:buffer';

export async function getStdin(): Promise<string | undefined> {
  if (process.stdin.isTTY) {
    return undefined;
  }

  const data = [];
  let length = 0;

  for await (const chunk of process.stdin) {
    data.push(chunk);
    length += chunk.length as number;
  }

  return Buffer.concat(data, length).toString();
}

export async function askForInput(question: string): Promise<string> {
  return new Promise((resolve, _reject) => {
    const read = createInterface({
      input: process.stdin,
      output: process.stdout
    });
    read.question(question, (answer) => {
      read.close();
      resolve(answer);
    });
  });
}

export async function askForConfirmation(question: string): Promise<boolean> {
  const answer = await askForInput(`${question} [Y/n] `);
  return answer.toLowerCase() !== 'n';
}
