package com.gamelibrary.gamelibrary.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.gamelibrary.gamelibrary.service.IgdbService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/igdb")
@RequiredArgsConstructor
public class IgdbController {
  
  private final IgdbService igdbService;

  @GetMapping("/search")
  public ResponseEntity<String> search (@RequestParam String query) {
    return ResponseEntity.ok(igdbService.searchGames(query));
  }
}
