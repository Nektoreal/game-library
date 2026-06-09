package com.gamelibrary.gamelibrary.controller;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.web.bind.annotation.*;

import com.gamelibrary.gamelibrary.entity.GameEntry;
import com.gamelibrary.gamelibrary.entity.Review;
import com.gamelibrary.gamelibrary.entity.User;
import com.gamelibrary.gamelibrary.service.GameEntryService;
import com.gamelibrary.gamelibrary.service.ReviewService;
import com.gamelibrary.gamelibrary.service.UserService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/public")
@RequiredArgsConstructor
public class PublicProfileController {

    private final UserService userService;
    private final GameEntryService gameEntryService;
    private final ReviewService reviewService;

    @GetMapping("/{username}")
    public User getPublicProfile(@PathVariable String username) {
        return userService.getUserByUsername(username);
    }

    @GetMapping("/{username}/entries")
    public Page<GameEntry> getPublicEntries(
        @PathVariable String username,
        @RequestParam(defaultValue = "0") int page,
        @RequestParam(defaultValue = "20") int size,
        @RequestParam(defaultValue = "ALL") String status){
        return gameEntryService.getEntriesByUsername(username, PageRequest.of(page, size), status);
    }

    @GetMapping("/{username}/reviews")
    public List<Review> getPublicReviews(@PathVariable String username) {
        return reviewService.getReviewByUsername(username);
    }

    @GetMapping("/search")
    public List<User> searchUsers(@RequestParam String q) {
        return userService.searchUsers(q);
    }
}
