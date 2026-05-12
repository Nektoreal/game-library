package com.gamelibrary.gamelibrary.service;

import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.Optional;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.gamelibrary.gamelibrary.entity.Game;
import com.gamelibrary.gamelibrary.entity.Review;
import com.gamelibrary.gamelibrary.entity.User;
import com.gamelibrary.gamelibrary.repository.GameRepository;
import com.gamelibrary.gamelibrary.repository.ReviewRepository;
import com.gamelibrary.gamelibrary.repository.UserRepository;

@ExtendWith(MockitoExtension.class)
class ReviewServiceTest {
  @Mock
  private ReviewRepository reviewRepository;

  @Mock
  private UserRepository userRepository;

  @Mock
  private GameRepository gameRepository;

  @InjectMocks
  private ReviewService reviewService;
  

  @Test
  void addReview_ShouldSetCreatedAt(){
    //Arrange
    User user = new User();
    user.setId("user1");

    Game game = new Game();
    game.setId("game1");

    Review review = new Review();
    review.setUser(user);
    review.setGame(game);
    review.setRating(8);
    review.setText("Great game!");

    when(userRepository.findById("user1")).thenReturn(Optional.of(user));
    when(gameRepository.findById("game1")).thenReturn(Optional.of(game));
    when(reviewRepository.save(any(Review.class))).thenReturn(review);

    //Act
    Review result = reviewService.addReview(review);

    //Assert
    assertNotNull(result.getCreatedAt());
    verify(reviewRepository).save(review);
  }
}
