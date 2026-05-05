package com.gamelibrary.gamelibrary.controller;

import com.gamelibrary.gamelibrary.entity.User;
import com.gamelibrary.gamelibrary.security.JwtService;
import com.gamelibrary.gamelibrary.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {
  
  private final UserService userService;
  private final JwtService jwtService;
  private final AuthenticationManager authenticationManager;

  @PostMapping("/register")
  public User register(@RequestBody User user) {
    return userService.addUser(user);
  }

  @PostMapping("/login")
  public Map<String, String> login(@RequestBody Map<String, String> request) {
    authenticationManager.authenticate(
      new UsernamePasswordAuthenticationToken(
       request.get("username") , 
       request.get("password")
      )
    );
    String token = jwtService.generateToken(request.get("username"));
    return Map.of("token", token);
  }
}
