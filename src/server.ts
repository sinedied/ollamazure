import fastify from 'fastify';
import { OLLAMA_BASE_URL } from './constants.js';
import { fetchJson } from './util/index.js';

const app = fastify({
  logger: true
});

app.get('/', async function (request, reply) {
  return { message: 'ollamazure server up' };
});

// Completion API
// POST https://openai.azure.com/openai/deployments/{id}/completions?api-version={version}
app.post('/openai/deployments/:id/completions', async function (request, reply) {
  const res = await fetchJson(`${OLLAMA_BASE_URL}/openai/v1/completions`, {
    method: 'POST',
    body: JSON.stringify({
      model: 'phi3',
      prompt: 'Once upon a time',
      max_token: 10
    })
  });

  return res;
});

// Chat API
// POST https://openai.azure.com/openai/deployments/{id}/chat/completions?api-version={version}
app.post('/openai/deployments/:id/chat/completions', async function (request, reply) {
  return { message: 'ollamazure server up' };
});

// Embeddings API
// POST https://openai.azure.com/openai/deployments/{id}/embeddings?api-version={version}
app.post('/openai/deployments/:id/embeddings', async function (request, reply) {
  return { message: 'ollamazure server up' };
});

export async function startServer() {
  try {
    await app.listen({ port: 3000 })
    console.log(`server listening on ${(app.server.address() as any).port}`)
  } catch (err) {
    app.log.error(err)
    process.exit(1)
  }
}
