package com.taaseenahmed.eco_budget.authentication;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

// Marks this class as a REST controller, which handles HTTP requests and returns JSON responses.
@RestController
// Specifies the base URL path for all endpoints in this controller.
@RequestMapping(path = "/api/public/auth")
// Generates a constructor automatically for any final fields in the class (Dependency Injection).
@RequiredArgsConstructor
public class AuthenticationController {

    // Service to handle authentication and registration logic.
    private final AuthenticationService authenticationService;

    // Endpoint for user registration.
    @PostMapping("/register")
    public ResponseEntity<AuthenticationResponse> register(@RequestBody RegisterRequest request) {
        // Delegates the registration logic to the AuthenticationService and returns the result as a response.
        return ResponseEntity.ok(authenticationService.register(request));
    }

    // Endpoint for user authentication (login).
    @PostMapping("/authenticate")
    public ResponseEntity<AuthenticationResponse> register(@RequestBody AuthenticationRequest request) {
        // Delegates the authentication logic to the AuthenticationService and returns the result as a response.
        return ResponseEntity.ok(authenticationService.authenticate(request));
    }
}