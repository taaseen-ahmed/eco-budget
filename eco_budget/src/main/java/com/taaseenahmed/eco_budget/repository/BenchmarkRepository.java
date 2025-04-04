package com.taaseenahmed.eco_budget.repository;

import com.taaseenahmed.eco_budget.entity.Benchmark;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface BenchmarkRepository extends JpaRepository<Benchmark, Long> {
    Optional<Benchmark> findByAppUserEmail(String email);
}
