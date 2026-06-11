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

import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

@Service
@RequiredArgsConstructor
public class ReviewService {

  private final ReviewRepository reviewRepository;
  private final UserRepository userRepository;
  private final GameRepository gameRepository;

  public Review addReview(Review review, String username){
    User user = userRepository.findByUsername(username).orElseThrow();
    Game game = gameRepository.findById(review.getGame().getId()).orElseThrow();

    if (reviewRepository.existsByGameIdAndUserUsername(game.getId(), user.getId())){
      throw new RuntimeException("Review already exists");
    }

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

  public Review updateReview(String id, Review updatedReview, String username){

    Review review = reviewRepository.findById(id).orElseThrow();

    if (!(review.getUser().getUsername().equals(username))) {
      throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Access denied");
    }

    review.setRating(updatedReview.getRating());
    review.setText(updatedReview.getText());
    return reviewRepository.save(review);
  }

  public void deleteReview(String id, String username) {
    
    Review review = reviewRepository.findById(id).orElseThrow();

    if (!(review.getUser().getUsername().equals(username))) {
      throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Access denied");
    }
    reviewRepository.deleteById(id);
  }
}
