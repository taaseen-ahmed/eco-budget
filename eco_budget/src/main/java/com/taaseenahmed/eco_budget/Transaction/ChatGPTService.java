package com.taaseenahmed.eco_budget.Transaction;

import io.github.cdimascio.dotenv.Dotenv;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
public class ChatGPTService {

    // API URL and keys for ChatGPT API
    private static final String API_URL = "https://api.openai.com/v1/chat/completions";
    private static final String MODEL = "gpt-4o-mini-2024-07-18";

    private final String apiKey;
    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper objectMapper = new ObjectMapper();

    public ChatGPTService() {
        if (System.getenv("CHATGPT_API_KEY") != null) {
            this.apiKey = System.getenv("CHATGPT_API_KEY");
        } else {
            Dotenv dotenv = Dotenv.configure().load();
            this.apiKey = dotenv.get("CHATGPT_API_KEY");
        }

        if (this.apiKey == null || this.apiKey.isBlank()) {
            throw new IllegalStateException("CHATGPT_API_KEY environment variable is not set or is empty.");
        }
    }

    // Method to get carbon multiplier based on category name and transaction description
    public Double getCarbonMultiplier(String categoryName, String description) {
        try {
            String prompt;
            if (description == null || description.isBlank()) {
                prompt = String.format("Provide a single numeric carbon footprint multiplier in kilograms of CO2 per dollar spent for a transaction in the '%s' category. Only provide the numeric multiplier.", categoryName);
            } else {
                prompt = String.format("Provide a single numeric carbon footprint multiplier in kilograms of CO2 per dollar spent for a transaction in the '%s' category. This is a description of the transaction: %s. Only provide the numeric multiplier.", categoryName, description);
            }

            String requestBody = objectMapper.writeValueAsString(
                    new ChatGPTRequest(MODEL, prompt, 0.7)
            );

            // Set up HTTP headers with authorization and content type
            HttpHeaders headers = new HttpHeaders();
            headers.set("Authorization", "Bearer " + apiKey);
            headers.set("Content-Type", "application/json");

            // Create HTTP request with body and headers
            HttpEntity<String> request = new HttpEntity<>(requestBody, headers);

            // Send the request to the ChatGPT API and get the response
            ResponseEntity<String> response = restTemplate.exchange(API_URL, HttpMethod.POST, request, String.class);

            // Parse the response to extract the content from the ChatGPT output
            JsonNode root = objectMapper.readTree(response.getBody());
            String completion = root.at("/choices/0/message/content").asText();

            // Print the raw response for debugging
            System.out.println("ChatGPT API response: " + completion);

            // Extract the numeric multiplier from the response using regex
            Pattern pattern = Pattern.compile("-?\\d+(\\.\\d+)?");
            Matcher matcher = pattern.matcher(completion);
            if (matcher.find()) {
                Double parsedValue = Double.parseDouble(matcher.group());  // Parse the first number found
                System.out.println("Parsed multiplier: " + parsedValue);  // Print the parsed value
                return parsedValue;
            } else {
                throw new NumberFormatException("No valid number found in the response");
            }
        } catch (Exception e) {
            e.printStackTrace();  // Log the error if anything goes wrong
            return null;  // Return null in case of failure
        }
    }

    public String getRecommendation(String prompt) {
        try {
            String requestBody = objectMapper.writeValueAsString(
                    new ChatGPTRequest(MODEL, prompt, 0.7)
            );

            HttpHeaders headers = new HttpHeaders();
            headers.set("Authorization", "Bearer " + apiKey);
            headers.set("Content-Type", "application/json");

            HttpEntity<String> request = new HttpEntity<>(requestBody, headers);

            ResponseEntity<String> response = restTemplate.exchange(API_URL, HttpMethod.POST, request, String.class);
            JsonNode root = objectMapper.readTree(response.getBody());

            JsonNode contentNode = root.at("/choices/0/message/content");
            if (!contentNode.isMissingNode()) {
                return contentNode.asText();
            } else {
                throw new IllegalArgumentException("Invalid response structure from ChatGPT API");
            }
        } catch (Exception e) {
            e.printStackTrace();
            return "Error generating recommendation: " + e.getMessage();
        }
    }
}
