package com.taaseenahmed.eco_budget.Benchmark;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class BenchmarkDTO {
    private List<String> benchmarks;
}
