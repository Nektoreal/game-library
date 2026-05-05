package com.gamelibrary.gamelibrary.entity;

import java.time.LocalDateTime;

import jakarta.persistence.*;
import lombok.Data;

@Data
@Entity
@Table(name = "game_entries")

public class GameEntry {
  
  @Id
  @GeneratedValue(strategy = GenerationType.UUID)
  private String id;

  @ManyToOne(fetch = FetchType.EAGER)
  private User user;

  @ManyToOne(fetch = FetchType.EAGER)
  private Game game;

  @Enumerated(EnumType.STRING)//say Spring "save in Table string like "PLAYING, ...""
  private GameStatus status;

  @Column(updatable = false)
  private LocalDateTime addedAt;
}
