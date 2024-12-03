package com.taaseenahmed.eco_budget.Category;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/api/categories")
@RequiredArgsConstructor
public class CategoryController {

    private final CategoryService categoryService;

    @GetMapping
    public ResponseEntity<List<CategoryDTO>> getCategories(Principal principal) {
        if (principal == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        // Fetch categories for the logged-in user
        List<CategoryDTO> categoryDTOs = categoryService.getCategoriesForUser(principal.getName());

        // Return the list of CategoryDTO objects
        return ResponseEntity.ok(categoryDTOs);
    }

    // Add a new category for a user
    @PostMapping
    public ResponseEntity<CategoryDTO> addCategory(@RequestBody CategoryDTO categoryDTO, Principal principal) {
        if (principal == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        // Add the new category and get the result as CategoryDTO
        CategoryDTO savedCategoryDTO = categoryService.addCategory(categoryDTO.getName(), principal.getName());

        // Return the created CategoryDTO with a CREATED status
        return ResponseEntity.status(HttpStatus.CREATED).body(savedCategoryDTO);
    }
}
