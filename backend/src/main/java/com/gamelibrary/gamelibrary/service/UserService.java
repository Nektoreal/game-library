package com.gamelibrary.gamelibrary.service;

import com.gamelibrary.gamelibrary.entity.GameEntry;
import com.gamelibrary.gamelibrary.entity.GameStatus;
import com.gamelibrary.gamelibrary.entity.User;
import com.gamelibrary.gamelibrary.entity.UserStatsDto;
import com.gamelibrary.gamelibrary.repository.GameEntryRepository;
import com.gamelibrary.gamelibrary.repository.UserRepository;
import lombok.RequiredArgsConstructor;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor

public class UserService {

  private final UserRepository userRepository;
  private final PasswordEncoder passwordEncoder;
  private final GameEntryRepository gameEntryRepository;
  
  public List<User> getAllUsers() {
    return userRepository.findAll();
  }

  public User addUser(User user){
    user.setCreatedAt(LocalDateTime.now());
    user.setPassword(passwordEncoder.encode(user.getPassword()));
    return userRepository.save(user);
  }

  public void deleteUser(String id) {
    userRepository.deleteById(id);
  }

  public User getUserByUsername(String username){
    return userRepository.findByUsername(username).orElseThrow();
  }

  public UserStatsDto getUserStats(String username) {
    List<GameEntry> entries = gameEntryRepository.findByUserUsername(username);
    
    long playing = entries.stream().filter(e -> e.getStatus() == GameStatus.PLAYING).count();
    long planned = entries.stream().filter(e -> e.getStatus() == GameStatus.PLANNED).count();
    long completed = entries.stream().filter(e -> e.getStatus() == GameStatus.COMPLETED).count();
    long dropped = entries.stream().filter(e -> e.getStatus() == GameStatus.DROPPED).count();
    
    return new UserStatsDto((long) entries.size(), playing, planned, completed, dropped, 0.0);
  }
}