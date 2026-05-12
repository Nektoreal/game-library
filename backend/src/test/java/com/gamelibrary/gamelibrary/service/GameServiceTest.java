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

import com.gamelibrary.gamelibrary.entity.Game;
import com.gamelibrary.gamelibrary.repository.GameRepository;

@ExtendWith(MockitoExtension.class)
class GameServiceTest {
  @Mock
  private GameRepository gameRepository;

  @InjectMocks
  private GameService gameService;

  @Test
  void addGame_ShouldSaveGame(){
    //Arrange
    Game game = new Game();
    game.setTitle("game1");

    when(gameRepository.save(any(Game.class))).thenReturn(game);

    //Act
    Game result = gameService.addGame(game);

    //Assert
    assertEquals("game1", result.getTitle());
    verify(gameRepository).save(game);
  }
}
