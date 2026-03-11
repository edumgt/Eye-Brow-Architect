package com.eyebrowarchitect.design;

import com.eyebrowarchitect.product.Product;
import lombok.Builder;
import lombok.Getter;
import java.util.List;

@Getter
@Builder
public class DesignResponseDto {
    private Integer postId;
    private String title;
    private String description;
    private String imageUrl;
    private String targetFaceShape;
    private String recommendedPencilColor;
    private List<Product> products;
    private String analysisAdvice; // AI 맞춤 조언
}
