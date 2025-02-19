package com.taaseenahmed.eco_budget.Goal;

import com.taaseenahmed.eco_budget.AppUser.AppUser;
import com.taaseenahmed.eco_budget.AppUser.AppUserRepository;
import com.taaseenahmed.eco_budget.Budget.Budget;
import com.taaseenahmed.eco_budget.Budget.BudgetDTO;
import com.taaseenahmed.eco_budget.Category.Category;
import com.taaseenahmed.eco_budget.Category.CategoryService;
import com.taaseenahmed.eco_budget.Transaction.Transaction;
import com.taaseenahmed.eco_budget.Transaction.TransactionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class GoalService {

    private final GoalRepository goalRepository;
    private final AppUserRepository appUserRepository;
    private final CategoryService categoryService;
    private final TransactionRepository transactionRepository;

    // Create a new budget for the authenticated user
    public GoalDTO createGoal(GoalDTO goalDTO, String userEmail) {
        AppUser user = appUserRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Category category = categoryService.getCategoryById(goalDTO.getCategoryId());

        Goal goal = new Goal();
        goal.setAppUser(user);
        goal.setCategory(category);
        goal.setAmount(goalDTO.getAmount());
        goal.setStartDate(goalDTO.getStartDate());
        goal.setEndDate(goalDTO.getEndDate());

        Goal savedGoal = goalRepository.save(goal);
        return convertToDTO(savedGoal);
    }

    public List<GoalDTO> getGoalByUserEmail(String userEmail) {
        AppUser user = appUserRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));

        List<Goal> goals = goalRepository.findByAppUser(user);
        return goals.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public GoalDTO getGoalById(Long goalId) {
        Goal goal = goalRepository.findById(goalId)
                .orElseThrow(() -> new RuntimeException("Goal not found for ID: " + goalId));
        return convertToDTO(goal);
    }

    public GoalDTO updateGoal(Long id, GoalDTO goalDTO) {
        Goal goal = goalRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Goal not found for ID: " + id));

        Category category = categoryService.getCategoryById(goalDTO.getCategoryId());

        goal.setAmount(goalDTO.getAmount());
        goal.setCategory(category);
        goal.setStartDate(goalDTO.getStartDate());
        goal.setEndDate(goalDTO.getEndDate());

        // Save and return the updated goal as a DTO
        Goal updatedGoal = goalRepository.save(goal);
        return convertToDTO(updatedGoal);
    }

    // Delete a Goal by its ID
    public void deleteGoal(Long id) {
        Goal goal = goalRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Goal not found for ID: " + id));
        goalRepository.delete(goal);
    }

    public Double calculateTotalCarbonFootprint(Long categoryId, LocalDateTime startDate, LocalDateTime endDate) {
        List<Transaction> transactions = transactionRepository.findByCategoryIdAndDateBetween(categoryId, startDate, endDate);
        return transactions.stream()
                .map(transaction -> BigDecimal.valueOf(transaction.getCarbonFootprint()))
                .reduce(BigDecimal.ZERO, BigDecimal::add)
                .doubleValue();
    }

    private GoalDTO convertToDTO(Goal goal) {
        GoalDTO dto = new GoalDTO();
        dto.setId(goal.getId());
        dto.setCategoryId(goal.getCategory().getId());
        dto.setCategoryName(goal.getCategory().getName());
        dto.setAmount(goal.getAmount());
        dto.setStartDate(goal.getStartDate());
        dto.setEndDate(goal.getEndDate());
        dto.setTotalCarbonFootprint(calculateTotalCarbonFootprint(goal.getCategory().getId(), goal.getStartDate(), goal.getEndDate())); // Set totalSpent
        return dto;
    }
}
