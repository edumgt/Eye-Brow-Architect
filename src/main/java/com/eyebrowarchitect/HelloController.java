package com.eyebrowarchitect;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.CrossOrigin;

@CrossOrigin(origins = "http://localhost:5173")
@RestController
public class HelloController {
    @GetMapping("/")
    public String hello() {
        return "나혜님, Eye-Brow Architect 서버가 드디어 DB와 연결되어 정상 작동 중입니다! 🎉";
    }
}