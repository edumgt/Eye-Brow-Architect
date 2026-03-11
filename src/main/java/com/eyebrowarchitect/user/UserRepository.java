package com.eyebrowarchitect.user;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

/**
 * 사용자 DB 접근을 위한 인터페이스
 */
@Repository
public interface UserRepository extends JpaRepository<User, Integer> {
    // 이메일로 중복 가입 여부 확인
    Optional<User> findByEmail(String email);

    // 닉네임 중복 확인
    boolean existsByNickname(String nickname);
}