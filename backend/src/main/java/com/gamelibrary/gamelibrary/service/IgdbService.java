package com.gamelibrary.gamelibrary.service;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.Map;

@Service
@RequiredArgsConstructor
public class IgdbService {
  
  @Value("${igdb.client-id}")
  private String clientId;

  @Value("${igdb.client-secret}")
  private String clientSecret;

  private final RestTemplate restTemplate;

  private String accessToken;
  private long tokenExpiry = 0;

  //Get token via Twitch OAuth
  private String getAccessToken() {
    if (accessToken != null && System.currentTimeMillis() < tokenExpiry) {
      return accessToken;
    }
    String url = "https://id.twitch.tv/oauth2/token"
      + "?client_id=" + clientId
      + "&client_secret=" + clientSecret
      + "&grant_type=client_credentials";

    ResponseEntity<Map> response = restTemplate.postForEntity(url, null, Map.class);
    Map body = response.getBody();

    accessToken = (String) body.get("access_token");
    int expiresIn = (int) body.get("expires_in");
    tokenExpiry = System.currentTimeMillis() + (expiresIn - 60) * 1000L;

    return accessToken;
  }

  public String searchGames(String query) {
    String token = getAccessToken();

    HttpHeaders headers = new HttpHeaders();
    headers.set("Client-ID" ,clientId);
    headers.setBearerAuth(token);
    headers.setContentType(MediaType.TEXT_PLAIN);

    //provide the title, cover art, genre, platform, and release date
    String body = "search \"" + query + "\"; "
      + "fields name, cover.url, genres.name, platforms.name, first_release_date; "
      + "limit 5; "
      + "where cover != null;";
    
    HttpEntity<String> entity = new HttpEntity<>(body ,headers);

    ResponseEntity<String> response = restTemplate.exchange(
      "https://api.igdb.com/v4/games",
      HttpMethod.POST,
      entity,
      String.class
    );
    return response.getBody();
  }
}
