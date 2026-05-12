package com.gamelibrary.gamelibrary.entity;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class UserStatsDto {
    private long totalGames;
    private long playing;
    private long planned;
    private long completed;
    private long dropped;
    private double avgRating;
}