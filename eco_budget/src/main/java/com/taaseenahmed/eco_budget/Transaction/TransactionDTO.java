package com.taaseenahmed.eco_budget.Transaction;

import com.taaseenahmed.eco_budget.AppUser.AppUserDTO;
import com.taaseenahmed.eco_budget.Category.CategoryDTO;
import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

// Data Transfer Object (DTO) for transactions, used to expose relevant data in API responses.
@Data
@Builder
public class TransactionDTO {
    private Long id;
    private AppUserDTO appUser;
    private BigDecimal amount;
    private CategoryDTO category;
    private String type;
    private LocalDateTime date;
    private String description;
    private Double carbonFootprint;
}
