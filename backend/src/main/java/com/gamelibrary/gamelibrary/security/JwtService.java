package com.gamelibrary.gamelibrary.security;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.security.Key;
import java.util.Date;

@Service
public class JwtService {

  @Value("${jwt.secret}") //take application.properties
  private String secret;

  @Value("${jwt.expiration}") //take application.properties
  private long expiration;


  public String generateToken(String username) { //create JWT token with username and endDateTime
    return Jwts.builder()
              .setSubject(username) //put username into token
              .setIssuedAt(new Date()) //CreateTime
              .setExpiration(new Date(System.currentTimeMillis() + expiration)) // expiration time
              .signWith(getKey(), SignatureAlgorithm.HS256) ////Sign with the private key
              .compact(); //create/build token
  }


  public String extractUsername(String token) { //get username from token
    return Jwts.parserBuilder()
            .setSigningKey(getKey()) // Use the same key for verification
            .build()
            .parseClaimsJws(token) //"open" token
            .getBody()
            .getSubject(); //get username
  }


  public boolean isTokenValid(String token) { //check token is valid
    try {
      Jwts.parserBuilder()
              .setSigningKey(getKey())
              .build()
              .parseClaimsJws(token); //if token is broke/not the same - Exception
      return true;
    } catch (Exception e) {
      return false; //token is broke/not the same
    }
  }


  public Key getKey(){ //make from text into the Bytes (cause JWT works with bytes)
    byte[] keyBytes = java.util.HexFormat.of().parseHex(secret);
    return Keys.hmacShaKeyFor(keyBytes);
  }
}