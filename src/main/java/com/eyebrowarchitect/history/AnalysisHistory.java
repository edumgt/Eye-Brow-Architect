package com.eyebrowarchitect.history;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.eyebrowarchitect.user.User;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "analysis_results")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AnalysisHistory {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "analysis_id")
    private Integer analysisId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    @com.fasterxml.jackson.annotation.JsonIgnoreProperties({ "hibernateLazyInitializer", "handler",
            "analysisHistories" })
    private User user;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String imageUrl;

    @Column(length = 50)
    private String faceShape;

    @Column(columnDefinition = "TEXT")
    private String eyebrowCoords;

    @Column(length = 50)
    private String recommendedDesign;

    @Column(length = 30)
    private String recommendedColor;

    @Column(columnDefinition = "TEXT")
    private String recommendation;

    @Column(columnDefinition = "TEXT")
    private String analysisAdvice; // AI 맞춤 조언 저장

    @Builder.Default
    @JsonProperty("isLatest")
    @Column(name = "is_latest", nullable = false)
    private boolean isLatest = true;

    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;
}
