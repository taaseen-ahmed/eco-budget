package com.taaseenahmed.eco_budget.Config;

import com.taaseenahmed.eco_budget.AppUser.AppUserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
@RequiredArgsConstructor
public class ApplicationConfig {

    private final AppUserRepository repository; // Repository for accessing user data.

    // Bean to provide user details to Spring Security for authentication.
    @Bean
    public UserDetailsService userDetailsService() {
        return username -> repository.findByEmail(username) // Find user by email (used as username).
                .orElseThrow(() -> new UsernameNotFoundException("User not found")); // Throw exception if user is not found.
    }

    // Bean to configure the authentication provider (how Spring validates user credentials).
    @Bean
    public AuthenticationProvider authenticationProvider() {
        DaoAuthenticationProvider authProvider = new DaoAuthenticationProvider();
        authProvider.setUserDetailsService(userDetailsService()); // Uses the UserDetailsService for fetching user details.
        authProvider.setPasswordEncoder(passwordEncoder()); // Uses the password encoder for password validation.
        return authProvider;
    }

    // Bean to create an AuthenticationManager, which coordinates authentication processes.
    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration configuration) throws Exception {
        return configuration.getAuthenticationManager(); // Provides the default AuthenticationManager from the configuration.
    }

    // Bean to define the password encoder, using BCrypt for secure password hashing.
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder(); // Encodes passwords using the BCrypt hashing algorithm.
    }
}