package com.taaseenahmed.eco_budget.Config;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.NonNull;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtService jwtService; // Service to handle JWT-related tasks (e.g., token generation, validation).
    private final UserDetailsService userDetailsService; // Service to load user details from the database.

    // This method is called to filter incoming HTTP requests and process JWT authentication.
    @Override
    protected void doFilterInternal(@NonNull HttpServletRequest request, @NonNull HttpServletResponse response, @NonNull FilterChain filterChain) throws ServletException, IOException {
        final String authHeader = request.getHeader("Authorization"); // Get the "Authorization" header from the request.
        final String jwt; // Variable to hold the JWT token.
        final String userEmail; // Variable to hold the extracted email from the JWT.

        // Check if the Authorization header exists and starts with "Bearer ".
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            filterChain.doFilter(request, response); // If no JWT, continue the filter chain without authentication.
            return;
        }

        jwt = authHeader.substring(7); // Extract the JWT token (after "Bearer ").
        userEmail = jwtService.extractUsername(jwt); // Extract the username (email) from the JWT token.

        // If the userEmail is not null and the current authentication context is empty (no active authentication).
        if (userEmail != null && SecurityContextHolder.getContext().getAuthentication() == null) {
            // Load the user details from the database based on the extracted email.
            UserDetails userDetails = this.userDetailsService.loadUserByUsername(userEmail);
            // Check if the JWT is valid for the user.
            if (jwtService.isTokenValid(jwt, userDetails)) {
                // Create an authentication token using the user details.
                UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities());
                // Set additional details for the authentication token.
                authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                // Set the authentication token in the SecurityContext, effectively logging the user in.
                SecurityContextHolder.getContext().setAuthentication(authToken);
            }
        }
        // Proceed with the filter chain (allow the request to continue to the next filter or endpoint).
        filterChain.doFilter(request, response);
    }
}