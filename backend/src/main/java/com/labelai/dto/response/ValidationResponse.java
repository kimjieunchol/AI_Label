package com.labelai.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

/**
 * 검증 결과 응답 DTO
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ValidationResponse {
    private String productName;
    private String sourceHtml;
    private String productType;
    private int totalErrors;
    private List<ValidationError> errors;
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ValidationError {
        private Location location;
        private Missing missing;
        private Incorrect incorrect;
        private Reference reference;
    }
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Location {
        private String selector;
        private String elementType;
    }
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Missing {
        private String item;
        private String severity;
        private String message;
    }
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Incorrect {
        private String currentValue;
        private String issue;
        private String severity;
        private String message;
    }
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Reference {
        private String regulation;
        private String guidance;
        private List<Source> sources;
    }
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Source {
        private String source;
        private String category;
    }
}