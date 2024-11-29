package com.taaseenahmed.eco_budget.Authentication;

import com.taaseenahmed.eco_budget.AppUser.AppUserRepository;
import com.taaseenahmed.eco_budget.AppUser.Role;
import com.taaseenahmed.eco_budget.AppUser.AppUser;
import com.taaseenahmed.eco_budget.Config.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthenticationService {

    private final AppUserRepository userRepository; // Handles user data persistence.
    private final PasswordEncoder passwordEncoder; // Hashes and verifies passwords.
    private final JwtService jwtService; // Manages JWT creation and validation.
    private final AuthenticationManager authenticationManager; // Manages authentication.

    // Registers a new user, saves them to the database, and generates a JWT.
    public AuthenticationResponse register(RegisterRequest request) {
        var user = AppUser.builder()
                .firstName(request.getFirstName())
                .lastName(request.getLastName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword())) // Hashes the password.
                .role(Role.USER) // Assigns default "USER" role.
                .build();
        userRepository.save(user); // Save the user in the database.
        var jwtToken = jwtService.generateToken(user); // Generate a JWT for the new user.
        return AuthenticationResponse.builder().token(jwtToken).build();
    }

    // Authenticates a user by validating credentials and issuing a JWT.
    public AuthenticationResponse authenticate(AuthenticationRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getEmail(), request.getPassword()
                )
        ); // Verifies the user's credentials.
        var user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(); // Finds the user or throws an exception if not found.
        var jwtToken = jwtService.generateToken(user); // Generate a JWT for the authenticated user.
        return AuthenticationResponse.builder().token(jwtToken).build();
    }
}