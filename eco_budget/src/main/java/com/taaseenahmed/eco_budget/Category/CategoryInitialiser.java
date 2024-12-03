package com.taaseenahmed.eco_budget.Category;

import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component
public class CategoryInitialiser implements CommandLineRunner {

    private final CategoryRepository categoryRepository;

    // Constructor injection
    public CategoryInitialiser(CategoryRepository categoryRepository) {
        this.categoryRepository = categoryRepository;
    }

    @Override
    @Transactional
    public void run(String... args) throws Exception {
        // Check if categories are already loaded
        if (categoryRepository.count() == 0) {
            // Predefined categories, where the user is null
            categoryRepository.save(new Category("Food"));
            categoryRepository.save(new Category("Entertainment"));
            categoryRepository.save(new Category("Groceries"));
            categoryRepository.save(new Category("Healthcare"));
            categoryRepository.save(new Category("Beauty"));
            categoryRepository.save(new Category("Home & Family"));
            categoryRepository.save(new Category("Shopping"));
            categoryRepository.save(new Category("Income"));
            categoryRepository.save(new Category("Transport"));

            System.out.println("Default categories have been loaded.");
        }
    }
}