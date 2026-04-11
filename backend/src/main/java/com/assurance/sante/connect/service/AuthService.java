package com.assurance.sante.connect.service;

import com.assurance.sante.connect.dto.LoginRequest;
import com.assurance.sante.connect.dto.RegisterRequest;
import com.assurance.sante.connect.dto.AuthResponse;
import com.assurance.sante.connect.dto.UserDto;
import com.assurance.sante.connect.entity.User;
import com.assurance.sante.connect.repository.UserRepository;
import com.assurance.sante.connect.security.JwtTokenProvider;
import com.assurance.sante.connect.exception.UnauthorizedException;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;

    public AuthResponse login(LoginRequest request) {
        Optional<User> user = userRepository.findByEmail(request.getEmail());
        
        if (user.isEmpty() || !passwordEncoder.matches(request.getPassword(), user.get().getPassword())) {
            throw new UnauthorizedException("Invalid email or password");
        }

        String token = jwtTokenProvider.generateToken(user.get().getEmail());
        return AuthResponse.builder()
            .user(UserDto.fromEntity(user.get()))
            .token(token)
            .build();
    }

    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new IllegalArgumentException("Email already exists");
        }

        User user = User.builder()
            .email(request.getEmail())
            .password(passwordEncoder.encode(request.getPassword()))
            .fullName(request.getFullName())
            .role(User.UserRole.valueOf(request.getRole().toUpperCase()))
            .organization(request.getOrganization())
            .telephone(request.getTelephone())
            .adresse(request.getAdresse())
            .status(User.UserStatus.PENDING)
            .build();

        user = userRepository.save(user);
        String token = jwtTokenProvider.generateToken(user.getEmail());

        return AuthResponse.builder()
            .user(UserDto.fromEntity(user))
            .token(token)
            .build();
    }

    public UserDto getCurrentUser(String email) {
        Optional<User> user = userRepository.findByEmail(email);
        if (user.isEmpty()) {
            throw new UnauthorizedException("User not found");
        }
        return UserDto.fromEntity(user.get());
    }
}
