package com.gamelibrary.gamelibrary.service;

import com.gamelibrary.gamelibrary.entity.Game;
import com.gamelibrary.gamelibrary.repository.GameRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;


@Service
@RequiredArgsConstructor
public class GameService {
  
  
  private final GameRepository gameRepository;
  
  public List<Game> getAllGames() {
    return gameRepository.findAll();
  }

  public Game addGame(Game game){
    return gameRepository.save(game);
  }

  public void deleteGame(String id){
    gameRepository.deleteById(id);
  }
}
