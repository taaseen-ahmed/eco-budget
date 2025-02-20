package com.taaseenahmed.eco_budget.dto.request;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

// Represents the ChatGPT API request with model, messages, and temperature
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ChatGPTRequest {
    private String model;
    private List<Message> messages;
    private double temperature;

    // Constructor for creating a request with a system message prompt
    public ChatGPTRequest(String model, String prompt, double temperature) {
        this.model = model;
        this.messages = List.of(new Message("system", prompt));
        this.temperature = temperature;
    }

    // Represents a message with a role (system, user, assistant) and content
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Message {
        private String role;
        private String content;
    }
}
