package com.eyebrowarchitect.scrap;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/scraps")
@RequiredArgsConstructor
public class ScrapController {
    private final ScrapService scrapService;

    @PostMapping("/toggle")
    public ResponseEntity<Void> toggleScrap(@RequestParam Integer userId, @RequestParam Integer postId) {
        scrapService.toggleScrap(userId, postId);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/check")
    public ResponseEntity<Boolean> checkScrap(@RequestParam Integer userId, @RequestParam Integer postId) {
        return ResponseEntity.ok(scrapService.isScrapped(userId, postId));
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Scrap>> getScraps(@PathVariable Integer userId) {
        return ResponseEntity.ok(scrapService.getScraps(userId));
    }
}
