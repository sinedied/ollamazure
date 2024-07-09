import { type FastifyRequest } from 'fastify';
import { EventSourceParserStream } from 'eventsource-parser/stream';
import { type EmbeddingsResponse, type ListResponse } from 'ollama';
import type OpenAI from 'openai';
import { type CliOptions, askForConfirmation, fetchApi, runCommand } from './index.js';

type OpenAiCompletion = OpenAI.Completions.Completion;
type OpenAiCompletionRequest = OpenAI.Completions.CompletionCreateParams;
type OpenAiEmbeddings = OpenAI.Embeddings.CreateEmbeddingResponse;
type OpenAiEmbeddingsRequest = OpenAI.Embeddings.EmbeddingCreateParams;
type OpenAiChatCompletion = OpenAI.Chat.ChatCompletion;
type OpenAiChatCompletionRequest = OpenAI.Chat.ChatCompletionCreateParams;
type OpenAiChatCompletionChunk = OpenAI.Chat.ChatCompletionChunk;

export async function getOllamaCompletion(request: FastifyRequest, options: CliOptions) {
  const { ollamaUrl, model } = options;
  const { deployment } = request.params as any;
  const body = request.body as OpenAiCompletionRequest;
  const stream = Boolean(body.stream);

  // Convert completion request to chat request
  const completionRequest = { ...body };
  // TODO: properly handle prompt array
  completionRequest.prompt =
    Array.isArray(completionRequest.prompt) && typeof completionRequest.prompt?.[0] === 'string'
      ? completionRequest.prompt[0]
      : completionRequest.prompt;
  const messages = [{ role: 'user', content: completionRequest.prompt }];
  const chatRequest = {
    ...completionRequest,
    prompt: undefined,
    messages
  };

  const result = await fetchApi(
    `${ollamaUrl}/v1/chat/completions`,
    {
      method: 'POST',
      body: JSON.stringify({
        ...chatRequest,
        model: options.useDeployment ? deployment : model
      })
    },
    stream
  );

  if (stream) {
    const eventStream = (result as ReadableStream)
      .pipeThrough(new TextDecoderStream())
      .pipeThrough(new EventSourceParserStream())
      .pipeThrough(
        new TransformStream({
          transform(chunk, controller) {
            let { data } = chunk;
            if (data !== `[DONE]`) {
              const json = JSON.parse(data);
              const completion = createCompletionFromChat(json as OpenAiChatCompletionChunk, true);
              data = JSON.stringify(completion);
            }

            controller.enqueue(`data: ${data}\n\n`);
          }
        })
      );
    return eventStream;
  }

  return createCompletionFromChat(result as OpenAiChatCompletion);
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

  const getEmbeddings = async (input: string | number[]) =>
    fetchApi(`${ollamaUrl}/api/embeddings`, {
      method: 'POST',
      body: JSON.stringify({
        prompt: input,
        model
      })
    }) as Promise<EmbeddingsResponse>;

  const result = await (Array.isArray(input) && typeof input[0] !== 'number'
    ? Promise.all(input.map(async (i) => getEmbeddings(i as string | number[])))
    : getEmbeddings(input as string | number[]));

  return createEmbeddingsFromOllama(model as string, result, useBase64);
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
    runCommand(`ollama pull ${model}`);
  } catch (error_) {
    const error = error_ as Error;
    throw new Error(`Failed to download model "${model}".\n${error.message}`);
  }
}

function createCompletionFromChat(
  result: OpenAiChatCompletion | OpenAiChatCompletionChunk,
  chunk = false
): OpenAiCompletion {
  return {
    id: result.id.replace('chatcmpl-', 'cmpl-'),
    object: 'text_completion',
    created: result.created,
    model: result.model,
    choices: [
      {
        index: 0,
        text: chunk
          ? (result as OpenAiChatCompletionChunk).choices[0].delta.content!
          : (result as OpenAiChatCompletion).choices[0].message.content!,
        logprobs: null,
        // eslint-disable-next-line @typescript-eslint/naming-convention
        finish_reason: result.choices[0].finish_reason as any
      }
    ],
    usage: result.usage
  };
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
