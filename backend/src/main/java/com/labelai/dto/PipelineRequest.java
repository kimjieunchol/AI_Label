package com.labelai.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.web.multipart.MultipartFile;

/**
 * Pipeline API 요청 DTO
 * 전체 파이프라인 처리 (OCR → Structure → Translate → HTML)
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PipelineRequest {
    
    private MultipartFile image;
    
    @JsonProperty("target_country")
    private String targetCountry;
    
    @JsonProperty("generate_html")
    private Boolean generateHtml;
}