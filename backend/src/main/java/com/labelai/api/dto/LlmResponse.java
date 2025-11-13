package com.labelai.api.dto;

import lombok.Data;

/**
 * LLM API 응답 DTO
 */
@Data
public class LlmResponse {
    private String translatedText;
    private String suggestions;
}