package com.gamelibrary.gamelibrary.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.gamelibrary.gamelibrary.entity.GameEntry;
import com.gamelibrary.gamelibrary.entity.GameStatus;
import com.gamelibrary.gamelibrary.repository.GameEntryRepository;
import com.gamelibrary.gamelibrary.repository.GameRepository;
import com.gamelibrary.gamelibrary.repository.UserRepository;

@ExtendWith(MockitoExtension.class)
class GameEntryServiceTest {

  @Mock
  private GameEntryRepository gameEntryRepository;

  @Mock
  private UserRepository userRepository;

  @Mock
  private GameRepository gameRepository;

  @InjectMocks
  private GameEntryService gameEntryService;
  
  @Test
  void updateStatus_ShouldChangeStatus() {
    // Arrange
    GameEntry entry = new GameEntry();
    entry.setStatus(GameStatus.PLANNED);

    when(gameEntryRepository.findById("123")).thenReturn(java.util.Optional.of(entry));
    when(gameEntryRepository.save(any(GameEntry.class))).thenReturn(entry);

    // Act
    GameEntry result = gameEntryService.updateStatus("123", "COMPLETED");

    // Assert
    assertEquals(GameStatus.COMPLETED, result.getStatus());
    verify(gameEntryRepository).save(entry);
  }
}

