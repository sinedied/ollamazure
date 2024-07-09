using Azure;
using Azure.AI.OpenAI;
using OpenAI.Chat;
using OpenAI.Embeddings;

// Chat completion
AzureOpenAIClient azureClient = new(
    new Uri("http://localhost:4041"),
    // Must be provided but are not used by the local server
    new AzureKeyCredential("123456"));

ChatClient chatClient = azureClient.GetChatClient("gpt-4");

ChatCompletion completion = chatClient.CompleteChat([new UserChatMessage("Say hello!")]);

Console.WriteLine(completion.Content[0].Text);

// Embeddings
EmbeddingClient embeddingClient = azureClient.GetEmbeddingClient("text-embedding-ada-002");

EmbeddingCollection embeddingCollection = embeddingClient.GenerateEmbeddings([ "Once upon a time", "The end." ]);

foreach (Embedding embedding in embeddingCollection)
{
    Console.WriteLine("[{0}]", string.Join(", ", embedding.Vector.Slice(0, 3).ToArray()));
}
