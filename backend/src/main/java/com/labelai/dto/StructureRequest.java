package com.labelai.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * Structure API 요청 DTO
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StructureRequest {
    
    private String language;
    private List<String> texts;
}