package com.gamelibrary.gamelibrary.controller;

import com.gamelibrary.gamelibrary.entity.GameEntry;
import com.gamelibrary.gamelibrary.service.GameEntryService;
import lombok.RequiredArgsConstructor;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;


@RestController //Sptirng boot that this class handles HTTP requests
@RequestMapping("/api/entries") //All methods are available by this "Path"
@RequiredArgsConstructor

public class GameEntryController {
  private final GameEntryService gameEntryService;

  @GetMapping //handless HTTP requests "GET /api/gameEntries"
  public Page<GameEntry> getAllGameEntries(
    Authentication authentication,
  @RequestParam(defaultValue = "0") int page,
  @RequestParam(defaultValue = "20") int size) { 
    String username = authentication.getName();
    return gameEntryService.getEntriesByUsername(username, PageRequest.of(page, size));
  }

  @PostMapping //handless HTTP requests "POST /api/gameEntries"
  public GameEntry addGameEntry(@RequestBody GameEntry gameEntry){ //take the data from the request body and convert it into a gameEntry object
    return gameEntryService.addGameEntry(gameEntry);
  }

  @DeleteMapping("/{id}") //handless HTTP requests "DELETE /api/gameEntries/{id}"
  public void deleteGameEntry(@PathVariable String id){ //take the {id} from the URL and pass it into the method
    gameEntryService.deleteGameEntry(id);
  }

  @PutMapping("/{id}/status")
  public GameEntry updateStatus(@PathVariable String id, @RequestBody Map<String, String> body) {
    return gameEntryService.updateStatus(id, body.get("status"));
  }

  @PutMapping("/{id}/playtime")
  public GameEntry addPlaytime(@PathVariable String id, @RequestBody Map<String, String> body){
    return gameEntryService.addPlaytime(id, Long.parseLong(body.get("seconds")));
  }
}
