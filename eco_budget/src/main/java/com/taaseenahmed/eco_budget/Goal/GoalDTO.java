package com.taaseenahmed.eco_budget.Goal;

import lombok.Data;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Data
@Getter
@Setter
public class GoalDTO {
    private Long id;
    private Long categoryId;
    private String categoryName;
    private Double amount;
    private LocalDateTime startDate;
    private LocalDateTime endDate;
    private Double totalCarbonFootprint;
}
