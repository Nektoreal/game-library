package com.gamelibrary.gamelibrary.service;

import com.gamelibrary.gamelibrary.entity.GameEntry;
import com.gamelibrary.gamelibrary.entity.GameStatus;
import com.gamelibrary.gamelibrary.entity.User;
import com.gamelibrary.gamelibrary.entity.UserStatsDto;
import com.gamelibrary.gamelibrary.repository.GameEntryRepository;
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
import java.util.List;

@ExtendWith(MockitoExtension.class)
class UserServiceTest {

  @Mock
  private UserRepository userRepository;

  @Mock
  private PasswordEncoder passwordEncoder;

  @Mock
  private GameEntryRepository gameEntryRepository;

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

  @Test
  void getUserStats_ShouldReturnCorrectCounts(){
    //Arrange
    GameEntry entry1 = new GameEntry();
    entry1.setStatus(GameStatus.PLAYING);

    GameEntry entry2 = new GameEntry();
    entry2.setStatus(GameStatus.COMPLETED);

    when(gameEntryRepository.findByUserUsername("testUser"))
        .thenReturn(List.of(entry1,entry2));
    
    //Act
    UserStatsDto result = userService.getUserStats("testUser");

    //Assert
    assertEquals(2, result.getTotalGames());
    assertEquals(1, result.getPlaying());
    assertEquals(1, result.getCompleted());
  }
}
