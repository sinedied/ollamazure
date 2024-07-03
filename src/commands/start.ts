import createDebug from 'debug';
import chalk from 'chalk';
import { type CliOptions } from '../options.js';
import {
  askForConfirmation,
  selectMany
} from '../util/index.js';
import { startServer } from '../server.js'

const debug = createDebug('start');

export async function start(options: CliOptions) {
  debug('Running command with:', { options });
  await startServer();
}
