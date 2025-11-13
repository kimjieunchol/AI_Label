package com.labelai.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Pipeline API 응답 DTO
 * 전체 파이프라인 처리 결과
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PipelineResponse {
    
    @JsonProperty("ocr_result")
    private OcrResponse ocrResult;
    
    @JsonProperty("structured_data")
    private StructureResponse structuredData;
    
    @JsonProperty("translated_data")
    private TranslateResponse translatedData;
    
    @JsonProperty("html_output")
    private String htmlOutput;
    
    @JsonProperty("processing_time")
    private ProcessingTime processingTime;
    
    /**
     * 처리 시간 정보
     */
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ProcessingTime {
        
        @JsonProperty("ocr_time")
        private Double ocrTime;
        
        @JsonProperty("structure_time")
        private Double structureTime;
        
        @JsonProperty("translate_time")
        private Double translateTime;
        
        @JsonProperty("html_time")
        private Double htmlTime;
        
        @JsonProperty("total_time")
        private Double totalTime;
    }
}