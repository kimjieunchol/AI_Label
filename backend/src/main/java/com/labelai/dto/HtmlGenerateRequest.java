package com.labelai.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * HTML Generation API 요청 DTO
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class HtmlGenerateRequest {
    
    private String country;
    private Object data;  // TranslatedData 또는 Map
}