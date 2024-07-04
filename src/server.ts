import fastify from 'fastify';
import createDebug from 'debug';
import { fetchApi } from './util/index.js';
import { CliOptions } from './options.js';

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
    const { stream } = request.body as any;
    debug(`Received text completion request (deployment: ${deployment})`, request.body);

    // Convert completion request to chat request
    const query = { ...request.body as any };
    query.messages = [{ role: 'user', content: query.prompt }];
    delete query.prompt;

    const result = await fetchApi(`${ollamaUrl}/v1/chat/completions`, {
      method: 'POST',
      body: JSON.stringify({
        ...query,
        model: options.useDeployment ? deployment : model,
      })
    });
    return createCompletionFromChat(result);
  });
  
  // Chat API
  app.post('/openai/deployments/:deployment/chat/completions', async function (request, reply) {
    const { deployment } = request.params as any;
    const { stream } = request.body as any;
    debug(`Received chat completion request (deployment: ${deployment})`, request.body);

    const data = await fetchApi(`${ollamaUrl}/v1/chat/completions`, {
      method: 'POST',
      body: JSON.stringify({
        ...request.body as any,
        model: options.useDeployment ? deployment : model,
      })
    }, stream);

    return stream ? reply.type('text/event-stream').send(data) : data;
  });
  
  // Embeddings API
  app.post('/openai/deployments/:deployment/embeddings', async function (request, reply) {
    const { deployment } = request.params as any;
    const { input } = request.body as any;
    debug(`Received embeddings request (deployment: ${deployment})`, request.body);

    const result = await fetchApi(`${ollamaUrl}/api/embeddings`, {
      method: 'POST',
      body: JSON.stringify({
        prompt: input,
        model: options.useDeployment ? deployment : embeddings,
      })
    });

    return createEmbeddingsFromOllama(result);
  });

  try {
    await app.listen({ port: options.port });
    console.log(`ollamazure started on http://${options.host}:${options.port}`)
  } catch (err) {
    app.log.error(err)
    process.exit(1)
  }
}

function createCompletionFromChat(result: any) {
  return {
    id: result.id.replace('chatcmpl-', 'cmpl-'),
    object: 'text_completion',
    created: result.created,
    model: result.model,
    choices: [
      {
        index: 0,
        text: result.choices[0].message.content,
        logprobs: null,
        finish_reason: result.choices[0].finish_reason
      }
    ]
  };
}

function createEmbeddingsFromOllama(result: any) {
  return {
    object: 'list',
    model: result.model,
    data: [
      {
        object: 'embedding',
        embedding: result.embedding,
        index: 0
      }
    ],
  };
}
