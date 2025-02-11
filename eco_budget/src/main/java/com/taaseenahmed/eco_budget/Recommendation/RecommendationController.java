package com.taaseenahmed.eco_budget.Recommendation;

import lombok.AllArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.security.Principal;


@RestController
@RequestMapping("/api/recommendations")
@AllArgsConstructor
public class RecommendationController {

    private final RecommendationService recommendationService;

    @GetMapping("/spending")
    public ResponseEntity<RecommendationDTO> getSpendingRecommendations(Principal principal) {
        RecommendationDTO response = recommendationService.createSpendingResponse(principal.getName());
        return ResponseEntity.ok(response);
    }

    @GetMapping("/carbon-footprint")
    public ResponseEntity<RecommendationDTO> getCarbonFootprintRecommendations(Principal principal) {
        RecommendationDTO response = recommendationService.createCarbonFootprintResponse(principal.getName());
        return ResponseEntity.ok(response);
    }
}
