import process from 'node:process';
import { fileURLToPath } from 'node:url';
import { join, dirname } from 'node:path';
import debug from 'debug';
import updateNotifier from 'update-notifier';
import { program } from 'commander';
import chalk from 'chalk';
import { getPackageJson } from './util/index.js';
import { DEFAULT_EMBEDDINGS_MODEL, DEFAULT_MODEL, DEFAULT_PORT, OLLAMA_BASE_URL } from './constants.js';
import { type CliOptions } from './options.js';
import { startServer } from './server.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

export async function run(arguments_: string[] = process.argv) {
  const package_ = await getPackageJson(join(__dirname, '..'));

  updateNotifier({ pkg: package_ }).notify({ isGlobal: true });

  if (arguments_.includes('--verbose')) {
    debug.enable('*');
  }

  program
    .name(package_.name)
    .description(package_.description)
    .option('--verbose', 'show detailed logs')
    .option('-y, --yes', 'do not ask for confirmation', false)
    .option('-m, --model <name>', 'model to use for chat and text completions', DEFAULT_MODEL)
    .option('-e, --embeddings <name>', 'model to use for embeddings', DEFAULT_EMBEDDINGS_MODEL)
    .option('-d, --use-deployment', 'use deployment name as model name', false)
    .option('-h, --host <ip>', 'host to bind to', 'localhost')
    .option('-p, --port <number>', 'port to use', Number.parseFloat, DEFAULT_PORT)
    .option('-o, --ollama-url <number>', 'ollama base url', OLLAMA_BASE_URL)
    .version(package_.version, '-v, --version', 'show the current version')
    .helpCommand(false)
    .configureOutput({
      outputError(message, write) {
        write(chalk.red(message));
      }
    })
    .allowExcessArguments(false)
    .action(async (options: CliOptions) => {
      await startServer(options);
    });

  try {
    await program.parseAsync(process.argv);
  } catch (_error: unknown) {
    const error = _error as Error;
    console.error(chalk.red(error.message));
    process.exitCode = 1;
  }
}
