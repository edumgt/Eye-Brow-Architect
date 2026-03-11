package com.eyebrowarchitect.scrap;

import com.eyebrowarchitect.design.MakeupPost;
import com.eyebrowarchitect.user.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ScrapRepository extends JpaRepository<Scrap, Integer> {
    List<Scrap> findByUserOrderByCreatedAtDesc(User user);

    Optional<Scrap> findByUserAndPost(User user, MakeupPost post);

    boolean existsByUserAndPost(User user, MakeupPost post);
}
