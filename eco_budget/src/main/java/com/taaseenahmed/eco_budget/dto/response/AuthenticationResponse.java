package com.taaseenahmed.eco_budget.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class AuthenticationResponse {
    // The JSON Web Token generated upon successful authentication or registration.
    private String token;
}