package com.taaseenahmed.eco_budget.Recommendation;

import com.taaseenahmed.eco_budget.AppUser.AppUser;
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
public class Recommendation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private AppUser appUser;


    @ElementCollection
    @CollectionTable(name = "recommendation_spending_recommendations", joinColumns = @JoinColumn(name = "recommendation_id"))
    @Column(name = "spending_recommendations", length = 1000) // Increase length
    private List<String> spendingRecommendations;

    @ElementCollection
    @CollectionTable(name = "recommendation_carbon_footprint_recommendations", joinColumns = @JoinColumn(name = "recommendation_id"))
    @Column(name = "carbon_footprint_recommendations", length = 1000) // Increase length
    private List<String> carbonFootprintRecommendations;

    private LocalDateTime lastUpdated;

    public Recommendation(AppUser appUser) {
        this.appUser = appUser;
        this.spendingRecommendations = new ArrayList<>();
        this.carbonFootprintRecommendations = new ArrayList<>();
        this.lastUpdated = LocalDateTime.now();
    }
}
