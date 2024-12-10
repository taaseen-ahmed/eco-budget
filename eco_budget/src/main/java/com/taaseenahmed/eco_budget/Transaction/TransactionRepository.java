package com.taaseenahmed.eco_budget.Transaction;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

// Repository interface for performing CRUD operations on Transaction entities.
@Repository
public interface TransactionRepository extends JpaRepository<Transaction, Long> {

    // Custom query to find transactions by a user's ID.
    List<Transaction> findByAppUserId(Long appUser_id);
    List<Transaction> findByCategoryIdAndDateBetween(Long categoryId, LocalDateTime startDate, LocalDateTime endDate);
}
