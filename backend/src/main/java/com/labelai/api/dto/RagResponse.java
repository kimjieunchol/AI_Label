package com.labelai.api.dto;

import lombok.Data;

/**
 * RAG API 응답 DTO
 */
@Data
public class RagResponse {
    private String productName;
    private String extractedText;
    private Object structuredData;
}