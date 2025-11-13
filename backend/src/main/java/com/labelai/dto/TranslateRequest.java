package com.labelai.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Translate API 요청 DTO
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TranslateRequest {
    
    private String language;
    private Object data;  // StructuredData 또는 Map
    
    @JsonProperty("target_country")
    private String targetCountry;
}