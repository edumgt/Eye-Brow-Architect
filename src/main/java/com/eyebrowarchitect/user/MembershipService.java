package com.eyebrowarchitect.user;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Objects;

@Service
@RequiredArgsConstructor
public class MembershipService {
    private final UserRepository userRepository;

    @Transactional
    public void checkAndResetDailyUsage(User user) {
        LocalDateTime now = LocalDateTime.now();
        if (user.getLastAnalysisDate() == null || !user.getLastAnalysisDate().toLocalDate().isEqual(LocalDate.now())) {
            user.setDailyAnalysisCount(0);
            user.setLastAnalysisDate(now);
            userRepository.save(user);
        }
    }

    public boolean canPerformAnalysis(User user) {
        if (user.getMembershipTier() == MembershipType.PREMIUM) {
            return true;
        }
        return user.getDailyAnalysisCount() < 2;
    }

    @Transactional
    public void incrementUsage(User user) {
        user.setDailyAnalysisCount(user.getDailyAnalysisCount() + 1);
        user.setLastAnalysisDate(LocalDateTime.now());
        userRepository.save(user);
    }

    @Transactional
    public User upgradeMembership(Integer userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        user.setMembershipTier(MembershipType.PREMIUM);
        return userRepository.save(user);
    }

    @Transactional
    public User cancelMembership(Integer userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        user.setMembershipTier(MembershipType.FREE);
        // We might want to keep the usage count or reset it, for now just changing the
        // tier
        return userRepository.save(user);
    }
}
