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

        // Convert List<Category> to List<CategoryDTO>
        return categories.stream()
                .map(category -> new CategoryDTO(category.getName()))
                .collect(Collectors.toList());
    }

    // Add a new category for a user (returning CategoryDTO)
    public CategoryDTO addCategory(String categoryName, String userEmail) {
        AppUser user = appUserRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Category category = new Category();
        category.setName(categoryName);
        category.setUser(user);

        Category savedCategory = categoryRepository.save(category);

        // Convert the saved Category entity to CategoryDTO
        return new CategoryDTO(savedCategory.getName());
    }
}
