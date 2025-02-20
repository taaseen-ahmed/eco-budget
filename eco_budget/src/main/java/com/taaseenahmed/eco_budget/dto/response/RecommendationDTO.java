package com.taaseenahmed.eco_budget.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class RecommendationDTO {
    private List<String> spendingRecommendations;
    private List<String> carbonFootprintRecommendations;
}
