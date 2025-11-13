package com.labelai.api;

import com.labelai.api.dto.LlmRequest;
import com.labelai.api.dto.LlmResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

/**
 * LLM API 클라이언트
 * FastAPI LLM 서버와 통신하여 번역 및 제안 생성
 */
@Component
@RequiredArgsConstructor
public class LlmApiClient {
    
    @Value("${external.llm-api.url}")
    private String llmApiUrl;
    
    private final RestTemplate restTemplate = new RestTemplate();
    
    /**
     * 라벨 텍스트 번역
     */
    public String translateLabel(String text, String targetCountry) {
        try {
            String url = llmApiUrl + "/translate";
            
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            
            LlmRequest request = new LlmRequest();
            request.setText(text);
            request.setTargetCountry(targetCountry);
            
            HttpEntity<LlmRequest> requestEntity = new HttpEntity<>(request, headers);
            
            ResponseEntity<LlmResponse> response = restTemplate.exchange(
                url,
                HttpMethod.POST,
                requestEntity,
                LlmResponse.class
            );
            
            return response.getBody().getTranslatedText();
            
        } catch (Exception e) {
            throw new RuntimeException("LLM API 번역 실패: " + e.getMessage());
        }
    }
    
    /**
     * 규제 개선 제안 생성
     */
    public String generateSuggestions(Object validationErrors) {
        try {
            String url = llmApiUrl + "/suggestions";
            
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            
            LlmRequest request = new LlmRequest();
            request.setValidationErrors(validationErrors);
            
            HttpEntity<LlmRequest> requestEntity = new HttpEntity<>(request, headers);
            
            ResponseEntity<LlmResponse> response = restTemplate.exchange(
                url,
                HttpMethod.POST,
                requestEntity,
                LlmResponse.class
            );
            
            return response.getBody().getSuggestions();
            
        } catch (Exception e) {
            throw new RuntimeException("LLM API 제안 생성 실패: " + e.getMessage());
        }
    }
}