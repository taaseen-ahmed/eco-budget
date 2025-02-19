package com.taaseenahmed.eco_budget.Goal;

import com.taaseenahmed.eco_budget.AppUser.AppUser;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface GoalRepository extends JpaRepository<Goal, Long> {
    List<Goal> findByAppUser(AppUser appUser);
}
