package com.taaseenahmed.eco_budget.AppUser;

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

// Represents a user in the application and integrates with Spring Security for authentication/authorization.
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
public class AppUser implements UserDetails {

    @Id
    @GeneratedValue // Automatically generates unique primary keys for each user.
    private Long id;

    private String firstName;
    private String lastName;
    private String email; // Acts as the username for Spring Security authentication.
    private String password;

    @Enumerated(EnumType.STRING) // Stores the role (e.g., "USER", "ADMIN") as a string in the database.
    private Role role;

    @Column(nullable = false)
    private boolean transactionsUpdatedForRecommendations;

    @Column(nullable = false)
    private boolean transactionsUpdatedForBenchmarks;

    // Returns the authorities granted to the user, based on their role.
    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return List.of(new SimpleGrantedAuthority(role != null ? role.name() : "ROLE_USER"));
    }

    // Overrides to specify that email is used as the username.
    @Override
    public String getUsername() {
        return email;
    }

    // Indicates that the account is valid and unrestricted (non-expired).
    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    // Indicates that the account is not locked.
    @Override
    public boolean isAccountNonLocked() {
        return true;
    }

    // Indicates that the credentials (password) are valid and not expired.
    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    // Indicates whether the account is enabled (active and usable).
    @Override
    public boolean isEnabled() {
        return true;
    }
}
