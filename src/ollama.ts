import { FastifyRequest } from "fastify";
import { CliOptions, HttpError, askForConfirmation, fetchApi, runCommand } from "./index.js";
import { Stream } from "stream";

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

export async function checkOllamaModels(options: CliOptions) {
  const { ollamaUrl } = options;
  const result = await fetchApi(`${ollamaUrl}/api/tags`) as Record<string, any>;

  const hasModel = result.models.some((model: any) => model.name === options.model || model.name === `${options.model}:latest`);
  const hasEmbeddings = result.models.some((model: any) => model.name === options.embeddings || model.name === `${options.embeddings}:latest`);

  if (!hasModel) {
    await askForModelDownload(options.model, options.yes);
  }
  if (!hasEmbeddings) {
    await askForModelDownload(options.embeddings, options.yes);
  }

  return result;
}

async function askForModelDownload(model: string, confirm: boolean = false) {
  confirm ||= await askForConfirmation(`Model "${model}" not found. Do you want to download it?`);
  if (!confirm) {
    throw new Error(`Model "${model}" is not available.\nPlease run "ollama pull ${model}" to download it.`);
  }
  try {
    console.info(`Downloading model "${model}"...`)
    await runCommand(`ollama pull ${model}`);
  } catch (error_) {
    const error = error_ as Error;
    throw new Error(`Failed to download model "${model}".\n${error.message}`);
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
