package com.taaseenahmed.eco_budget.Budget;

import lombok.Data;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Data
@Getter
@Setter
public class BudgetDTO {
    private Long id;
    private Long categoryId;
    private String categoryName;
    private Double amount;
}
