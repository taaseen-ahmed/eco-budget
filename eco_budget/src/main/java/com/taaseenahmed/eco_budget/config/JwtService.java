package com.taaseenahmed.eco_budget.config;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import java.security.Key;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.function.Function;

@Service
public class JwtService {

    private static final String SECRET_KEY = "cf2455bc8d76a0d8ef57602ec13254ea5ea1e572ed62694db87cc616c7d2faf3"; // Secret key used to sign JWTs.

    // Extracts the username (subject) from the JWT token.
    public String extractUsername(String token) {
        return extractClaim(token, Claims::getSubject); // Claims::getSubject extracts the subject (username).
    }

    // Extracts a specific claim from the JWT token (e.g., username, expiration date).
    public <T> T extractClaim(String token, Function<Claims, T> claimsResolver) {
        final Claims claims = extractAllClaims(token); // Extract all claims from the token.
        return claimsResolver.apply(claims); // Apply the claims resolver function to get the required claim.
    }

    // Generates a JWT token for a user based on their details.
    public String generateToken(UserDetails userDetails){
        return generateToken(new HashMap<>(), userDetails); // Default call with no extra claims.
    }

    // Generates a JWT token with additional claims for a user.
    public String generateToken(Map<String, Object> extraClaims, UserDetails userDetails){
        // Building the JWT token with subject, issued date, expiration, extra claims, and signing key.
        return Jwts.builder()
                .setClaims(extraClaims) // Add extra claims if any.
                .setSubject(userDetails.getUsername()) // Set the subject as the username.
                .setIssuedAt(new Date(System.currentTimeMillis())) // Set issue date to current time.
                .setExpiration(new Date(System.currentTimeMillis() + 1000 * 60 * 24)) // Set expiration to 24 hours from now.
                .signWith(getSignInKey(), SignatureAlgorithm.HS256) // Sign the JWT with HMAC SHA-256 algorithm.
                .compact(); // Generate and return the compact JWT string.
    }

    // Validates if the JWT token is still valid based on the username and expiration.
    public boolean isTokenValid(String token, UserDetails userDetails){
        final String username = extractUsername(token); // Extract username from the token.
        return (username.equals(userDetails.getUsername()) && !isTokenExpired(token)); // Ensure username matches and token is not expired.
    }

    // Checks if the token has expired.
    private boolean isTokenExpired(String token) {
        return extractExpiration(token).before(new Date()); // Compare expiration date with the current time.
    }

    // Extracts the expiration date from the token.
    private Date extractExpiration(String token) {
        return extractClaim(token, Claims::getExpiration); // Use Claims::getExpiration to extract the expiration date.
    }

    // Extracts all claims from the JWT token.
    private Claims extractAllClaims(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(getSignInKey()) // Set the signing key for decoding the token.
                .build()
                .parseClaimsJws(token) // Parse the JWT token and extract the claims.
                .getBody(); // Get the body of the claims.
    }

    // Retrieves the signing key used for signing and verifying the JWT.
    private Key getSignInKey() {
        byte[] keyBytes = Decoders.BASE64.decode(SECRET_KEY); // Decode the base64 encoded secret key.
        return Keys.hmacShaKeyFor(keyBytes); // Create a HMAC key for SHA algorithm from the decoded secret key.
    }
}