package com.taaseenahmed.eco_budget.repository;

import com.taaseenahmed.eco_budget.entity.AppUser;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

// Repository interface for AppUser entities to handle database operations.
// Extends JpaRepository to inherit basic CRUD and pagination functionality.
public interface AppUserRepository extends JpaRepository<AppUser, Long> {

    // Custom query method to find a user by their email.
    // Returns an Optional to handle cases where the user might not exist.
    Optional<AppUser> findByEmail(String email);
}
