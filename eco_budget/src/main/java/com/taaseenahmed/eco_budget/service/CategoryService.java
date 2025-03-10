package com.taaseenahmed.eco_budget.service;

import com.taaseenahmed.eco_budget.dto.response.CategoryDTO;
import com.taaseenahmed.eco_budget.entity.AppUser;
import com.taaseenahmed.eco_budget.entity.Category;
import com.taaseenahmed.eco_budget.repository.AppUserRepository;
import com.taaseenahmed.eco_budget.repository.CategoryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CategoryService {

    private final CategoryRepository categoryRepository;
    private final AppUserRepository appUserRepository;
    private final ChatGPTService chatGPTService;

    // Get all categories for a user (returning CategoryDTOs)
    public List<CategoryDTO> getCategoriesForUser(String userEmail) {
        AppUser user = appUserRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));

        List<Category> categories = categoryRepository.findByUserIdOrUserIsNull(user.getId());

        // Map Category to CategoryDTO (passing both id and name)
        return categories.stream()
                .map(category -> new CategoryDTO(category.getId(), category.getName(), category.getCarbonMultiplier()))
                .collect(Collectors.toList());
    }

    // Add a new category for a user (returning CategoryDTO)
    public CategoryDTO addCategory(String categoryName, String userEmail) {
        AppUser user = appUserRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Request carbon multiplier from ChatGPT
        Double carbonMultiplier = getCarbonMultiplier(categoryName);

        Category category = new Category();
        category.setName(categoryName);
        category.setUser(user);
        category.setCarbonMultiplier(carbonMultiplier); // Set the ChatGPT-derived carbon multiplier

        // Save the category and get the saved entity
        Category savedCategory = categoryRepository.save(category);

        return new CategoryDTO(savedCategory.getId(), savedCategory.getName(), savedCategory.getCarbonMultiplier());
    }

    // Fetch a category by ID
    public Category getCategoryById(Long categoryId) {
        return categoryRepository.findById(categoryId)
                .orElseThrow(() -> new RuntimeException("Category not found"));
    }

    // Create a prompt for carbon multiplier
    private String createCarbonMultiplierPrompt(String categoryName) {
        return String.format("Provide a single numeric carbon footprint multiplier in kilograms of CO2 per dollar spent for a transaction in the '%s' category. Only provide the numeric multiplier.", categoryName);
    }

    // Get carbon multiplier from ChatGPTService
    public Double getCarbonMultiplier(String categoryName) {
        String prompt = createCarbonMultiplierPrompt(categoryName);
        return chatGPTService.getCarbonMultiplier(prompt);
    }
}
