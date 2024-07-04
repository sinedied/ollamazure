import fastify from 'fastify';
import createDebug from 'debug';
import { CliOptions } from './options.js';
import { getOllamaChatCompletion, getOllamaCompletion, getOllamaEmbeddings } from './ollama.js';

const debug = createDebug('server');

export async function startServer(options: CliOptions) {
  debug('Starting server with:', { options });

  const app = fastify();
  const { ollamaUrl, model, embeddings } = options;
  
  app.get('/', async function (request, reply) {
    return { message: 'ollamazure server up' };
  });
  
  // Completion API
  app.post('/openai/deployments/:deployment/completions', async function (request, reply) {
    const { deployment } = request.params as any;
    debug(`Received text completion request (deployment: ${deployment})`, request.body);

    return getOllamaCompletion(request, options);
  });
  
  // Chat API
  app.post('/openai/deployments/:deployment/chat/completions', async function (request, reply) {
    const { deployment } = request.params as any;
    const { stream } = request.body as any;
    debug(`Received chat completion request (deployment: ${deployment})`, request.body);
    
    const data = await getOllamaChatCompletion(request, options);
    return stream ? reply.type('text/event-stream').send(data) : data;
  });
  
  // Embeddings API
  app.post('/openai/deployments/:deployment/embeddings', async function (request, reply) {
    const { deployment } = request.params as any;
    debug(`Received embeddings request (deployment: ${deployment})`, request.body);

    return getOllamaEmbeddings(request, options);
  });

  try {
    await app.listen({ port: options.port });
    console.log(`ollamazure started on http://${options.host}:${options.port}`)
  } catch (err) {
    app.log.error(err)
    process.exit(1)
  }
}
