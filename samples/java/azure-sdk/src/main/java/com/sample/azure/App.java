package com.sample.azure;

import java.util.ArrayList;
import java.util.List;

import com.azure.ai.openai.*;
import com.azure.ai.openai.models.*;

public class App 
{
    public static void main( String[] args )
    {
        OpenAIClient client = new OpenAIClientBuilder()
            // This is where you point to your local server
            .endpoint("http://localhost:4041")
            .buildClient();
        
        List<ChatRequestMessage> chatMessages = new ArrayList<>();
        chatMessages.add(new ChatRequestUserMessage("Say hello!"));
        
        // Chat completion
        ChatCompletions chatCompletions = client.getChatCompletions("gpt-4",
            new ChatCompletionsOptions(chatMessages));
        
        System.out.println( chatCompletions.getChoices().get(0).getMessage().getContent());

        // Text completion
        List<String> prompts = new ArrayList<>();
        prompts.add("Say hello in French: ");

        Completions completions = client.getCompletions("gpt-4",
            new CompletionsOptions(prompts));
        
        System.out.println(completions.getChoices().get(0).getText());

        // Embeddings
        List<String> texts = new ArrayList<>();
        texts.add("Once upon a time");
        texts.add("The end.");

        Embeddings embeddings = client.getEmbeddings("text-embedding-ada-002",
            new EmbeddingsOptions(texts));

        for (EmbeddingItem embedding : embeddings.getData()) {
            System.out.println(embedding.getEmbedding().subList(0, 3));
        }
    }
}
