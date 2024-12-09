package com.taaseenahmed.eco_budget.Category;

import com.taaseenahmed.eco_budget.AppUser.AppUser;
import com.taaseenahmed.eco_budget.AppUser.AppUserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CategoryService {

    private final CategoryRepository categoryRepository;
    private final AppUserRepository appUserRepository;

    // Get all categories for a user (returning CategoryDTOs)
    public List<CategoryDTO> getCategoriesForUser(String userEmail) {
        AppUser user = appUserRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));

        List<Category> categories = categoryRepository.findByUserIdOrUserIsNull(user.getId());

        // Map Category to CategoryDTO (passing both id and name)
        return categories.stream()
                .map(category -> new CategoryDTO(category.getId(), category.getName())) // Pass both id and name
                .collect(Collectors.toList());
    }

    // Add a new category for a user (returning CategoryDTO)
    public CategoryDTO addCategory(String categoryName, String userEmail) {
        AppUser user = appUserRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Category category = new Category();
        category.setName(categoryName);
        category.setUser(user);

        // Save the category and get the saved entity
        Category savedCategory = categoryRepository.save(category);

        // Convert the saved Category entity to CategoryDTO with both id and name
        return new CategoryDTO(savedCategory.getId(), savedCategory.getName());
    }

    // Fetch a category by ID
    public Category getCategoryById(Long categoryId) {
        return categoryRepository.findById(categoryId)
                .orElseThrow(() -> new RuntimeException("Category not found"));
    }
}
