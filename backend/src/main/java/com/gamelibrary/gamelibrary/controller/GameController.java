package com.gamelibrary.gamelibrary.controller;

import com.gamelibrary.gamelibrary.entity.Game;
import com.gamelibrary.gamelibrary.service.GameService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;

import java.util.List;

@RestController //Sptirng boot that this class handles HTTP requests
@RequestMapping("/api/games") //All methods are available by this "Path"
@RequiredArgsConstructor

public class GameController {
  private final GameService gameService;
  
  @GetMapping //handless HTTP requests "GET /api/games"
  public List<Game> getAllGames(){
    return gameService.getAllGames();
  }

  @PostMapping //handless HTTP requests "POST /api/games"
  public Game addGame(@Valid @RequestBody Game game) { //take the data from the request body and convert it into a Game object
    return gameService.addGame(game);
  }

  @DeleteMapping("/{id}") //handless HTTP requests "DELETE /api/games/{id}"
  public void deleteGame(@RequestBody String id){ //take the {id} from the URL and pass it into the method
    gameService.deleteGame(id);
  }
}
