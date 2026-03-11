package com.eyebrowarchitect.design;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface MakeupPostRepository extends JpaRepository<MakeupPost, Integer> {
    Optional<MakeupPost> findByTargetFaceShape(String targetFaceShape);
}
