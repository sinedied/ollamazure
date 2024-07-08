import { OpenAI, OpenAIEmbedding } from 'llamaindex';

// Chat completion
const llm = new OpenAI({
  azure: {
    // This is where you point to your local server
    endpoint: 'http://localhost:4041',

    // Parameters below must be provided but are not used by the local server
    apiKey: '123456',
    apiVersion: '2024-02-01',
    deployment: 'gpt-4'
  }
});

const chatCompletion = await llm.chat({
  messages: [{ role: 'user', content: 'Say hello!' }]
});

console.log(chatCompletion.message.content);

// Embeddings
const embeddings = new OpenAIEmbedding({
  azure: {
    // This is where you point to your local server
    endpoint: 'http://localhost:4041',

    // Parameters below must be provided but are not used by the local server
    apiKey: '123456',
    apiVersion: '2024-02-01',
    deployment: 'gpt-4'
  }
});

const vectors = await embeddings.getTextEmbeddingsBatch(['Once upon a time', 'The end.']);

for (const vector of vectors) {
  console.log(vector.slice(0, 3));
}
