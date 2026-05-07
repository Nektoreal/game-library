package com.gamelibrary.gamelibrary.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import com.gamelibrary.gamelibrary.entity.Review;

@Repository
public interface ReviewRepository extends JpaRepository<Review, String>{

  List<Review> findByGameId(String gameId);
}
