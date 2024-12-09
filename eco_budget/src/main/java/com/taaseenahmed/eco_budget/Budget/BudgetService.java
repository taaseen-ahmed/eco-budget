package com.taaseenahmed.eco_budget.Budget;

import com.taaseenahmed.eco_budget.AppUser.AppUser;
import com.taaseenahmed.eco_budget.AppUser.AppUserRepository;
import com.taaseenahmed.eco_budget.Category.Category;
import com.taaseenahmed.eco_budget.Category.CategoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class BudgetService {

    private final BudgetRepository budgetRepository;
    private final AppUserRepository appUserRepository;
    private final CategoryService categoryService;  // Add CategoryService here

    // Create a new budget for the authenticated user
    public BudgetDTO createBudget(BudgetDTO budgetDTO, String userEmail) {
        AppUser user = appUserRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Category category = categoryService.getCategoryById(budgetDTO.getCategoryId());

        Budget budget = new Budget();
        budget.setAppUser(user);
        budget.setCategory(category);
        budget.setAmount(budgetDTO.getAmount());

        Budget savedBudget = budgetRepository.save(budget);
        return convertToDTO(savedBudget);
    }

    public List<BudgetDTO> getBudgetsByUserEmail(String userEmail) {
        AppUser user = appUserRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));

        List<Budget> budgets = budgetRepository.findByAppUser(user);
        return budgets.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public BudgetDTO getBudgetById(Long budgetId) {
        Budget budget = budgetRepository.findById(budgetId)
                .orElseThrow(() -> new RuntimeException("Budget not found for ID: " + budgetId));
        return convertToDTO(budget);
    }

    public BudgetDTO updateBudget(Long id, BudgetDTO budgetDTO) {
        Budget budget = budgetRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Budget not found for ID: " + id));

        Category category = categoryService.getCategoryById(budgetDTO.getCategoryId());

        budget.setAmount(budgetDTO.getAmount());
        budget.setCategory(category);

        // Save and return the updated budget as a DTO
        Budget updatedBudget = budgetRepository.save(budget);
        return convertToDTO(updatedBudget);
    }

    // Delete a budget by its ID
    public void deleteBudget(Long id) {
        Budget budget = budgetRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Budget not found for ID: " + id));
        budgetRepository.delete(budget);
    }

    // Convert a Budget entity to a BudgetDTO
    private BudgetDTO convertToDTO(Budget budget) {
        BudgetDTO dto = new BudgetDTO();
        dto.setId(budget.getId());
        dto.setCategoryId(budget.getCategory().getId());
        dto.setCategoryName(budget.getCategory().getName());
        dto.setAmount(budget.getAmount());
        return dto;
    }
}
