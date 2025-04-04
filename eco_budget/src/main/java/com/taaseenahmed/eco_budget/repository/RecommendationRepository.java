package com.taaseenahmed.eco_budget.repository;
import com.taaseenahmed.eco_budget.entity.Recommendation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface RecommendationRepository extends JpaRepository<Recommendation, Long> {
    Optional<Recommendation> findByAppUserEmail(String email);
}
