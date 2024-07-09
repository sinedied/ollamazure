from openai import AzureOpenAI

openai = AzureOpenAI(
    # This is where you point to your local server
    azure_endpoint="http://localhost:4041",

    # Parameters below must be provided but are not used by the local server
    api_key="123456",
    api_version="2024-02-01"
)

# Chat completion
chat_completion = openai.chat.completions.create(
    # Model must be provided but is not used by the local server
    model="gpt-4",
    messages=[
        {"role": "system", "content": "You are a helpful assistant."},
        {"role": "user", "content": "Say hello!"}
    ]
)

print(chat_completion.choices[0].message.content)

# Text completion
completion = openai.completions.create(
    # Model must be provided but is not used by the local server
    model="gpt-4",
    prompt="Say hello in French: "
)
print(completion.choices[0].text)

# Embeddings
embedding = openai.embeddings.create(
    # Model must be provided but is not used by the local server
    model="text-embedding-ada-002",
    input=["Once upon a time", "The end."]
)

for embedding in embedding.data:
    print(embedding.embedding[:3])
