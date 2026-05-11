package com.gamelibrary.gamelibrary.service;

import com.gamelibrary.gamelibrary.entity.User;
import com.gamelibrary.gamelibrary.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class UserServiceTest {

  @Mock
  private UserRepository userRepository;

  @Mock
  private PasswordEncoder passwordEncoder;

  @InjectMocks
  private UserService userService;

  @Test
  void addUser_ShouldHashPassword(){
    //Arrange
    User user = new User();
    user.setUsername("testUser");
    user.setPassword("plainPassword");

    when(passwordEncoder.encode("plainPassword")).thenReturn("hashedPassword");
    when(userRepository.save(any(User.class))).thenReturn(user);


    //Act
    User result = userService.addUser(user);

    //Assert
    verify(passwordEncoder).encode("plainPassword");
    verify(userRepository).save(user);
    assertNotNull(result.getCreatedAt());
  }
}
