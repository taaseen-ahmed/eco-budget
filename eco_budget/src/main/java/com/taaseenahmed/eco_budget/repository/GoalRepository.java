package com.taaseenahmed.eco_budget.repository;

import com.taaseenahmed.eco_budget.entity.AppUser;
import com.taaseenahmed.eco_budget.entity.Goal;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface GoalRepository extends JpaRepository<Goal, Long> {
    List<Goal> findByAppUser(AppUser appUser);
}
