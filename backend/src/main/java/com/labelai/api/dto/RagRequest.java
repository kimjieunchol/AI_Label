package com.labelai.api.dto;

import lombok.Data;

/**
 * RAG API 요청 DTO
 */
@Data
public class RagRequest {
    private Object extractedData;
}