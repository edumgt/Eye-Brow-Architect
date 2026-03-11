package com.eyebrowarchitect.user;

import com.eyebrowarchitect.history.AnalysisHistory;
import com.eyebrowarchitect.history.AnalysisHistoryRepository;
import com.eyebrowarchitect.common.S3Service;
import com.eyebrowarchitect.user.dto.UserLoginDto;
import com.eyebrowarchitect.user.dto.UserSignupDto;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.Objects;

@Slf4j
@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final AnalysisHistoryRepository historyRepository;
    private final S3Service s3Service;

    @Transactional(readOnly = true)
    public User getUserById(Integer userId) {
        return userRepository.findById(Objects.requireNonNull(userId))
                .orElseThrow(() -> new RuntimeException("사용자를 찾을 수 없습니다."));
    }

    @Transactional
    public Integer signup(UserSignupDto signupDto) {
        userRepository.findByEmail(signupDto.getEmail())
                .ifPresent(u -> {
                    throw new RuntimeException("이미 가입된 이메일입니다.");
                });

        if (userRepository.existsByNickname(signupDto.getNickname())) {
            throw new RuntimeException("이미 사용 중인 닉네임입니다.");
        }

        User user = User.builder()
                .email(signupDto.getEmail())
                .password(signupDto.getPassword())
                .nickname(signupDto.getNickname())
                .bio(signupDto.getBio())
                .age(signupDto.getAge())
                .gender(signupDto.getGender())
                .build();

        User savedUser = userRepository.save(Objects.requireNonNull(user));
        return savedUser.getUserId();
    }

    @Transactional(readOnly = true)
    public User login(UserLoginDto loginDto) {
        User user = userRepository.findByEmail(loginDto.getEmail())
                .orElseThrow(() -> new RuntimeException("이메일 또는 비밀번호가 올바르지 않습니다."));

        if (!user.getPassword().equals(loginDto.getPassword())) {
            throw new RuntimeException("이메일 또는 비밀번호가 올바르지 않습니다.");
        }

        return user;
    }

    @Transactional
    @SuppressWarnings("null")
    public String uploadFaceImage(final Integer userId, final MultipartFile file) {
        User user = userRepository.findById(Objects.requireNonNull(userId))
                .orElseThrow(() -> new RuntimeException("사용자를 찾을 수 없습니다."));

        String savedUrl = s3Service.uploadFile(file);

        user.setFaceImageUrl(savedUrl);
        userRepository.save(user);

        AnalysisHistory history = AnalysisHistory
                .builder()
                .user(user)
                .imageUrl(savedUrl)
                .faceShape("분석 중...")
                .isLatest(true)
                .build();
        historyRepository.save(history);

        return savedUrl;
    }

    @Transactional
    public User updateProfile(Integer userId, User updatedData) {
        User user = userRepository.findById(Objects.requireNonNull(userId))
                .orElseThrow(() -> new RuntimeException("사용자를 찾을 수 없습니다."));

        if (updatedData.getNickname() != null) user.setNickname(updatedData.getNickname());
        if (updatedData.getBio() != null) user.setBio(updatedData.getBio());
        if (updatedData.getAge() != null) user.setAge(updatedData.getAge());
        if (updatedData.getGender() != null) user.setGender(updatedData.getGender());

        return userRepository.save(user);
    }
}