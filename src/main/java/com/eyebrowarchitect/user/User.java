package com.eyebrowarchitect.user;

import java.time.LocalDateTime;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;

import org.hibernate.annotations.CreationTimestamp;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;

@Entity
@Table(name = "users")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer userId;

    @Column(unique = true, nullable = false)
    private String email;

    @Column(nullable = false)
    private String password;

    @Column(nullable = false)
    private String nickname;

    @Column(name = "profile_image_url", columnDefinition = "TEXT")
    private String profileImageUrl;

    @Column(name = "face_image_url", columnDefinition = "TEXT")
    private String faceImageUrl;

    @Column(length = 50)
    private String faceShape;

    @Column(columnDefinition = "TEXT")
    private String eyebrowCoords;

    @Column(length = 20)
    private String hairColor;

    @Column(length = 20)
    private String pupilColor;

    @Column(columnDefinition = "TEXT")
    private String bio;

    private Integer age;

    @Column(length = 10)
    private String gender;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    private MembershipType membershipTier = MembershipType.FREE;

    @Builder.Default
    private int dailyAnalysisCount = 0;

    private LocalDateTime lastAnalysisDate;

    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;
}
