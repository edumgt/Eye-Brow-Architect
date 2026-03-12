package com.eyebrowarchitect.common;

import io.awspring.cloud.s3.S3Template;
import io.awspring.cloud.s3.S3Resource;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import java.io.IOException;
import java.util.Objects;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class S3Service {

    private final S3Template s3Template;

    @Value("${spring.cloud.aws.s3.bucket}")
    private String bucket;

    @Value("${spring.cloud.aws.credentials.access-key:NONE}")
    private String accessKey;

    @SuppressWarnings("null")
    public String uploadFile(MultipartFile file) {
        try {
            return uploadFile(file.getBytes(), file.getOriginalFilename());
        } catch (IOException e) {
            log.error("파일 바이트 읽기 실패: {}", e.getMessage());
            throw new RuntimeException("파일 처리 실패: " + e.getMessage());
        }
    }

    @Value("${app.storage.local:true}")
    private boolean forceLocal;

    public String uploadFile(byte[] fileBytes, String originalFilename) {
        String fileName = UUID.randomUUID().toString() + "_" + originalFilename;

        // Use S3 if not forced to local. IAM roles will provide credentials even if
        // accessKey is NONE.
        if (forceLocal) {
            log.info("로컬 저장 모드 강제 작동 중 (forceLocal: true)");
            return saveToFileSystem(fileBytes, fileName);
        }

        try {
            log.info("S3 업로드 시도 중... (Bucket: {})", bucket);
            S3Resource resource = s3Template.upload(bucket, fileName, new java.io.ByteArrayInputStream(fileBytes));
            return Objects.requireNonNull(resource.getURL()).toString();
        } catch (Exception e) {
            log.error("S3 업로드 실패, 로컬 저장소로 대체합니다: {}", e.getMessage());
            return saveToFileSystem(fileBytes, fileName);
        }
    }

    private String saveToFileSystem(byte[] fileBytes, String fileName) {
        try {
            java.io.File uploadDir = new java.io.File("uploads").getAbsoluteFile();
            if (!uploadDir.exists())
                uploadDir.mkdirs();

            java.io.File dest = new java.io.File(uploadDir, fileName);
            java.nio.file.Files.write(dest.toPath(), fileBytes);
            log.info("파일이 로컬 저장소에 저장되었습니다: {}", dest.getAbsolutePath());
            return "/uploads/" + fileName;
        } catch (IOException e) {
            log.error("로컬 저장소 저장 실패: {}", e.getMessage());
            throw new RuntimeException("파일 저장 실패: " + e.getMessage());
        }
    }
}
