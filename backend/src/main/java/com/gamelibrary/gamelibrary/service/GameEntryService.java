package com.gamelibrary.gamelibrary.service;

import com.gamelibrary.gamelibrary.entity.GameEntry;
import com.gamelibrary.gamelibrary.entity.GameStatus;
import com.gamelibrary.gamelibrary.repository.GameEntryRepository;
import com.gamelibrary.gamelibrary.repository.GameRepository;
import com.gamelibrary.gamelibrary.repository.UserRepository;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

import com.gamelibrary.gamelibrary.entity.User;
import com.gamelibrary.gamelibrary.entity.Game;


@Service
@RequiredArgsConstructor
public class GameEntryService {
  
  private final GameEntryRepository gameEntryRepository;
  private final UserRepository userRepository;
  private final GameRepository gameRepository;

  public List<GameEntry> getAllGameEntry(){
    return gameEntryRepository.findAll();
  }

  public GameEntry addGameEntry(GameEntry gameEntry){

    User user = userRepository.findById(gameEntry.getUser().getId()).orElseThrow();
    Game game = gameRepository.findById(gameEntry.getGame().getId()).orElseThrow();

    gameEntry.setUser(user);
    gameEntry.setGame(game);

    boolean exists = gameEntryRepository.existsByUserUsernameAndGameTitle(user.getUsername(), game.getTitle());
    if (exists) {
        throw new RuntimeException("Game already in your collection");
    }

    gameEntry.setAddedAt(LocalDateTime.now());
    return gameEntryRepository.save(gameEntry);
  }

  public void deleteGameEntry(String id){
    gameEntryRepository.deleteById(id);
  }

  public List<GameEntry> getEntriesByUsername(String username) {
    return gameEntryRepository.findByUserUsername(username);
  }

  public GameEntry updateStatus(String id, String status) {
    GameEntry entry = gameEntryRepository.findById(id).orElseThrow();
    entry.setStatus(GameStatus.valueOf(status));
    return gameEntryRepository.save(entry);
  }
}
