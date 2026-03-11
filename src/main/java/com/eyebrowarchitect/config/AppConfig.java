package com.eyebrowarchitect.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.client.RestTemplate;

@Configuration
public class AppConfig {

    @Bean
    public RestTemplate restTemplate() {
        return new RestTemplate();
    }

    @Bean
    public software.amazon.awssdk.services.rekognition.RekognitionClient rekognitionClient() {
        return software.amazon.awssdk.services.rekognition.RekognitionClient.builder()
                .region(software.amazon.awssdk.regions.Region.AP_NORTHEAST_2)
                .build();
    }
}
