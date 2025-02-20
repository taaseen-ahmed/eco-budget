package com.taaseenahmed.eco_budget.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

// Data Transfer Object (DTO) for transactions, used to expose relevant data in API responses.
@Data
@Builder
@AllArgsConstructor
public class TransactionDTO {
    private Long id;
    private AppUserDTO appUser;
    private BigDecimal amount;
    private CategoryDTO category;
    private String type;
    private LocalDateTime date;
    private String description;
    private Double carbonFootprint;
    private Boolean isChatGPTDerivedCarbonFootprint;
    private Double carbonMultiplierUsed;
}
