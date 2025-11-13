package com.labelai.api;

import com.labelai.api.dto.RagRequest;
import com.labelai.api.dto.RagResponse;
import com.labelai.dto.response.ValidationResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.FileSystemResource;
import org.springframework.http.*;
import org.springframework.stereotype.Component;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;
import java.io.File;

/**
 * RAG API 클라이언트
 * FastAPI RAG 서버와 통신하여 텍스트 추출 및 FDA 규제 검증
 */
@Component
@RequiredArgsConstructor
public class RagApiClient {
    
    @Value("${external.rag-api.url}")
    private String ragApiUrl;
    
    private final RestTemplate restTemplate = new RestTemplate();
    
    /**
     * 라벨 이미지에서 텍스트 추출
     */
    public Object extractTextFromLabel(String filePath) {
        try {
            String url = ragApiUrl + "/extract";
            
            // Multipart 요청 준비
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.MULTIPART_FORM_DATA);
            
            MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();
            body.add("file", new FileSystemResource(new File("./uploads/" + filePath)));
            
            HttpEntity<MultiValueMap<String, Object>> requestEntity = 
                new HttpEntity<>(body, headers);
            
            ResponseEntity<RagResponse> response = restTemplate.exchange(
                url,
                HttpMethod.POST,
                requestEntity,
                RagResponse.class
            );
            
            return response.getBody();
            
        } catch (Exception e) {
            throw new RuntimeException("RAG API 텍스트 추출 실패: " + e.getMessage());
        }
    }
    
    /**
     * FDA 규제 기반 검증
     */
    public ValidationResponse validateWithFDA(Object extractedData) {
        try {
            String url = ragApiUrl + "/validate";
            
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            
            RagRequest request = new RagRequest();
            request.setExtractedData(extractedData);
            
            HttpEntity<RagRequest> requestEntity = new HttpEntity<>(request, headers);
            
            ResponseEntity<ValidationResponse> response = restTemplate.exchange(
                url,
                HttpMethod.POST,
                requestEntity,
                ValidationResponse.class
            );
            
            return response.getBody();
            
        } catch (Exception e) {
            throw new RuntimeException("RAG API FDA 검증 실패: " + e.getMessage());
        }
    }
}