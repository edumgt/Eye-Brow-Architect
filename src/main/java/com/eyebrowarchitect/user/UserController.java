package com.eyebrowarchitect.user;

import com.eyebrowarchitect.user.dto.UserLoginDto;
import com.eyebrowarchitect.user.dto.UserSignupDto;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @GetMapping("/{userId}")
    public ResponseEntity<User> getUser(@PathVariable Integer userId) {
        return ResponseEntity.ok(userService.getUserById(userId));
    }

    @PostMapping("/signup")
    public ResponseEntity<String> signup(@RequestBody UserSignupDto signupDto) {
        try {
            Integer userId = userService.signup(signupDto);
            return ResponseEntity.ok("회원가입 성공! ID: " + userId);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody UserLoginDto loginDto) {
        try {
            User user = userService.login(loginDto);
            return ResponseEntity.ok(user);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    /**
     * [UserController: 업로드 엔드포인트 추가]
     * 외부에서 사진을 받을 수 있는 창구를 만듭니다.
     */
    @PostMapping("/{userId}/upload-face")
    public ResponseEntity<String> uploadFace(
            @PathVariable Integer userId,
            @RequestParam("file") MultipartFile file) {
        try {
            // 위에서 만든 서비스의 업로드 메서드를 호출하도록 연결합니다.
            String imageUrl = userService.uploadFaceImage(userId, file);
            return ResponseEntity.ok("업로드 성공! 이미지 경로: " + imageUrl);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body("업로드 실패: " + e.getMessage());
        }
    }

    @PostMapping("/{userId}/update")
    public ResponseEntity<User> updateProfile(
            @PathVariable Integer userId,
            @RequestBody User updatedData) {
        try {
            User user = userService.updateProfile(userId, updatedData);
            return ResponseEntity.ok(user);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(null);
        }
    }
}