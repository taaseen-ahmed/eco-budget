package com.taaseenahmed.eco_budget.dto.request;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class AuthenticationRequest {

    // The email of the user attempting to authenticate.
    private String email;

    // The password of the user attempting to authenticate.
    private String password;
}