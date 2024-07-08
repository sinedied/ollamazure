import { AzureOpenAI } from 'openai';

const openai = new AzureOpenAI({
  // This is where you point to your local server
  endpoint: 'http://localhost:4041',

  // Parameters below must be provided but are not used by the local server
  apiKey: '123456',
  apiVersion: '2024-02-01',
  deployment: 'gpt-4'
});

// Chat completion
const chatCompletion = await openai.chat.completions.create({
  messages: [{ role: 'user', content: 'Say hello!' }]
});

console.log(chatCompletion.choices[0].message.content);

// Text completion
const completion = await openai.completions.create({
  prompt: 'Say hello in French: '
});

console.log(completion.choices[0].text);

// Embeddings
const embeddings = await openai.embeddings.create({
  input: ['Once upon a time', 'The end.']
});

for (const embedding of embeddings.data) {
  console.log(embedding.embedding.slice(0, 3));
}
