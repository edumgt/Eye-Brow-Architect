package com.eyebrowarchitect.analysis;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import software.amazon.awssdk.core.SdkBytes;
import software.amazon.awssdk.services.rekognition.RekognitionClient;
import software.amazon.awssdk.services.rekognition.model.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

@Service
@RequiredArgsConstructor
public class RekognitionService {

    private final RekognitionClient rekognitionClient;

    public DetectFacesResponse detectFaces(MultipartFile file) {
        try {
            return detectFaces(file.getBytes());
        } catch (IOException e) {
            throw new RuntimeException("이미지 바이트 읽기 실패: " + e.getMessage());
        }
    }

    public DetectFacesResponse detectFaces(byte[] imageBytes) {
        SdkBytes sdkBytes = SdkBytes.fromByteArray(imageBytes);
        Image image = Image.builder()
                .bytes(sdkBytes)
                .build();

        DetectFacesRequest request = DetectFacesRequest.builder()
                .image(image)
                .attributes(Attribute.ALL)
                .build();

        return rekognitionClient.detectFaces(request);
    }

    /**
     * 감지된 얼굴 중 첫 번째 얼굴의 특징을 기반으로 기초 분석 결과를 반환합니다.
     */
    public String analyzeFaceShapeBasic(DetectFacesResponse response) {
        if (!response.hasFaceDetails() || response.faceDetails().isEmpty()) {
            return "얼굴을 찾을 수 없습니다.";
        }

        FaceDetail detail = response.faceDetails().get(0);
        // Rekognition의 포즈, 감정 등을 활용한 추가 정보 생성 가능
        StringBuilder sb = new StringBuilder();
        sb.append("감지된 성별: ").append(detail.gender().value()).append(", ");
        sb.append("예상 나이대: ").append(detail.ageRange().low()).append("-").append(detail.ageRange().high());

        return sb.toString();
    }
}
