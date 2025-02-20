package com.taaseenahmed.eco_budget.Benchmark;

import lombok.AllArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.security.Principal;

@RestController
@RequestMapping("/api/benchmarks")
@AllArgsConstructor
public class BenchmarkController {

    private final BenchmarkService benchmarkService;

    @GetMapping
    public ResponseEntity<BenchmarkDTO> getBenchmarks(Principal principal) {
        BenchmarkDTO response = benchmarkService.createBenchmarkResponse(principal.getName());
        return ResponseEntity.ok(response);
    }
}
