package com.assurance.sante.connect.service;

import com.assurance.sante.connect.dto.UserDto;
import com.assurance.sante.connect.entity.User;
import com.assurance.sante.connect.repository.UserRepository;
import com.assurance.sante.connect.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;

    public List<UserDto> getAllUsers() {
        return userRepository.findAll().stream()
            .map(UserDto::fromEntity)
            .collect(Collectors.toList());
    }

    public UserDto getUserById(Long id) {
        User user = userRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));
        return UserDto.fromEntity(user);
    }

    public UserDto updateUser(Long id, UserDto userDto) {
        User user = userRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));

        if (userDto.getFullName() != null) {
            user.setFullName(userDto.getFullName());
        }
        if (userDto.getOrganization() != null) {
            user.setOrganization(userDto.getOrganization());
        }
        if (userDto.getStatus() != null) {
            user.setStatus(User.UserStatus.valueOf(userDto.getStatus().toUpperCase()));
        }
        if (userDto.getRole() != null) {
            user.setRole(User.UserRole.valueOf(userDto.getRole().toUpperCase()));
        }

        user = userRepository.save(user);
        return UserDto.fromEntity(user);
    }

    public void deleteUser(Long id) {
        User user = userRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));
        userRepository.delete(user);
    }
}
