package com.eyebrowarchitect.analysis.dto;

import lombok.Getter;
import lombok.Setter;

/**
 * AI 서버로부터 수신하는 얼굴 분석 결과 DTO
 */
@Getter
@Setter
public class FaceAnalysisDto {
    private String faceShape; // 예: "계란형", "각진형" 등
    private String eyebrowCoords; // JSON 형태의 좌표 데이터 문자열
}
