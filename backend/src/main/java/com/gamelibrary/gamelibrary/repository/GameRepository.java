package com.gamelibrary.gamelibrary.repository;

import com.gamelibrary.gamelibrary.entity.Game;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository //key/point for Spring boot. Spring boot find this "key" and registers
public interface GameRepository extends JpaRepository<Game, String>{ //this repo work with Games Table and Id type String

  
}
