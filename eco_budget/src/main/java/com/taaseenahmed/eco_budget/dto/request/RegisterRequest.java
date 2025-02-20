package com.taaseenahmed.eco_budget.dto.request;

import com.taaseenahmed.eco_budget.entity.Role;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;


//This class is a DTO (Data Transfer Object) used to collect user registration data from the client.
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class RegisterRequest {
    private String firstName;
    private String lastName;
    private String email;
    private String password;
    private Role role;
}