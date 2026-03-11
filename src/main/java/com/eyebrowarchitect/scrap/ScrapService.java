package com.eyebrowarchitect.scrap;

import com.eyebrowarchitect.design.MakeupPost;
import com.eyebrowarchitect.design.MakeupPostRepository;
import com.eyebrowarchitect.user.User;
import com.eyebrowarchitect.user.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Objects;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class ScrapService {
    private final ScrapRepository scrapRepository;
    private final UserRepository userRepository;
    private final MakeupPostRepository makeupPostRepository;

    @Transactional
    public void toggleScrap(Integer userId, Integer postId) {
        User user = userRepository.findById(Objects.requireNonNull(userId))
                .orElseThrow(() -> new RuntimeException("사용자를 찾을 수 없습니다."));
        MakeupPost post = makeupPostRepository.findById(Objects.requireNonNull(postId))
                .orElseThrow(() -> new RuntimeException("게시글 정보를 찾을 수 없습니다."));

        Optional<Scrap> existingScrap = scrapRepository.findByUserAndPost(user, post);
        if (existingScrap.isPresent()) {
            scrapRepository.delete(Objects.requireNonNull(existingScrap.get()));
        } else {
            scrapRepository.save(Objects.requireNonNull(Scrap.builder().user(user).post(post).build()));
        }
    }

    @Transactional(readOnly = true)
    public boolean isScrapped(Integer userId, Integer postId) {
        User user = userRepository.findById(Objects.requireNonNull(userId))
                .orElseThrow(() -> new RuntimeException("사용자를 찾을 수 없습니다."));
        MakeupPost post = makeupPostRepository.findById(Objects.requireNonNull(postId))
                .orElseThrow(() -> new RuntimeException("게시글 정보를 찾을 수 없습니다."));
        return scrapRepository.findByUserAndPost(user, post).isPresent();
    }

    @Transactional(readOnly = true)
    public List<Scrap> getScraps(Integer userId) {
        User user = userRepository.findById(Objects.requireNonNull(userId))
                .orElseThrow(() -> new RuntimeException("사용자를 찾을 수 없습니다."));
        return scrapRepository.findByUserOrderByCreatedAtDesc(user);
    }
}
