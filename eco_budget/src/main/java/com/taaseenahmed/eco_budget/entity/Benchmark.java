package com.taaseenahmed.eco_budget.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Benchmark {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private AppUser appUser;

    @ElementCollection
    @CollectionTable(name = "benchmark_list", joinColumns = @JoinColumn(name = "benchmark_id"))
    @Column(name = "benchmarks", length = 1000) // Increase length
    private List<String> benchmarks;

    private LocalDateTime lastUpdated;

    public Benchmark(AppUser appUser) {
        this.appUser = appUser;
        this.benchmarks = new ArrayList<>();
        this.lastUpdated = LocalDateTime.now();
    }
}
