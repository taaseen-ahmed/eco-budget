package com.taaseenahmed.eco_budget.Recommendation;

import com.taaseenahmed.eco_budget.AppUser.AppUser;
import com.taaseenahmed.eco_budget.AppUser.AppUserRepository;
import com.taaseenahmed.eco_budget.Transaction.ChatGPTService;
import com.taaseenahmed.eco_budget.Transaction.Transaction;
import com.taaseenahmed.eco_budget.Transaction.TransactionRepository;
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

        boolean shouldRefreshRecommendations = recommendation == null || appUser.isTransactionsUpdated();

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

        // Reset the transactionsUpdated flag
        appUser.setTransactionsUpdated(false);
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
                recommendations.add(trimmedTip);
            }
        }

        return recommendations;
    }

    private String createSpendingPrompt(List<Transaction> transactions) {
        StringBuilder prompt = new StringBuilder("Based on the following transactions, provide 4-5 personalized spending recommendations and tips. "
                + "Ensure each recommendation is listed on a new line and starts with a number followed by a period. "
                + "Transactions are as follows: ");

        for (Transaction transaction : transactions) {
            prompt.append(String.format("Category: %s, Amount: %.2f. ", transaction.getCategory(), transaction.getAmount()));
        }
        prompt.append("Please maintain the numbered format.");
        return prompt.toString();
    }

    private String createCarbonFootprintPrompt(List<Transaction> transactions) {
        StringBuilder prompt = new StringBuilder("Based on the following transactions, provide 4-5 carbon footprint reduction recommendations and tips. "
                + "Ensure each recommendation is listed on a new line and starts with a number followed by a period. "
                + "Transactions are as follows: ");

        for (Transaction transaction : transactions) {
            prompt.append(String.format("Category: %s, Carbon Footprint: %.2f. ", transaction.getCategory(), transaction.getCarbonFootprint()));
        }
        prompt.append("Please maintain the numbered format.");
        return prompt.toString();
    }
}
