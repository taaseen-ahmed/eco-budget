package com.taaseenahmed.eco_budget.Authentication;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

// Marks this class as a REST controller that handles HTTP requests and returns JSON responses.
@RestController
@RequestMapping(path = "/api/public/auth")
@RequiredArgsConstructor // Automatically generates a constructor for final fields (used for Dependency Injection).
public class AuthenticationController {

    // Service layer handling the core authentication and registration logic.
    private final AuthenticationService authenticationService;

    @PostMapping("/register")
    public ResponseEntity<AuthenticationResponse> register(@RequestBody RegisterRequest request) {
        // Calls the service to process the registration and returns the result in an HTTP response.
        return ResponseEntity.ok(authenticationService.register(request));
    }

    @PostMapping("/authenticate")
    public ResponseEntity<AuthenticationResponse> authenticate(@RequestBody AuthenticationRequest request) {
        // Calls the service to process the login and returns the result in an HTTP response.
        return ResponseEntity.ok(authenticationService.authenticate(request));
    }
}