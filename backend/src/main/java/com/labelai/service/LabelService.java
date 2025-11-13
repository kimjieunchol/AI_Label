package com.labelai.service;

import com.labelai.api.LlmApiClient;
import com.labelai.api.RagApiClient;
import com.labelai.dto.response.ValidationResponse;
import com.labelai.entity.History;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.UUID;

/**
 * 라벨 처리 서비스
 * 파일 업로드, 검증, 번역 처리
 */
@Service
@RequiredArgsConstructor
public class LabelService {
    
    private final RagApiClient ragApiClient;
    private final LlmApiClient llmApiClient;
    private final HistoryService historyService;
    
    private static final String UPLOAD_DIR = "./uploads/";
    
    /**
     * 라벨 파일 업로드 및 저장
     */
    public String uploadFile(MultipartFile file) throws IOException {
        // 업로드 디렉토리 생성
        File uploadDir = new File(UPLOAD_DIR);
        if (!uploadDir.exists()) {
            uploadDir.mkdirs();
        }
        
        // 고유 파일명 생성
        String originalFilename = file.getOriginalFilename();
        String extension = originalFilename.substring(originalFilename.lastIndexOf("."));
        String uniqueFilename = UUID.randomUUID().toString() + extension;
        
        // 파일 저장
        Path filePath = Paths.get(UPLOAD_DIR + uniqueFilename);
        Files.write(filePath, file.getBytes());
        
        return uniqueFilename;
    }
    
    /**
     * FDA 규제 검증
     */
    public ValidationResponse validateLabel(String username, MultipartFile file, String country) {
        try {
            // 1. 파일 저장
            String savedFilename = uploadFile(file);
            
            // 2. RAG API로 텍스트 추출
            Object extractedData = ragApiClient.extractTextFromLabel(savedFilename);
            
            // 3. RAG API로 FDA 규제 검증
            ValidationResponse validationResult = ragApiClient.validateWithFDA(extractedData);
            
            // 4. 이력 저장
            saveHistory(username, file.getOriginalFilename(), "validate", 
                       "completed", validationResult.getTotalErrors(), 0, country);
            
            return validationResult;
            
        } catch (Exception e) {
            // 실패 이력 저장
            saveHistory(username, file.getOriginalFilename(), "validate", 
                       "failed", 0, 0, country);
            throw new RuntimeException("검증 처리 중 오류 발생: " + e.getMessage());
        }
    }
    
    /**
     * 라벨 번역
     */
    public String translateLabel(String username, MultipartFile file, String country) {
        try {
            // 1. 파일 저장
            String savedFilename = uploadFile(file);
            
            // 2. RAG API로 텍스트 추출
            Object extractedData = ragApiClient.extractTextFromLabel(savedFilename);
            
            // 3. LLM API로 번역
            String translatedText = llmApiClient.translateLabel(
                extractedData.toString(), 
                country
            );
            
            // 4. 이력 저장
            saveHistory(username, file.getOriginalFilename(), "translate", 
                       "completed", 0, 0, country);
            
            return translatedText;
            
        } catch (Exception e) {
            // 실패 이력 저장
            saveHistory(username, file.getOriginalFilename(), "translate", 
                       "failed", 0, 0, country);
            throw new RuntimeException("번역 처리 중 오류 발생: " + e.getMessage());
        }
    }
    
    /**
     * 이력 저장 헬퍼 메서드
     */
    private void saveHistory(String username, String fileName, String type, 
                            String status, int errorCount, int warningCount, String country) {
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
    }
}