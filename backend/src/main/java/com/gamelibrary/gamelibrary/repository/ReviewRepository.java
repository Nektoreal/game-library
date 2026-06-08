package com.gamelibrary.gamelibrary.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import com.gamelibrary.gamelibrary.entity.Review;
import org.springframework.data.repository.query.Param;

import jakarta.transaction.Transactional;

@Repository
public interface ReviewRepository extends JpaRepository<Review, String>{

  List<Review> findByGameId(String gameId);
  List<Review> findByUserUsername(String username);
  
  @Transactional
  void deleteByGameId(String gameId);

  @Transactional
  void deleteByGameIdAndUserUsername(String gameId, String username);

  boolean existsByGameIdAndUserUsername (String gameId, String username);

  @Query("SELECT AVG(r.rating) FROM Review r WHERE r.user.username = :username")
  Double calculateAverageRatingByUsername(@Param("username") String username);
}
