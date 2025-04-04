package com.taaseenahmed.eco_budget.repository;

import com.taaseenahmed.eco_budget.entity.Category;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CategoryRepository extends JpaRepository<Category, Long> {
    List<Category> findByUserIdOrUserIsNull(Long userId); // Fetch predefined and user-specific categories
}
