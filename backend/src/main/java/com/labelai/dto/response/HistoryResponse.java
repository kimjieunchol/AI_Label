package com.labelai.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * 이력 응답 DTO
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class HistoryResponse {
    private Long id;
    private String type;
    private String fileName;
    private String date;
    private String time;
    private String status;
    private Integer errorCount;
    private Integer warningCount;
    private String country;
    private String userId;
}