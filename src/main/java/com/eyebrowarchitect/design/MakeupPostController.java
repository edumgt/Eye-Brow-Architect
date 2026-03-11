package com.eyebrowarchitect.design;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/posts")
@RequiredArgsConstructor
public class MakeupPostController {

    private final MakeupPostService makeupPostService;

    @GetMapping
    public ResponseEntity<List<DesignResponseDto>> getAllPosts() {
        return ResponseEntity.ok(makeupPostService.getAllPosts());
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<DesignResponseDto> getRecommendation(@PathVariable Integer userId) {
        return ResponseEntity.ok(makeupPostService.getRecommendation(userId));
    }
}
