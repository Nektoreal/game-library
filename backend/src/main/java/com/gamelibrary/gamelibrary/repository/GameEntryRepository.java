package com.gamelibrary.gamelibrary.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.gamelibrary.gamelibrary.entity.GameEntry;
import com.gamelibrary.gamelibrary.entity.GameStatus;

@Repository//key/point for Spring boot. Spring boot find this "key" and registers
public interface GameEntryRepository extends JpaRepository<GameEntry, String>{ //this repo work with Games Table and Id type String
  Page<GameEntry> findByUserUsername(String username, Pageable pageable);

  boolean existsByUserIdAndGameId(String userId, String gameId);

  boolean existsByUserUsernameAndGameTitle(String username, String gameTitle);

  Page<GameEntry> findByUserUsernameAndStatus(String username, GameStatus status, Pageable pageable);
}
