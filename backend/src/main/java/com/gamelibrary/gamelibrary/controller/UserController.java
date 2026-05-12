package com.gamelibrary.gamelibrary.controller;

import com.gamelibrary.gamelibrary.entity.User;
import com.gamelibrary.gamelibrary.entity.UserStatsDto;
import com.gamelibrary.gamelibrary.service.UserService;
import lombok.RequiredArgsConstructor;

import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController //Sptirng boot that this class handles HTTP requests
@RequestMapping("/api/users") //All methods are available by this "Path"
@RequiredArgsConstructor

public class UserController {
  private final UserService userService;

  @GetMapping("/me")
  public User getCurrentUser(Authentication authentication) {
    return userService.getUserByUsername(authentication.getName());
  }

  @GetMapping //handless HTTP requests "GET /api/users"
  public List<User> getAllUsers(){
    return userService.getAllUsers();
  }

  @PostMapping //handless HTTP requests "POST /api/users"
  public User addUser(@RequestBody User user){ //take the data from the request body and convert it into a User object
    return userService.addUser(user);
  }

  @DeleteMapping("/{id}") //handless HTTP requests "DELETE /api/users/{id}"
  public void deleteUser(@RequestBody String id){ //take the {id} from the URL and pass it into the method
    userService.deleteUser(id); 
  }

  @GetMapping("/me/stats")
  public UserStatsDto getUserStats(Authentication authentication) {
    return userService.getUserStats(authentication.getName());
  }
}
