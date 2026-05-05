package com.gamelibrary.gamelibrary.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.gamelibrary.gamelibrary.entity.GameEntry;

@Repository//key/point for Spring boot. Spring boot find this "key" and registers
public interface GameEntryRepository extends JpaRepository<GameEntry, String>{ //this repo work with Games Table and Id type String
  List<GameEntry> findByUserUsername(String username);
}
