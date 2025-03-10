package com.taaseenahmed.eco_budget.util;

import com.taaseenahmed.eco_budget.entity.Category;
import com.taaseenahmed.eco_budget.repository.CategoryRepository;
import com.taaseenahmed.eco_budget.service.ChatGPTService;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component
public class CategoryInitialiser implements CommandLineRunner {

    private final CategoryRepository categoryRepository;
    private final ChatGPTService chatGPTService;

    // Constructor injection
    public CategoryInitialiser(CategoryRepository categoryRepository, ChatGPTService chatGPTService) {
        this.categoryRepository = categoryRepository;
        this.chatGPTService = chatGPTService;
    }

    @Override
    public void run(String... args) {
        if (categoryRepository.count() == 0) {
            String[] categories = {"Food", "Transport", "Groceries", "Healthcare", "Entertainment", "Beauty", "Home and Family", "Shopping", "Income"};

            for (String categoryName : categories) {
                Double carbonMultiplier;
                if ("Income".equals(categoryName)) {
                    carbonMultiplier = 0.0;
                } else {
                    carbonMultiplier = getCarbonMultiplier(categoryName);
                }
                categoryRepository.save(new Category(categoryName, carbonMultiplier));
            }

            System.out.println("Default categories with multipliers have been loaded.");
        }
    }

    private Double getCarbonMultiplier(String categoryName) {
        String prompt = String.format("Provide a single numeric carbon footprint multiplier in kilograms of CO2 per dollar spent for a transaction in the '%s' category. Only provide the numeric multiplier.", categoryName);
        return chatGPTService.getCarbonMultiplier(prompt);
    }
}
