package com.gamelibrary.gamelibrary.entity;

import java.time.LocalDateTime;

import jakarta.persistence.*;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
@Entity
@Table(name = "reviews")
public class Review {
  
  @Id
  @GeneratedValue(strategy = GenerationType.UUID)
  private String id;
  
  @ManyToOne
  private User user;

  @ManyToOne 
  private Game game;
  @Min(value = 1, message = "Rating must be at least 1")
  @Max(value = 10, message = "Rating must be at most 10")
  private Integer rating;

  @NotBlank(message = "Review text cannot be empty")
  @Column(columnDefinition = "TEXT")
  private String text;

  @Column(updatable = false)
  private LocalDateTime createdAt;
}
