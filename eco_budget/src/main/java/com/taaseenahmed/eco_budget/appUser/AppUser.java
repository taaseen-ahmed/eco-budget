package com.taaseenahmed.eco_budget.appUser;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.List;

// A JPA entity representing an application user with user-related attributes.
// Implements the UserDetails interface to integrate with Spring Security.
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
public class AppUser implements UserDetails {

    @Id
    @GeneratedValue // Auto-generate the primary key value
    private Integer id;

    private String firstName;
    private String lastName;
    private String email; // Used as the username for authentication
    private String password;

    @Enumerated(EnumType.STRING) // Store role as a string (e.g., "ADMIN" or "USER")
    private Role role;

    // Provide the user's authorities (permissions) based on their role
    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return List.of(new SimpleGrantedAuthority(role.name()));
    }

    // Define email as the username used for authentication
    @Override
    public String getUsername() {
        return email;
    }

    // Indicate that the account is active and unrestricted (no additional restrictions applied)
    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return true;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return true;
    }
}