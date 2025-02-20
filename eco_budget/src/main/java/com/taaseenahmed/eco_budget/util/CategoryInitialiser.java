package com.taaseenahmed.eco_budget.util;

import com.taaseenahmed.eco_budget.entity.Category;
import com.taaseenahmed.eco_budget.repository.CategoryRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component
public class CategoryInitialiser implements CommandLineRunner {

    private final CategoryRepository categoryRepository;

    // Constructor injection
    public CategoryInitialiser(CategoryRepository categoryRepository) {
        this.categoryRepository = categoryRepository;
    }

    @Override
    public void run(String... args) {
        if (categoryRepository.count() == 0) {
            categoryRepository.save(new Category("Food", 0.3));
            categoryRepository.save(new Category("Transport", 0.2));
            categoryRepository.save(new Category("Groceries", 0.5));
            categoryRepository.save(new Category("Healthcare", 0.1));
            categoryRepository.save(new Category("Entertainment", 0.3));
            categoryRepository.save(new Category("Beauty", 0.2));
            categoryRepository.save(new Category("Home and Family", 0.6));
            categoryRepository.save(new Category("Shopping", 0.7));
            categoryRepository.save(new Category("Income", 0.0));

            System.out.println("Default categories with multipliers have been loaded.");
        }
    }
}
