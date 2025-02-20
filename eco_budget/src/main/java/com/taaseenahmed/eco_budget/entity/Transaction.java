package com.taaseenahmed.eco_budget.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

// Represents a financial transaction entity.
@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
@Builder
public class Transaction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private AppUser appUser;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "category_id", nullable = false)
    private Category category;

    private BigDecimal amount;
    private String type;
    private LocalDateTime date;
    private String description;

    @Column
    private Double carbonFootprint;

    @Column(nullable = false)
    private boolean isChatGPTDerivedCarbonFootprint; // Indicates if the carbon footprint was derived using ChatGPT

    private Double carbonMultiplierUsed;
}
