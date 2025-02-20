package com.taaseenahmed.eco_budget.service;

import com.taaseenahmed.eco_budget.entity.AppUser;
import com.taaseenahmed.eco_budget.entity.Recommendation;
import com.taaseenahmed.eco_budget.dto.response.RecommendationDTO;
import com.taaseenahmed.eco_budget.repository.AppUserRepository;
import com.taaseenahmed.eco_budget.entity.Transaction;
import com.taaseenahmed.eco_budget.repository.RecommendationRepository;
import com.taaseenahmed.eco_budget.repository.TransactionRepository;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
@AllArgsConstructor
public class RecommendationService {

    private final ChatGPTService chatGPTService;
    private final TransactionRepository transactionRepository;
    private final RecommendationRepository recommendationRepository;
    private final AppUserRepository appUserRepository;

    public RecommendationDTO createSpendingResponse(String email) {
        Recommendation recommendation = getRecommendationsForUser(email);
        return RecommendationDTO.builder()
                .spendingRecommendations(recommendation.getSpendingRecommendations())
                .build();
    }

    public RecommendationDTO createCarbonFootprintResponse(String email) {
        Recommendation recommendation = getRecommendationsForUser(email);
        return RecommendationDTO.builder()
                .carbonFootprintRecommendations(recommendation.getCarbonFootprintRecommendations())
                .build();
    }

    public Recommendation getRecommendationsForUser(String email) {
        AppUser appUser = appUserRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        LocalDateTime oneMonthAgo = LocalDateTime.now().minusMonths(1);
        List<Transaction> transactions = transactionRepository.findByAppUserIdAndDateAfter(appUser.getId(), oneMonthAgo);

        Recommendation recommendation = recommendationRepository.findByAppUserEmail(email).orElse(null);

        boolean shouldRefreshRecommendations = recommendation == null || appUser.isTransactionsUpdatedForRecommendations();

        if (!shouldRefreshRecommendations) {
            System.out.println("Using existing recommendations for user: " + email);
            return recommendation;
        }

        System.out.println("Fetching new recommendations for user: " + email);

        String spendingPrompt = createSpendingPrompt(transactions);
        String carbonFootprintPrompt = createCarbonFootprintPrompt(transactions);

        String spendingRecommendation = chatGPTService.getRecommendation(spendingPrompt);
        String carbonFootprintRecommendation = chatGPTService.getRecommendation(carbonFootprintPrompt);

        if (recommendation == null) {
            recommendation = new Recommendation(appUser);
        } else {
            recommendation.getSpendingRecommendations().clear();
            recommendation.getCarbonFootprintRecommendations().clear();
        }

        recommendation.setSpendingRecommendations(parseRecommendations(spendingRecommendation));
        recommendation.setCarbonFootprintRecommendations(parseRecommendations(carbonFootprintRecommendation));
        recommendation.setLastUpdated(LocalDateTime.now());

        appUser.setTransactionsUpdatedForRecommendations(false);
        appUserRepository.save(appUser);

        return recommendationRepository.save(recommendation);
    }

    private List<String> parseRecommendations(String recommendationText) {
        List<String> recommendations = new ArrayList<>();

        // Use regex to capture numbered recommendations, handling potential formatting issues
        String[] tips = recommendationText.split("(?m)^\\d+\\.\\s");

        for (String tip : tips) {
            String trimmedTip = tip.trim();
            if (!trimmedTip.isEmpty() && trimmedTip.length() >= 5) {
                // Remove any leading or trailing special characters
                trimmedTip = trimmedTip.replaceAll("^\\*+|\\*+$", "").trim();
                // Remove '**' that comes after the title
                trimmedTip = trimmedTip.replaceAll("\\*\\*$", "").replaceAll("\\*\\*:", ":").trim();
                // Exclude the introductory sentence
                if (!trimmedTip.startsWith("Based on your transaction data")) {
                    recommendations.add(trimmedTip);
                }
            }
        }

        return recommendations;
    }

    private String createSpendingPrompt(List<Transaction> transactions) {
        StringBuilder prompt = new StringBuilder("Analyze the following transaction data and provide 4-5 personalized spending recommendations. "
                + "Each recommendation should be concise and start with a number followed by a period. "
                + "Here are the transaction details in JSON format:\n");

        prompt.append("[");
        int count = 0;

        for (Transaction transaction : transactions) {
            if (count > 10) break; // Limit the number of transactions to prevent prompt bloat
            prompt.append(String.format("{\"category\":\"%s\", \"amount\":%.2f, \"description\":\"%s\"}, ",
                    transaction.getCategory(),
                    transaction.getAmount(),
                    truncateDescription(transaction.getDescription())
            ));
            count++;
        }

        if (prompt.charAt(prompt.length() - 2) == ',') {
            prompt.delete(prompt.length() - 2, prompt.length()); // Remove trailing comma
        }

        prompt.append("]");
        prompt.append("\nPlease provide actionable recommendations based on spending patterns.");
        return prompt.toString();
    }

    private String truncateDescription(String description) {
        if (description == null) return "No description";
        return description.length() > 50 ? description.substring(0, 50) + "..." : description;
    }

    private String createCarbonFootprintPrompt(List<Transaction> transactions) {
        StringBuilder prompt = new StringBuilder("Analyze the following transaction data and provide 4-5 personalized recommendations for reducing carbon footprint. "
                + "Recommendations should start with a number followed by a period. "
                + "Here are the transaction details in JSON format:\n");

        prompt.append("[");
        int count = 0;

        for (Transaction transaction : transactions) {
            if (count > 10) break;
            prompt.append(String.format("{\"category\":\"%s\", \"carbonFootprint\":%.2f, \"description\":\"%s\"}, ",
                    transaction.getCategory(),
                    transaction.getCarbonFootprint(),
                    truncateDescription(transaction.getDescription())
            ));
            count++;
        }

        if (prompt.charAt(prompt.length() - 2) == ',') {
            prompt.delete(prompt.length() - 2, prompt.length());
        }

        prompt.append("]");
        prompt.append("\nPlease provide actionable tips based on the carbon footprint patterns. Give a response in the context of the UK and Europe.");
        return prompt.toString();
    }
}
