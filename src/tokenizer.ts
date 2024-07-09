import createDebug from 'debug';
import { get_encoding, encoding_for_model, type Tiktoken, type TiktokenModel } from 'tiktoken';

const debug = createDebug('tokenizer');

export function decodeTokens(input: number[][], model: string): string[] {
  let encoding: Tiktoken;
  try {
    encoding = encoding_for_model(model as TiktokenModel);
  } catch {
    debug(`Embedding model "${model}" not found, falling back to cl100k_base`);
    // Fall back to most common model
    encoding = get_encoding('cl100k_base');
  }

  const textDecoder = new TextDecoder();
  const texts = input.map((tokens) => {
    const decoded = encoding.decode(new Uint32Array(tokens));
    return textDecoder.decode(decoded);
  });
  encoding.free();

  return texts;
}
