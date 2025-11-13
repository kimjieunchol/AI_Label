package com.labelai.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * OCR API 응답 DTO
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OcrResponse {
    
    private String filename;
    private String language;
    private List<String> texts;
    
    @JsonProperty("raw_data")
    private RawOcrData rawData;
    
    /**
     * OCR Raw Data
     */
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class RawOcrData {
        
        @JsonProperty("rec_texts")
        private List<String> recTexts;
        
        private List<List<List<Integer>>> boxes;
        private List<Double> confidences;
        
        @JsonProperty("average_confidence")
        private Double averageConfidence;
        
        private String language;
        
        @JsonProperty("total_lines")
        private Integer totalLines;
    }
}