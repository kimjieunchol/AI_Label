package com.labelai.controller;

import com.labelai.dto.*;
import com.labelai.dto.response.ValidationResponse;
import com.labelai.service.LabelService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * 라벨 처리 컨트롤러
 * Food Label API + RAG API 통합
 */
@RestController
@RequestMapping("/api/label")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = "*")
public class LabelController {
    
    private final LabelService labelService;
    
    // ==================== MAIN ENDPOINTS ====================
    
    /**
     * FDA 규제 검증
     * POST /api/label/validate
     * 
     * 전체 플로우:
     * 1. 이미지 → Food Label API (OCR + Structure + Translate + HTML)
     * 2. HTML → RAG API (FDA Validation)
     * 3. 검증 결과 반환
     */
    @PostMapping(value = "/validate", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ValidationResponse> validateLabel(
            Authentication auth,
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "country", defaultValue = "USA") String country) {
        try {
            String username = auth.getName();
            log.info("Validation request from user: {}, country: {}, file: {}", 
                username, country, file.getOriginalFilename());
            
            ValidationResponse result = labelService.validateLabel(username, file, country);
            
            return ResponseEntity.ok(result);
            
        } catch (IllegalArgumentException e) {
            log.error("Invalid request", e);
            return ResponseEntity.badRequest().build();
        } catch (Exception e) {
            log.error("Validation failed", e);
            return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE).build();
        }
    }
    
    /**
     * 라벨 번역 (HTML 반환)
     * POST /api/label/translate
     * 
     * 전체 플로우:
     * 1. 이미지 → Food Label API (Full Pipeline)
     * 2. HTML 출력 반환
     */
    @PostMapping(value = "/translate", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<String> translateLabel(
            Authentication auth,
            @RequestParam("file") MultipartFile file,
            @RequestParam("country") String country) {
        try {
            String username = auth.getName();
            log.info("Translation request from user: {}, country: {}, file: {}", 
                username, country, file.getOriginalFilename());
            
            String htmlResult = labelService.translateLabel(username, file, country);
            
            return ResponseEntity.ok()
                .contentType(MediaType.TEXT_HTML)
                .body(htmlResult);
            
        } catch (IllegalArgumentException e) {
            log.error("Invalid request", e);
            return ResponseEntity.badRequest().build();
        } catch (Exception e) {
            log.error("Translation failed", e);
            return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE).build();
        }
    }
    
    /**
     * 상세 번역 결과 (구조화된 데이터 포함)
     * POST /api/label/translate/detailed
     */
    @PostMapping(value = "/translate/detailed", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<PipelineResponse> translateLabelDetailed(
            Authentication auth,
            @RequestParam("file") MultipartFile file,
            @RequestParam("country") String country) {
        try {
            String username = auth.getName();
            log.info("Detailed translation request from user: {}, country: {}", username, country);
            
            PipelineResponse result = labelService.translateLabelDetailed(username, file, country);
            
            return ResponseEntity.ok(result);
            
        } catch (Exception e) {
            log.error("Detailed translation failed", e);
            return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE).build();
        }
    }
    
    // ==================== BATCH PROCESSING ====================
    
    /**
     * 배치 번역 (여러 이미지 동시 처리)
     * POST /api/label/translate/batch
     * 
     * 최대 20개 파일까지 처리
     */
    @PostMapping(value = "/translate/batch", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<List<PipelineResponse>> translateBatch(
            Authentication auth,
            @RequestParam("files") List<MultipartFile> files,
            @RequestParam(value = "country", defaultValue = "USA") String country) {
        try {
            if (files.size() > 20) {
                return ResponseEntity.badRequest().build();
            }
            
            String username = auth.getName();
            log.info("Batch translation request from user: {}, files: {}, country: {}", 
                username, files.size(), country);
            
            List<PipelineResponse> results = labelService.translateBatch(username, files, country);
            
            return ResponseEntity.ok(results);
            
        } catch (IllegalArgumentException e) {
            log.error("Invalid batch request", e);
            return ResponseEntity.badRequest().build();
        } catch (Exception e) {
            log.error("Batch translation failed", e);
            return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE).build();
        }
    }
    
    /**
     * 다중 국가 번역 (하나의 이미지 → 여러 국가 형식)
     * POST /api/label/translate/multi-country
     */
    @PostMapping(value = "/translate/multi-country", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<Map<String, String>> translateToMultipleCountries(
            Authentication auth,
            @RequestParam("file") MultipartFile file,
            @RequestParam("countries") List<String> countries) {
        try {
            if (countries.size() > 10) {
                return ResponseEntity.badRequest().build();
            }
            
            String username = auth.getName();
            log.info("Multi-country translation request from user: {}, countries: {}", 
                username, countries);
            
            List<String> htmlResults = labelService.translateToMultipleCountries(username, file, countries);
            
            // 결과를 Map으로 변환
            Map<String, String> resultMap = new HashMap<>();
            for (int i = 0; i < countries.size() && i < htmlResults.size(); i++) {
                resultMap.put(countries.get(i), htmlResults.get(i));
            }
            
            return ResponseEntity.ok(resultMap);
            
        } catch (Exception e) {
            log.error("Multi-country translation failed", e);
            return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE).build();
        }
    }
    
    // ==================== INDIVIDUAL STEPS ====================
    
    /**
     * OCR만 실행 (텍스트 추출만)
     * POST /api/label/ocr
     */
    @PostMapping(value = "/ocr", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<OcrResponse> extractText(
            @RequestParam("file") MultipartFile file) {
        try {
            log.info("OCR request for file: {}", file.getOriginalFilename());
            
            OcrResponse result = labelService.extractTextOnly(file);
            
            return ResponseEntity.ok(result);
            
        } catch (Exception e) {
            log.error("OCR failed", e);
            return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE).build();
        }
    }
    
    /**
     * 구조화만 실행 (텍스트 → JSON)
     * POST /api/label/structure
     */
    @PostMapping("/structure")
    public ResponseEntity<StructureResponse> structureData(
            @RequestBody StructureRequest request) {
        try {
            log.info("Structure request for language: {}", request.getLanguage());
            
            StructureResponse result = labelService.structureOnly(
                request.getTexts(), 
                request.getLanguage()
            );
            
            return ResponseEntity.ok(result);
            
        } catch (Exception e) {
            log.error("Structure processing failed", e);
            return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE).build();
        }
    }
    
    // ==================== HEALTH & STATUS ====================
    
    /**
     * API 상태 확인
     * GET /api/label/health
     */
    @GetMapping("/health")
    public ResponseEntity<Map<String, Object>> health() {
        Map<String, Object> status = new HashMap<>();
        
        status.put("service", "label-api");
        status.put("food_label_api_healthy", labelService.checkApiHealth());
        status.put("circuit_breaker_state", labelService.getCircuitBreakerState());
        status.put("status", "ok");
        
        return ResponseEntity.ok(status);
    }
    
    // ==================== RESPONSE DTOs ====================
    
    /**
     * 배치 처리 결과 DTO
     */
    @lombok.Data
    @lombok.NoArgsConstructor
    @lombok.AllArgsConstructor
    public static class BatchTranslationResult {
        private String filename;
        private String country;
        private String html;
        private boolean success;
        private String error;
    }
    
    /**
     * 다중 국가 번역 결과 DTO
     */
    @lombok.Data
    @lombok.NoArgsConstructor
    @lombok.AllArgsConstructor
    public static class MultiCountryResult {
        private Map<String, String> htmlOutputs;
        private List<String> failedCountries;
    }
}