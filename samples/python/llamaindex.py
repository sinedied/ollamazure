from llama_index.core.llms import ChatMessage
from llama_index.llms.azure_openai import AzureOpenAI
from llama_index.embeddings.azure_openai import AzureOpenAIEmbedding

# Chat completion
llm = AzureOpenAI(
    # This is where you point to your local server
    azure_endpoint="http://localhost:4041",

    # Parameters below must be provided but are not used by the local server
    api_key="123456",
    api_version="2024-02-01",
    engine="gpt-4"
)

chat_completion = llm.chat([ChatMessage(role="user", content="Say hello!")])
print(chat_completion.message.content)

# Embeddings
embeddings = AzureOpenAIEmbedding(
      # This is where you point to your local server
    azure_endpoint="http://localhost:4041",

    # Parameters below must be provided but are not used by the local server
    api_key="123456",
    api_version="2024-02-01",
    azure_deployment="text-embedding-ada-002"
)

vectors = embeddings.get_text_embedding_batch(['Once upon a time', 'The end.'])

for vector in vectors:
    print(vector[:3])
