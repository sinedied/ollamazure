import { type FastifyRequest } from 'fastify';
import createDebug from 'debug';
import { type EmbeddingsResponse, type ListResponse } from 'ollama';
import type OpenAI from 'openai';
import { type CliOptions } from './options.js';
import { askForConfirmation, fetchApi, runCommand, runCommandSync, runInBackground } from './util/index.js';
import { decodeTokens } from './tokenizer.js';

type OpenAiEmbeddings = OpenAI.Embeddings.CreateEmbeddingResponse;
type OpenAiEmbeddingsRequest = OpenAI.Embeddings.EmbeddingCreateParams;
type OpenAiCompletionRequest = OpenAI.Completions.CompletionCreateParams;
type OpenAiChatCompletionRequest = OpenAI.Chat.ChatCompletionCreateParams;

const debug = createDebug('ollama');

export async function getOllamaCompletion(request: FastifyRequest, options: CliOptions) {
  const { ollamaUrl, model } = options;
  const { deployment } = request.params as any;
  const body = request.body as OpenAiCompletionRequest;

  // TODO: properly handle prompt array
  const completionRequest = { ...body };
  completionRequest.prompt =
    Array.isArray(completionRequest.prompt) && typeof completionRequest.prompt?.[0] === 'string'
      ? completionRequest.prompt[0]
      : completionRequest.prompt;

  const stream = Boolean(body.stream);
  return fetchApi(
    `${ollamaUrl}/v1/completions`,
    {
      method: 'POST',
      body: JSON.stringify({
        ...completionRequest,
        model: options.useDeployment ? deployment : model
      })
    },
    stream
  );
}

export async function getOllamaChatCompletion(request: FastifyRequest, options: CliOptions) {
  const { ollamaUrl, model } = options;
  const { deployment } = request.params as any;
  const body = request.body as OpenAiChatCompletionRequest;
  const stream = Boolean(body.stream);

  return fetchApi(
    `${ollamaUrl}/v1/chat/completions`,
    {
      method: 'POST',
      body: JSON.stringify({
        ...body,
        model: options.useDeployment ? deployment : model
      })
    },
    stream
  );
}

export async function getOllamaEmbeddings(request: FastifyRequest, options: CliOptions) {
  const { ollamaUrl, embeddings } = options;
  const { deployment } = request.params as any;
  const body = request.body as OpenAiEmbeddingsRequest;
  const { input } = body;
  const model = options.useDeployment ? deployment : embeddings;
  const useBase64 = body.encoding_format?.toLowerCase() === 'base64';
  const newInput = convertEmbeddingInput(input, body.model ?? deployment);

  const getEmbeddings = async (input: string | number[]) =>
    fetchApi(`${ollamaUrl}/api/embeddings`, {
      method: 'POST',
      body: JSON.stringify({
        prompt: input,
        model
      })
    }) as Promise<EmbeddingsResponse>;

  const result = await Promise.all(newInput.map(async (i) => getEmbeddings(i)));
  return createEmbeddingsFromOllama(model as string, result, useBase64);
}

export async function checkOllamaVersion(options: CliOptions) {
  let result: string;
  try {
    result = await runCommand('ollama --version');
  } catch (error_) {
    const error = error_ as Error;
    debug(`Failed run "ollama" command: ${error?.message}`);
    throw new Error(
      `Could not check Ollama version.\n\n` +
        `Make sure Ollama is installed.\n` +
        `You can download it at http://ollama.com/download.`
    );
  }

  const match = /\d+\.\d+\.\d+/.exec(result);
  const version = match ? match[0] : '0.0.0';
  debug('Ollama version:', version);

  const [, minor] = version.split('.').map(Number);
  if (minor < 2) {
    throw new Error(
      `Ollama version ${version} is not supported.\n\n` +
        `Please upgrade to version 0.2.0 or higher.\n` +
        `You can download it at http://ollama.com/download.`
    );
  }
}

export async function startOllamaServer(options: CliOptions) {
  const { ollamaUrl } = options;
  try {
    await fetchApi(ollamaUrl, undefined, true);
    debug('Ollama server is running');
    return;
  } catch {
    debug('Ollama server not running, starting it up...');
  }

  try {
    await runInBackground('ollama', ['serve'], 'Listening on');
    debug('Ollama server started');
  } catch (error_) {
    const error = error_ as Error;
    debug(`Failed to start Ollama server: ${error?.message}`);
    throw new Error(
      `Could not start Ollama server.\n\n` +
        `Make sure Ollama is installed or start it manually.\n` +
        `You can download it at http://ollama.com/download.`
    );
  }
}

export async function checkOllamaModels(options: CliOptions) {
  const { ollamaUrl } = options;
  let result: ListResponse;
  try {
    result = (await fetchApi(`${ollamaUrl}/api/tags`)) as ListResponse;
  } catch {
    throw new Error(
      `Could not connect to Ollama API at ${ollamaUrl}\n\n` +
        `Make sure Ollama is installed and running.\n` +
        `You can download it at http://ollama.com/download.`
    );
  }

  const hasModel = result.models.some(
    (model) => model.name === options.model || model.name === `${options.model}:latest`
  );
  const hasEmbeddings = result.models.some(
    (model) => model.name === options.embeddings || model.name === `${options.embeddings}:latest`
  );

  if (!hasModel) {
    await askForModelDownload(options.model, options.yes);
  }

  if (!hasEmbeddings) {
    await askForModelDownload(options.embeddings, options.yes);
  }

  return result;
}

async function askForModelDownload(model: string, confirm = false) {
  confirm ||= await askForConfirmation(`Model "${model}" not found. Do you want to download it?`);
  if (!confirm) {
    throw new Error(`Model "${model}" is not available.\nPlease run "ollama pull ${model}" to download it.`);
  }

  try {
    console.info(`Downloading model "${model}"...`);
    runCommandSync(`ollama pull ${model}`);
  } catch (error_) {
    const error = error_ as Error;
    throw new Error(`Failed to download model "${model}".\n${error.message}`);
  }
}

function createEmbeddingsFromOllama(
  model: string,
  result: EmbeddingsResponse | EmbeddingsResponse[],
  useBase64 = false
): OpenAiEmbeddings {
  result = Array.isArray(result) ? result : [result];
  return {
    object: 'list',
    model,
    data: result.map((r) => ({
      object: 'embedding',
      // There's a type issue with OpenAI embeddings response
      // base64 string embeddings are not supported so we need to cast it
      embedding: useBase64 ? (convertToBase64(r.embedding) as any) : r.embedding,
      index: 0
    })),
    // Currently unsupported by Ollama API
    usage: {
      // eslint-disable-next-line @typescript-eslint/naming-convention
      prompt_tokens: 1,
      // eslint-disable-next-line @typescript-eslint/naming-convention
      total_tokens: 1
    }
  };
}

function convertToBase64(data: number[]) {
  return Buffer.from(new Float32Array(data).buffer).toString('base64');
}

function convertEmbeddingInput(input: string | number[] | number[][] | string[], embeddingModel: string) {
  let newInput = (!Array.isArray(input) || typeof input[0] === 'number' ? [input] : input) as string[] | number[][];
  if (typeof newInput[0][0] === 'number') {
    newInput = decodeTokens(newInput as number[][], embeddingModel);
  }

  return newInput;
}
