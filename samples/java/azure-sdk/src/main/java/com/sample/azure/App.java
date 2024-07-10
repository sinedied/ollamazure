package com.sample.azure;

import java.util.ArrayList;
import java.util.List;

import com.azure.ai.openai.*;
import com.azure.ai.openai.models.*;
import com.azure.core.credential.AzureKeyCredential;

public class App 
{
    public static void main( String[] args )
    {
        OpenAIClient client = new OpenAIClientBuilder()
            .credential(new AzureKeyCredential("123456"))
            .endpoint("http://localhost:4041")
            .buildClient();

        List<ChatRequestMessage> chatMessages = new ArrayList<>();
        chatMessages.add(new ChatRequestUserMessage("Say hello!"));
        
        ChatCompletions chatCompletions = client.getChatCompletions("gpt-4",
            new ChatCompletionsOptions(chatMessages));
        
        System.out.println( chatCompletions.getChoices().get(0).getMessage().getContent());
    }
}
