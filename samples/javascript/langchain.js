import { AzureChatOpenAI, AzureOpenAI, AzureOpenAIEmbeddings } from '@langchain/openai';

// Chat completion
const model = new AzureChatOpenAI({
  // This is where you point to your local server
  azureOpenAIBasePath: 'http://localhost:4041/openai/deployments',

  // Parameters below must be provided but are not used by the local server
  azureOpenAIApiKey: '123456',
  azureOpenAIApiVersion: '2024-02-01',
  azureOpenAIApiDeploymentName: 'gpt-4'
});

const completion = await model.invoke([{ type: 'human', content: 'Say hello!' }]);

console.log(completion.content);

// Text completion
const llm = new AzureOpenAI({
  // This is where you point to your local server
  azureOpenAIBasePath: 'http://localhost:4041/openai/deployments',

  // Parameters below must be provided but are not used by the local server
  azureOpenAIApiKey: '123456',
  azureOpenAIApiVersion: '2024-02-01',
  azureOpenAIApiDeploymentName: 'gpt-4'
});

const text = await llm.invoke('Say hello in French: ');

console.log(text);

// Embeddings
const embeddings = new AzureOpenAIEmbeddings({
  // This is where you point to your local server
  azureOpenAIBasePath: 'http://localhost:4041/openai/deployments',

  // Parameters below must be provided but are not used by the local server
  azureOpenAIApiKey: '123456',
  azureOpenAIApiVersion: '2024-02-01',
  azureOpenAIApiEmbeddingsDeploymentName: 'text-embedding-ada-002'
});

const vectors = await embeddings.embedDocuments(['Once upon a time', 'The end.']);

for (const vector of vectors) {
  console.log(vector.slice(0, 3));
}
