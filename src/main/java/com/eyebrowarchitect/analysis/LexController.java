package com.eyebrowarchitect.analysis;

import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/lex")
@RequiredArgsConstructor
public class LexController {

    private final LexService lexService;

    @PostMapping("/chat")
    public Map<String, String> chat(@RequestBody Map<String, String> request) {
        String sessionId = request.getOrDefault("sessionId", "guest-session");
        String message = request.getOrDefault("message", "");

        String response = lexService.getResponse(sessionId, message);

        return Map.of("response", response);
    }
}
