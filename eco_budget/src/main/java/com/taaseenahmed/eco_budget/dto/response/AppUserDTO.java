package com.taaseenahmed.eco_budget.dto.response;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

// A Data Transfer Object (DTO) for transferring user-related data between layers.
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AppUserDTO {
    private Long id;
    private String firstName;
    private String lastName;
    private String email;
    private String role;
}
