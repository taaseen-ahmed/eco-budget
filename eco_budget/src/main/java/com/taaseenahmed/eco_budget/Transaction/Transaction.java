package com.taaseenahmed.eco_budget.Transaction;

import com.taaseenahmed.eco_budget.AppUser.AppUser;
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
    @GeneratedValue(strategy = GenerationType.IDENTITY) // Auto-generate the primary key.
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY) // Defines a many-to-one relationship with AppUser.
    @JoinColumn(name = "user_id", nullable = false) // Maps to the 'user_id' column in the database.
    private AppUser appUser;

    private BigDecimal amount;
    private String category;
    private String type;
    private LocalDateTime date;
    private String description;
}
