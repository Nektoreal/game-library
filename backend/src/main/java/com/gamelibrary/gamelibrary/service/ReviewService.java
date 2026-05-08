package com.gamelibrary.gamelibrary.service;

import java.time.LocalDateTime;

import org.springframework.stereotype.Service;

import com.gamelibrary.gamelibrary.entity.Review;
import com.gamelibrary.gamelibrary.repository.GameRepository;
import com.gamelibrary.gamelibrary.repository.ReviewRepository;
import com.gamelibrary.gamelibrary.repository.UserRepository;

import com.gamelibrary.gamelibrary.entity.User;
import com.gamelibrary.gamelibrary.entity.Game;

import java.util.List;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ReviewService {

  private final ReviewRepository reviewRepository;
  private final UserRepository userRepository;
  private final GameRepository gameRepository;

  public Review addReview(Review review){
    
    User user = userRepository.findById(review.getUser().getId()).orElseThrow();

    Game game = gameRepository.findById(review.getGame().getId()).orElseThrow();

    review.setUser(user);
    review.setGame(game);
    review.setCreatedAt(LocalDateTime.now());

    return reviewRepository.save(review);
  }

  public List<Review> getReviewByGameId(String id){
      return reviewRepository.findByGameId(id);
  }
  public List<Review> getReviewByUsername(String username) {
    return reviewRepository.findByUserUsername(username);
  }
}
