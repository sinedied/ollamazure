import { FastifyRequest } from "fastify";
import { CliOptions, fetchApi } from "./index.js";

export async function getOllamaCompletion(request: FastifyRequest, options: CliOptions) {
    const { ollamaUrl, model } = options;
    const { deployment } = request.params as any;
    const { stream } = request.body as any;

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
}

export async function getOllamaChatCompletion(request: FastifyRequest, options: CliOptions) {
  const { ollamaUrl, model } = options;
  const { deployment } = request.params as any;
  const { stream } = request.body as any;

  return await fetchApi(`${ollamaUrl}/v1/chat/completions`, {
    method: 'POST',
    body: JSON.stringify({
      ...request.body as any,
      model: options.useDeployment ? deployment : model,
    })
  }, stream);
}

export async function getOllamaEmbeddings(request: FastifyRequest, options: CliOptions) {
  const { ollamaUrl, embeddings } = options;
  const { deployment } = request.params as any;
  const { input } = request.body as any;

  const result = await fetchApi(`${ollamaUrl}/api/embeddings`, {
    method: 'POST',
    body: JSON.stringify({
      prompt: input,
      model: options.useDeployment ? deployment : embeddings,
    })
  });

  return createEmbeddingsFromOllama(result);
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
