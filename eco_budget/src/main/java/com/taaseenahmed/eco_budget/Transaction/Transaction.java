package com.taaseenahmed.eco_budget.Transaction;

import com.taaseenahmed.eco_budget.AppUser.AppUser;
import com.taaseenahmed.eco_budget.Category.Category;
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

    @ManyToOne(fetch = FetchType.EAGER) // Use EAGER fetch because you’ll often need the category details with transactions.
    @JoinColumn(name = "category_id", nullable = false) // Maps to the 'category_id' column in the database.
    private Category category; // Link the Transaction entity to the Category entity.

    private BigDecimal amount;
    private String type;
    private LocalDateTime date;
    private String description;
}
