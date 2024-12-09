package com.taaseenahmed.eco_budget.Budget;

import com.taaseenahmed.eco_budget.AppUser.AppUser;
import com.taaseenahmed.eco_budget.Category.Category;
import jakarta.persistence.*;
import lombok.Data;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Data
@Setter
@Getter
public class Budget {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private AppUser appUser;

    @ManyToOne
    @JoinColumn(name = "category_id", nullable = false)
    private Category category;

    private Double amount;
}
