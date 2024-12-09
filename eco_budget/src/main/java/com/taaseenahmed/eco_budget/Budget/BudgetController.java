package com.taaseenahmed.eco_budget.Budget;

import com.taaseenahmed.eco_budget.Category.Category;
import com.taaseenahmed.eco_budget.Category.CategoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import javax.validation.Valid;
import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/api/budgets")
@RequiredArgsConstructor
public class BudgetController {

    private final BudgetService budgetService;
    private final CategoryService categoryService;

    @PostMapping("/create")
    public ResponseEntity<BudgetDTO> createBudget(@RequestBody BudgetDTO budgetDTO, Principal principal) {
        Category category = categoryService.getCategoryById(budgetDTO.getCategoryId());
        Budget budget = new Budget();
        budget.setCategory(category);
        budget.setAmount(budgetDTO.getAmount());
        BudgetDTO response = budgetService.createBudget(budget, principal.getName());
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/user")
    public ResponseEntity<List<BudgetDTO>> getBudgetsByAuthenticatedUser(Principal principal) {
        List<BudgetDTO> budgetDTOList = budgetService.getBudgetsByUserEmail(principal.getName());
        return ResponseEntity.ok(budgetDTOList);
    }

    @GetMapping("/{id}")
    public ResponseEntity<BudgetDTO> getBudgetById(@PathVariable Long id) {
        BudgetDTO budgetDTO = budgetService.getBudgetById(id);
        return ResponseEntity.ok(budgetDTO);
    }

    @PutMapping("/{id}")
    public ResponseEntity<BudgetDTO> updateBudget(@PathVariable Long id, @Valid @RequestBody BudgetDTO budgetDTO) {
        BudgetDTO updatedBudget = budgetService.updateBudget(id, budgetDTO);
        return ResponseEntity.ok(updatedBudget);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteBudget(@PathVariable Long id) {
        budgetService.deleteBudget(id);
        return ResponseEntity.noContent().build();
    }
}
