package com.taaseenahmed.eco_budget.Recommendation;

import lombok.AllArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.security.Principal;
import java.util.Collections;
import java.util.List;

@RestController
@RequestMapping("/api/recommendations")
@AllArgsConstructor
public class RecommendationController {

    private final RecommendationService recommendationService;

    @GetMapping("/spending")
    public ResponseEntity<List<String>> getSpendingRecommendations(Principal principal) {
        try {
            Recommendation recommendation = recommendationService.getRecommendationsForUser(principal.getName());
            if (recommendation != null && !recommendation.getSpendingRecommendations().isEmpty()) {
                return ResponseEntity.ok(recommendation.getSpendingRecommendations());
            } else {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(Collections.singletonList("Spending recommendations not found."));
            }
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Collections.singletonList("Error fetching spending recommendations: " + e.getMessage()));
        }
    }

    @GetMapping("/carbon-footprint")
    public ResponseEntity<List<String>> getCarbonFootprintRecommendations(Principal principal) {
        try {
            Recommendation recommendation = recommendationService.getRecommendationsForUser(principal.getName());
            if (recommendation != null && !recommendation.getCarbonFootprintRecommendations().isEmpty()) {
                return ResponseEntity.ok(recommendation.getCarbonFootprintRecommendations());
            } else {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(Collections.singletonList("Carbon footprint recommendations not found."));
            }
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Collections.singletonList("Error fetching carbon footprint recommendations: " + e.getMessage()));
        }
    }
}
