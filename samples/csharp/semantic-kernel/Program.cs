using Microsoft.SemanticKernel;
using Microsoft.SemanticKernel.Connectors.OpenAI;

var builder = Kernel.CreateBuilder();

// Chat completion
builder.AddAzureOpenAIChatCompletion(
    "gpt-4",                   // Deployment Name (not used by the local server)
    "http://localhost:4041",   // Azure OpenAI Endpoint 
    "123456");                 // Azure OpenAI Key (not used by the local server)

var kernel = builder.Build();
var chatFunction = kernel.CreateFunctionFromPrompt(@"{{$input}}");

var chatCompletion = await kernel.InvokeAsync(chatFunction, new() { ["input"] = "Say hello!" });

Console.WriteLine(chatCompletion);

// Embeddings
// var embeddingGenerator = new AzureOpenAITextEmbeddingGenerationService( 
//     "gpt-4",                   // Deployment Name (not used by the local server)
//     "http://localhost:4041",   // Azure OpenAI Endpoint 
//     "123456");                 // Azure OpenAI Key (not used by the local server)

// var embedding = await embeddingGenerator.GenerateEmbeddingsAsync(["Once upon a time", "The end."]);

// Console.WriteLine(embedding);
