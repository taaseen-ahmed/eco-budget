package com.taaseenahmed.eco_budget.Category;

import com.taaseenahmed.eco_budget.AppUser.AppUser;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import jakarta.persistence.*;


@Entity
@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
public class Category {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = true) // Predefined categories can have null user_id
    private AppUser user; // Null for predefined categories, non-null for user-created categories

    @Column(nullable = false)
    private String name;

    // Constructor to create categories without an AppUser (for predefined categories)
    public Category(String name) {
        this.name = name;
        this.user = null; // Set user to null for predefined categories
    }
}
