package com.taaseenahmed.eco_budget.Budget;

import com.taaseenahmed.eco_budget.AppUser.AppUser;
import com.taaseenahmed.eco_budget.AppUser.AppUserRepository;
import com.taaseenahmed.eco_budget.Category.Category;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class BudgetService {

    private final BudgetRepository budgetRepository;
    private final AppUserRepository appUserRepository;

    // Create a new budget for the authenticated user
    public BudgetDTO createBudget(Budget budget, String userEmail) {
        AppUser user = appUserRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));
        budget.setAppUser(user); // Set the user to the budget
        Budget savedBudget = budgetRepository.save(budget); // Save the budget
        return convertToDTO(savedBudget); // Convert and return the saved budget as a DTO
    }

    public List<BudgetDTO> getBudgetsByUserEmail(String userEmail) {
        // Find the user based on the email
        AppUser user = appUserRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Find budgets for the user
        List<Budget> budgets = budgetRepository.findByAppUser(user);

        // Convert each budget entity to a DTO, including category details
        return budgets.stream()
                .map(budget -> {
                    BudgetDTO dto = convertToDTO(budget);
                    // Set category details in the DTO
                    Category category = budget.getCategory();
                    dto.setCategoryId(category.getId());
                    dto.setCategoryName(category.getName());
                    return dto;
                })
                .collect(Collectors.toList());
    }


    // Fetch a budget by its ID
    public BudgetDTO getBudgetById(Long budgetId) {
        Budget budget = budgetRepository.findById(budgetId)
                .orElseThrow(() -> new RuntimeException("Budget not found for ID: " + budgetId));
        return convertToDTO(budget); // Convert and return the budget as a DTO
    }

    // Update an existing budget
    public BudgetDTO updateBudget(Long id, BudgetDTO budgetDTO) {
        Budget budget = budgetRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Budget not found for ID: " + id));

        // Update the budget properties
        budget.setAmount(budgetDTO.getAmount());
        Category category = new Category(); // Ensure Category is set correctly
        category.setId(budgetDTO.getCategoryId());
        budget.setCategory(category);

        // Save and return the updated budget as a DTO
        Budget updatedBudget = budgetRepository.save(budget);
        return convertToDTO(updatedBudget);
    }

    // Delete a budget by its ID
    public void deleteBudget(Long id) {
        Budget budget = budgetRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Budget not found for ID: " + id));
        budgetRepository.delete(budget); // Delete the budget
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
