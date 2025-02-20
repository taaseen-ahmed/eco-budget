package com.taaseenahmed.eco_budget.Benchmark;

import com.taaseenahmed.eco_budget.AppUser.AppUser;
import com.taaseenahmed.eco_budget.AppUser.AppUserRepository;
import com.taaseenahmed.eco_budget.Transaction.ChatGPTService;
import com.taaseenahmed.eco_budget.Transaction.Transaction;
import com.taaseenahmed.eco_budget.Transaction.TransactionRepository;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@AllArgsConstructor
public class BenchmarkService {

    private final ChatGPTService chatGPTService;
    private final TransactionRepository transactionRepository;
    private final BenchmarkRepository benchmarkRepository;
    private final AppUserRepository appUserRepository;

    public BenchmarkDTO createBenchmarkResponse(String email) {
        Benchmark benchmark = getBenchmarksForUser(email);
        return BenchmarkDTO.builder()
                .benchmarks(benchmark.getBenchmarks())
                .build();
    }

    public Benchmark getBenchmarksForUser(String email) {
        AppUser appUser = appUserRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        LocalDateTime oneMonthAgo = LocalDateTime.now().minusMonths(1);
        List<Transaction> transactions = transactionRepository.findByAppUserIdAndDateAfter(appUser.getId(), oneMonthAgo);

        Benchmark benchmark = benchmarkRepository.findByAppUserEmail(email).orElse(null);

        boolean shouldRefreshBenchmarks = benchmark == null || appUser.isTransactionsUpdatedForBenchmarks();

        if (!shouldRefreshBenchmarks) {
            System.out.println("Using existing benchmarks for user: " + email);
            return benchmark;
        }

        System.out.println("Fetching new benchmarks for user: " + email);

        String benchmarkPrompt = createBenchmarkPrompt(transactions);

        String benchmarkRecommendation = chatGPTService.getRecommendation(benchmarkPrompt);

        if (benchmark == null) {
            benchmark = new Benchmark(appUser);
        } else {
            benchmark.getBenchmarks().clear();
        }

        benchmark.setBenchmarks(parseBenchmarks(benchmarkRecommendation));
        benchmark.setLastUpdated(LocalDateTime.now());

        // Reset the transactionsUpdatedForBenchmarks flag
        appUser.setTransactionsUpdatedForBenchmarks(false);
        appUserRepository.save(appUser);

        return benchmarkRepository.save(benchmark);
    }

    private List<String> parseBenchmarks(String benchmarkText) {
        List<String> benchmarks = new ArrayList<>();

        // Use regex to capture numbered benchmarks, handling potential formatting issues
        String[] tips = benchmarkText.split("(?m)^\\d+\\.\\s");

        for (String tip : tips) {
            String trimmedTip = tip.trim();
            if (!trimmedTip.isEmpty() && trimmedTip.length() >= 5) {
                // Remove any leading or trailing special characters
                trimmedTip = trimmedTip.replaceAll("^\\*+|\\*+$", "").trim();
                // Remove '**' that comes after the title
                trimmedTip = trimmedTip.replaceAll("\\*\\*$", "").replaceAll("\\*\\*:", ":").trim();
                // Exclude the introductory sentence
                if (!trimmedTip.startsWith("Based on your transaction data")) {
                    benchmarks.add(trimmedTip);
                }
            }
        }

        return benchmarks;
    }

    private String createBenchmarkPrompt(List<Transaction> transactions) {
        Map<String, Double> categorySpending = new HashMap<>();
        Map<String, Double> categoryCarbonFootprint = new HashMap<>();

        for (Transaction transaction : transactions) {
            String category = transaction.getCategory().getName();
            double amount = transaction.getAmount().doubleValue();
            double carbonFootprint = transaction.getCarbonFootprint().doubleValue();

            categorySpending.merge(category, amount, Double::sum);
            categoryCarbonFootprint.merge(category, carbonFootprint, Double::sum);
        }

        StringBuilder prompt = new StringBuilder("Analyze the following spending and carbon footprint data per category for the current user and provide 4-5 personalized benchmarks and comparisons to help contextualize the carbon footprint. "
                + "Each benchmark should be concise and start with a number followed by a period. "
                + "Here are the spending and carbon footprint details:\n");

        prompt.append("[");
        categorySpending.forEach((category, amount) -> {
            double carbonFootprint = categoryCarbonFootprint.getOrDefault(category, 0.0);
            if (amount > 0 || carbonFootprint > 0) {
                prompt.append(String.format("{\"category\":\"%s\", \"amount\":%.2f, \"carbonFootprint\":%.2f}, ", category, amount, carbonFootprint));
            }
        });

        if (prompt.charAt(prompt.length() - 2) == ',') {
            prompt.delete(prompt.length() - 2, prompt.length()); // Remove trailing comma
        }

        prompt.append("]");
        prompt.append("\nPlease provide meaningful benchmarks/comparisons based on the spending patterns and comparisons for carbon footprint, such as \"This is equivalent to driving X miles\" or \"X% below/above the national average\". Give a response in the context of the UK and Europe.");
        return prompt.toString();
    }
}