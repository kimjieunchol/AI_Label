package com.labelai.dto.request;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

/**
 * 라벨 업로드 요청 DTO
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class LabelUploadRequest {
    
    /**
     * 업로드할 파일
     */
    private MultipartFile file;
    
    /**
     * 대상 국가 (USA, EU, JP, CN 등)
     */
    private String country;
    
    /**
     * 처리 타입 (validate, translate)
     */
    private String type;
}

/**
 * 배치 업로드 요청 DTO
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
class BatchUploadRequest {
    
    /**
     * 업로드할 파일들 (최대 20개)
     */
    private List<MultipartFile> files;
    
    /**
     * 대상 국가
     */
    private String country;
}

/**
 * 다중 국가 번역 요청 DTO
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
class MultiCountryRequest {
    
    /**
     * 업로드할 파일
     */
    private MultipartFile file;
    
    /**
     * 대상 국가 목록 (최대 10개)
     */
    private List<String> countries;
}