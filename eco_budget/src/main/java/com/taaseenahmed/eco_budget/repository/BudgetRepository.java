package com.taaseenahmed.eco_budget.repository;

import com.taaseenahmed.eco_budget.entity.AppUser;
import com.taaseenahmed.eco_budget.entity.Budget;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BudgetRepository extends JpaRepository<Budget, Long> {
    List<Budget> findByAppUser(AppUser appUser);
}
