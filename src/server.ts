import process from 'node:process';
import fastify from 'fastify';
import createDebug from 'debug';
import { type CliOptions } from './options.js';
import { checkOllamaModels, getOllamaChatCompletion, getOllamaCompletion, getOllamaEmbeddings } from './ollama.js';
import { type HttpError } from './util/index.js';

const debug = createDebug('server');

export async function startServer(options: CliOptions) {
  debug('Starting server with:', { options });
  const app = fastify();

  app.get('/', async function (request, reply) {
    return { message: 'ollamazure server up' };
  });

  // Completion API
  app.post('/openai/deployments/:deployment/completions', async function (request, reply) {
    const { deployment } = request.params as any;
    const { stream } = request.body as any;
    debug(`Received text completion request (deployment: ${deployment})`, request.body);

    try {
      const data = await getOllamaCompletion(request, options);
      return stream ? await reply.type('text/event-stream').send(data) : data;
    } catch (error) {
      return processOllamaError(error as HttpError);
    }
  });

  // Chat API
  app.post('/openai/deployments/:deployment/chat/completions', async function (request, reply) {
    const { deployment } = request.params as any;
    const { stream } = request.body as any;
    debug(`Received chat completion request (deployment: ${deployment})`, request.body);

    try {
      const data = await getOllamaChatCompletion(request, options);
      return stream ? await reply.type('text/event-stream').send(data) : data;
    } catch (error) {
      return processOllamaError(error as HttpError);
    }
  });

  // Embeddings API
  app.post('/openai/deployments/:deployment/embeddings', async function (request, reply) {
    const { deployment } = request.params as any;
    debug(`Received embeddings request (deployment: ${deployment})`, request.body);

    try {
      return await getOllamaEmbeddings(request, options);
    } catch (error) {
      return processOllamaError(error as HttpError);
    }
  });

  try {
    await checkOllamaModels(options);
    await app.listen({ port: options.port });

    console.log(`Azure OpenAI emulator started on http://${options.host}:${options.port}`);
    console.log('Press CTRL+C to quit.');
  } catch (error_) {
    const error = error_ as Error;
    console.error(error.message);
    process.exitCode = 1;
  }
}

function processOllamaError(error: HttpError) {
  const errorMessage =
    error.status === 404 ? `Model not found: ${error.message}` : `Failed to call Ollama API: ${error.message}`;
  console.error(errorMessage);
  return { error: errorMessage };
}
