package com.eyebrowarchitect.history;

import com.eyebrowarchitect.user.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AnalysisHistoryRepository extends JpaRepository<AnalysisHistory, Integer> {
    List<AnalysisHistory> findByUserOrderByCreatedAtDesc(User user);

    List<AnalysisHistory> findByUserAndIsLatestTrue(User user);
}
