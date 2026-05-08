package com.gamelibrary.gamelibrary.controller;

import com.gamelibrary.gamelibrary.entity.Review;

import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.gamelibrary.gamelibrary.service.ReviewService;

import org.springframework.web.bind.annotation.RequestBody;
import lombok.RequiredArgsConstructor;

import java.util.List;

@RestController
@RequestMapping("/api/reviews")
@RequiredArgsConstructor

public class ReviewController {
  private final ReviewService reviewService;

  @GetMapping("/game/{gameId}")
  public List<Review> getReviewsByGame(@PathVariable String gameId){
    return reviewService.getReviewByGameId(gameId);
  }

  @PostMapping
  public Review addReview(@RequestBody Review review){
    return reviewService.addReview(review);
  }

  @GetMapping("/me")
  public List<Review> getReviewsByUsername(Authentication authentication){
    String username = authentication.getName();
    return reviewService.getReviewByUsername(username);
  }
}
