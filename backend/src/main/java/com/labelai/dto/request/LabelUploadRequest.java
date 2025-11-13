package com.labelai.dto.request;

import lombok.Data;
import org.springframework.web.multipart.MultipartFile;

/**
 * 라벨 업로드 요청 DTO
 */
@Data
public class LabelUploadRequest {
    private MultipartFile file;
    private String type; // "validate" or "translate"
    private String country; // 번역 대상 국가
}
