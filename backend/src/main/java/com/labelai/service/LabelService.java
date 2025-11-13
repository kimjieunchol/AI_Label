package com.labelai.service;

import com.labelai.api.FoodLabelApiClient;
import com.labelai.api.RagApiClient;
import com.labelai.dto.*;
import com.labelai.dto.response.ValidationResponse;
import com.labelai.entity.History;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.UUID;

/**
 * 라벨 처리 서비스
 * Food Label API + RAG API 통합
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class LabelService {
    
    private final FoodLabelApiClient foodLabelApiClient;
    private final RagApiClient ragApiClient;
    private final HistoryService historyService;
    
    private static final String UPLOAD_DIR = "./uploads/";
    
    /**
     * 파일 업로드 및 저장
     */
    public String uploadFile(MultipartFile file) throws IOException {
        File uploadDir = new File(UPLOAD_DIR);
        if (!uploadDir.exists()) {
            uploadDir.mkdirs();
        }
        
        String originalFilename = file.getOriginalFilename();
        String extension = originalFilename.substring(originalFilename.lastIndexOf("."));
        String uniqueFilename = UUID.randomUUID().toString() + extension;
        
        Path filePath = Paths.get(UPLOAD_DIR + uniqueFilename);
        Files.write(filePath, file.getBytes());
        
        return uniqueFilename;
    }
    
    /**
     * FDA 규제 검증
     * Flow: Image → Food Label API (OCR + Structure + Translate) → RAG API (Validation)
     */
    public ValidationResponse validateLabel(String username, MultipartFile file, String country) {
        try {
            log.info("Starting validation for user: {}, country: {}", username, country);
            
            // 1. Food Label API 전체 파이프라인 (OCR → Structure → Translate → HTML)
            PipelineRequest pipelineRequest = PipelineRequest.builder()
                .image(file)
                .targetCountry(country.toUpperCase())
                .generateHtml(true)
                .build();
            
            PipelineResponse pipelineResult = foodLabelApiClient.processFullPipeline(pipelineRequest);
            
            log.info("Pipeline completed - OCR: {}s, Structure: {}s, Translate: {}s", 
                pipelineResult.getProcessingTime().getOcrTime(),
                pipelineResult.getProcessingTime().getStructureTime(),
                pipelineResult.getProcessingTime().getTranslateTime());
            
            // 2. RAG API로 FDA 규제 검증 (HTML 기반)
            String htmlOutput = pipelineResult.getHtmlOutput();
            ValidationResponse validationResult = ragApiClient.validateWithFDA(htmlOutput);
            
            // 3. 이력 저장
            saveHistory(username, file.getOriginalFilename(), "validate", 
                       "completed", validationResult.getTotalErrors(), 0, country);
            
            return validationResult;
            
        } catch (IOException e) {
            log.error("File processing failed", e);
            saveHistory(username, file.getOriginalFilename(), "validate", 
                       "failed", 0, 0, country);
            throw new RuntimeException("파일 처리 중 오류 발생: " + e.getMessage());
        } catch (Exception e) {
            log.error("Validation failed", e);
            saveHistory(username, file.getOriginalFilename(), "validate", 
                       "failed", 0, 0, country);
            throw new RuntimeException("검증 처리 중 오류 발생: " + e.getMessage());
        }
    }
    
    /**
     * 라벨 번역 (HTML 반환)
     * Flow: Image → Food Label API (Full Pipeline) → HTML Output
     */
    public String translateLabel(String username, MultipartFile file, String country) {
        try {
            log.info("Starting translation for user: {}, country: {}", username, country);
            
            // Food Label API 전체 파이프라인
            PipelineRequest pipelineRequest = PipelineRequest.builder()
                .image(file)
                .targetCountry(country.toUpperCase())
                .generateHtml(true)
                .build();
            
            PipelineResponse result = foodLabelApiClient.processFullPipeline(pipelineRequest);
            
            log.info("Translation completed in {}s", 
                result.getProcessingTime().getTotalTime());
            
            // 이력 저장
            saveHistory(username, file.getOriginalFilename(), "translate", 
                       "completed", 0, 0, country);
            
            return result.getHtmlOutput();
            
        } catch (IOException e) {
            log.error("File processing failed", e);
            saveHistory(username, file.getOriginalFilename(), "translate", 
                       "failed", 0, 0, country);
            throw new RuntimeException("파일 처리 중 오류 발생: " + e.getMessage());
        } catch (Exception e) {
            log.error("Translation failed", e);
            saveHistory(username, file.getOriginalFilename(), "translate", 
                       "failed", 0, 0, country);
            throw new RuntimeException("번역 처리 중 오류 발생: " + e.getMessage());
        }
    }
    
    /**
     * 상세 번역 결과 (구조화된 데이터 포함)
     */
    public PipelineResponse translateLabelDetailed(String username, MultipartFile file, String country) {
        try {
            log.info("Starting detailed translation for user: {}, country: {}", username, country);
            
            PipelineRequest pipelineRequest = PipelineRequest.builder()
                .image(file)
                .targetCountry(country.toUpperCase())
                .generateHtml(true)
                .build();
            
            PipelineResponse result = foodLabelApiClient.processFullPipeline(pipelineRequest);
            
            saveHistory(username, file.getOriginalFilename(), "translate", 
                       "completed", 0, 0, country);
            
            return result;
            
        } catch (IOException e) {
            log.error("File processing failed", e);
            saveHistory(username, file.getOriginalFilename(), "translate", 
                       "failed", 0, 0, country);
            throw new RuntimeException("파일 처리 중 오류 발생: " + e.getMessage());
        } catch (Exception e) {
            log.error("Translation failed", e);
            saveHistory(username, file.getOriginalFilename(), "translate", 
                       "failed", 0, 0, country);
            throw new RuntimeException("번역 처리 중 오류 발생: " + e.getMessage());
        }
    }
    
    /**
     * OCR만 실행 (텍스트 추출만)
     */
    public OcrResponse extractTextOnly(MultipartFile file) throws IOException {
        log.info("Extracting text from: {}", file.getOriginalFilename());
        return foodLabelApiClient.extractText(file);
    }
    
    /**
     * 구조화만 실행 (텍스트 → JSON)
     */
    public StructureResponse structureOnly(List<String> texts, String language) {
        log.info("Structuring data for language: {}", language);
        
        StructureRequest request = StructureRequest.builder()
            .language(language)
            .texts(texts)
            .build();
        
        return foodLabelApiClient.structureData(request);
    }
    
    /**
     * 배치 번역 (여러 이미지 동시 처리)
     */
    public List<PipelineResponse> translateBatch(String username, List<MultipartFile> files, String country) {
        try {
            log.info("Starting batch translation for {} files", files.size());
            
            if (files.size() > 20) {
                throw new IllegalArgumentException("최대 20개 파일까지 처리 가능합니다.");
            }
            
            List<PipelineRequest> requests = files.stream()
                .map(file -> PipelineRequest.builder()
                    .image(file)
                    .targetCountry(country.toUpperCase())
                    .generateHtml(true)
                    .build())
                .toList();
            
            List<PipelineResponse> results = foodLabelApiClient
                .processBatchPipeline(requests)
                .collectList()
                .block();
            
            // 배치 이력 저장
            files.forEach(file -> 
                saveHistory(username, file.getOriginalFilename(), "translate_batch", 
                           "completed", 0, 0, country)
            );
            
            return results;
            
        } catch (Exception e) {
            log.error("Batch translation failed", e);
            throw new RuntimeException("배치 번역 처리 중 오류 발생: " + e.getMessage());
        }
    }
    
    /**
     * 다중 국가 번역 (하나의 이미지를 여러 국가 형식으로)
     */
    public List<String> translateToMultipleCountries(String username, MultipartFile file, List<String> countries) {
        try {
            log.info("Translating to multiple countries: {}", countries);
            
            // 1. OCR + Structure
            OcrResponse ocrResult = foodLabelApiClient.extractText(file);
            
            StructureRequest structRequest = StructureRequest.builder()
                .language(ocrResult.getLanguage())
                .texts(ocrResult.getTexts())
                .build();
            
            StructureResponse structResult = foodLabelApiClient.structureData(structRequest);
            
            // 2. 다중 국가 번역
            return countries.stream()
                .map(country -> {
                    try {
                        TranslateRequest transRequest = TranslateRequest.builder()
                            .language(ocrResult.getLanguage())
                            .data(structResult.getData())
                            .targetCountry(country.toUpperCase())
                            .build();
                        
                        TranslateResponse transResult = foodLabelApiClient.translate(transRequest);
                        
                        HtmlGenerateRequest htmlRequest = HtmlGenerateRequest.builder()
                            .country(country.toUpperCase())
                            .data(transResult.getTranslatedData())
                            .build();
                        
                        return foodLabelApiClient.generateHtml(htmlRequest);
                        
                    } catch (Exception e) {
                        log.error("Failed to translate to country: {}", country, e);
                        return null;
                    }
                })
                .filter(html -> html != null)
                .toList();
            
        } catch (IOException e) {
            log.error("File processing failed", e);
            throw new RuntimeException("파일 처리 중 오류 발생: " + e.getMessage());
        } catch (Exception e) {
            log.error("Multi-country translation failed", e);
            throw new RuntimeException("다중 국가 번역 중 오류 발생: " + e.getMessage());
        }
    }
    
    /**
     * 이력 저장 헬퍼 메서드
     */
    private void saveHistory(String username, String fileName, String type, 
                            String status, int errorCount, int warningCount, String country) {
        try {
            LocalDateTime now = LocalDateTime.now();
            DateTimeFormatter dateFormatter = DateTimeFormatter.ofPattern("yyyy.MM.dd");
            DateTimeFormatter timeFormatter = DateTimeFormatter.ofPattern("HH:mm");
            
            History history = new History();
            history.setType(type);
            history.setFileName(fileName);
            history.setDate(now.format(dateFormatter));
            history.setTime(now.format(timeFormatter));
            history.setStatus(status);
            history.setErrorCount(errorCount);
            history.setWarningCount(warningCount);
            history.setCountry(country);
            
            historyService.createHistory(username, history);
            log.info("History saved for user: {}, type: {}, status: {}", username, type, status);
            
        } catch (Exception e) {
            log.error("Failed to save history", e);
        }
    }
    
    /**
     * API 상태 확인
     */
    public boolean checkApiHealth() {
        return foodLabelApiClient.isHealthy();
    }
    
    /**
     * Circuit Breaker 상태 확인
     */
    public String getCircuitBreakerState() {
        return foodLabelApiClient.getCircuitBreakerState();
    }
}