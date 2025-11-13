package com.labelai.api.dto;

import lombok.Data;

/**
 * LLM API 요청 DTO
 */
@Data
public class LlmRequest {
    private String text;
    private String targetCountry;
    private Object validationErrors;
}