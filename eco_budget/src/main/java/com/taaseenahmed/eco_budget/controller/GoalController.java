package com.taaseenahmed.eco_budget.controller;

import com.taaseenahmed.eco_budget.dto.response.GoalDTO;
import com.taaseenahmed.eco_budget.service.GoalService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;
import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/api/goal")
@RequiredArgsConstructor
public class GoalController {

    private final GoalService goalService;

    @PostMapping("/create")
    public ResponseEntity<GoalDTO> createGoal(@RequestBody GoalDTO goalDTO, Principal principal) {
        GoalDTO response = goalService.createGoal(goalDTO, principal.getName());
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/user")
    public ResponseEntity<List<GoalDTO>> getGoalsByAuthenticatedUser(Principal principal) {
        List<GoalDTO> goalDTOList = goalService.getGoalByUserEmail(principal.getName());
        return ResponseEntity.ok(goalDTOList);
    }

    @GetMapping("/{id}")
    public ResponseEntity<GoalDTO> getGoalById(@PathVariable Long id) {
        GoalDTO goalDTO = goalService.getGoalById(id);
        return ResponseEntity.ok(goalDTO);
    }

    @PutMapping("/{id}")
    public ResponseEntity<GoalDTO> updateGoal(@PathVariable Long id, @Valid @RequestBody GoalDTO goalDTO) {
        GoalDTO updatedGoal = goalService.updateGoal(id, goalDTO);
        return ResponseEntity.ok(updatedGoal);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteGoal(@PathVariable Long id) {
        goalService.deleteGoal(id);
        return ResponseEntity.noContent().build();
    }
}
