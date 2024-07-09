from langchain_openai import AzureChatOpenAI, AzureOpenAI, AzureOpenAIEmbeddings

# Chat completion
model = AzureChatOpenAI(
    # This is where you point to your local server
    azure_endpoint="http://localhost:4041",

    # Parameters below must be provided but are not used by the local server
    api_key="123456",
    api_version="2024-02-01",
    azure_deployment="gpt-4"
)

chat_completion = model.invoke([{"type": "human", "content": "Say hello!"}])
print(chat_completion.content)

# Text completion
llm = AzureOpenAI(
    # This is where you point to your local server
    azure_endpoint="http://localhost:4041",

    # Parameters below must be provided but are not used by the local server
    api_key="123456",
    api_version="2024-02-01",
    azure_deployment="gpt-4"
)

completion = llm.invoke("Say hello in French: ")
print(completion)

# Embeddings
embeddings = AzureOpenAIEmbeddings(
      # This is where you point to your local server
    azure_endpoint="http://localhost:4041",

    # Parameters below must be provided but are not used by the local server
    api_key="123456",
    api_version="2024-02-01",
    azure_deployment="text-embedding-ada-002"
)

# vectors = embeddings.embed_documents(["Once upon a time", "The end."])
vectors = embeddings.embed_query("Once upon a time")
print(vectors)
