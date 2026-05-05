package com.gamelibrary.gamelibrary.service;

import com.gamelibrary.gamelibrary.entity.User;
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
}
