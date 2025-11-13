package com.labelai.api;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.labelai.dto.*;
import io.github.resilience4j.bulkhead.Bulkhead;
import io.github.resilience4j.circuitbreaker.CircuitBreaker;
import io.github.resilience4j.retry.Retry;
import io.github.resilience4j.decorators.Decorators;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.MediaType;
import org.springframework.http.client.MultipartBodyBuilder;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.reactive.function.BodyInserters;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;
import reactor.core.scheduler.Schedulers;

import java.io.IOException;
import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.concurrent.Callable;
import java.util.function.Supplier;
import java.util.stream.Collectors;

@Service
@Slf4j
public class FoodLabelApiClient {
    
    private final WebClient webClient;
    private final CircuitBreaker circuitBreaker;
    private final Retry retry;
    private final Bulkhead bulkhead;
    private final ObjectMapper objectMapper;
    
    @Autowired
    public FoodLabelApiClient(
            WebClient foodLabelWebClient,
            CircuitBreaker foodLabelCircuitBreaker,
            Retry foodLabelRetry,
            Bulkhead foodLabelBulkhead,
            ObjectMapper objectMapper) {
        this.webClient = foodLabelWebClient;
        this.circuitBreaker = foodLabelCircuitBreaker;
        this.retry = foodLabelRetry;
        this.bulkhead = foodLabelBulkhead;
        this.objectMapper = objectMapper;
        
        setupEventListeners();
    }
    
    // ==================== OCR ====================
    
    /**
     * OCR: 이미지에서 텍스트 추출
     */
    public OcrResponse extractText(MultipartFile image) throws IOException {
        Callable<OcrResponse> callable = () -> {
            MultipartBodyBuilder builder = new MultipartBodyBuilder();
            builder.part("file", new ByteArrayResource(image.getBytes()) {
                @Override
                public String getFilename() {
                    return image.getOriginalFilename();
                }
            });
            
            return webClient.post()
                .uri("/ocr")
                .contentType(MediaType.MULTIPART_FORM_DATA)
                .body(BodyInserters.fromMultipartData(builder.build()))
                .retrieve()
                .onStatus(HttpStatusCode::is4xxClientError, 
                    response -> Mono.error(new IllegalArgumentException("Invalid image format")))
                .onStatus(HttpStatusCode::is5xxServerError,
                    response -> Mono.error(new RuntimeException("OCR service error")))
                .bodyToMono(OcrResponse.class)
                .block();
        };
        
        return executeWithResilienceCallable(callable);
    }
    
    /**
     * OCR 비동기
     */
    public Mono<OcrResponse> extractTextAsync(MultipartFile image) {
        return Mono.fromCallable(() -> extractText(image))
            .subscribeOn(Schedulers.boundedElastic());
    }
    
    /**
     * OCR 배치 처리
     */
    public List<OcrResponse> extractTextBatch(List<MultipartFile> images) {
        return images.parallelStream()
            .map(image -> {
                try {
                    return extractText(image);
                } catch (IOException e) {
                    log.error("Failed to process image: {}", image.getOriginalFilename(), e);
                    return null;
                }
            })
            .filter(result -> result != null)
            .collect(Collectors.toList());
    }
    
    // ==================== STRUCTURE ====================
    
    /**
     * Structure: OCR 텍스트를 구조화된 JSON으로 변환
     */
    public StructureResponse structureData(StructureRequest request) {
        return executeWithResilience(() -> 
            webClient.post()
                .uri("/structure")
                .contentType(MediaType.APPLICATION_JSON)
                .bodyValue(request)
                .retrieve()
                .onStatus(HttpStatusCode::is4xxClientError,
                    response -> Mono.error(new IllegalArgumentException("Invalid structure request")))
                .onStatus(HttpStatusCode::is5xxServerError,
                    response -> Mono.error(new RuntimeException("Structure service error")))
                .bodyToMono(StructureResponse.class)
                .block()
        );
    }
    
    public Mono<StructureResponse> structureDataAsync(StructureRequest request) {
        return Mono.fromSupplier(() -> structureData(request))
            .subscribeOn(Schedulers.boundedElastic());
    }
    
    // ==================== TRANSLATE ====================
    
    /**
     * Translate: 한국 라벨을 다른 국가 형식으로 번역
     */
    public TranslateResponse translate(TranslateRequest request) {
        return executeWithResilience(() -> 
            webClient.post()
                .uri("/translate")
                .contentType(MediaType.APPLICATION_JSON)
                .bodyValue(request)
                .retrieve()
                .onStatus(HttpStatusCode::is4xxClientError,
                    response -> Mono.error(new IllegalArgumentException("Invalid translate request")))
                .onStatus(HttpStatusCode::is5xxServerError,
                    response -> Mono.error(new RuntimeException("Translate service error")))
                .bodyToMono(TranslateResponse.class)
                .block()
        );
    }
    
    public Mono<TranslateResponse> translateAsync(TranslateRequest request) {
        return Mono.fromSupplier(() -> translate(request))
            .subscribeOn(Schedulers.boundedElastic());
    }
    
    /**
     * 다중 국가 번역
     */
    public Map<String, TranslateResponse> translateMultipleCountries(
            String language, 
            Object data, 
            List<String> targetCountries) {
        
        return targetCountries.parallelStream()
            .collect(Collectors.toMap(
                country -> country,
                country -> {
                    TranslateRequest request = TranslateRequest.builder()
                        .language(language)
                        .data(data)
                        .targetCountry(country)
                        .build();
                    return translate(request);
                }
            ));
    }
    
    // ==================== HTML GENERATION ====================
    
    /**
     * Generate HTML: 영양 라벨 HTML 생성
     */
    public String generateHtml(HtmlGenerateRequest request) {
        return executeWithResilience(() -> 
            webClient.post()
                .uri("/generate-html")
                .contentType(MediaType.APPLICATION_JSON)
                .bodyValue(request)
                .retrieve()
                .onStatus(HttpStatusCode::is4xxClientError,
                    response -> Mono.error(new IllegalArgumentException("Invalid HTML generation request")))
                .onStatus(HttpStatusCode::is5xxServerError,
                    response -> Mono.error(new RuntimeException("HTML generation service error")))
                .bodyToMono(String.class)
                .block()
        );
    }
    
    public Mono<String> generateHtmlAsync(HtmlGenerateRequest request) {
        return Mono.fromSupplier(() -> generateHtml(request))
            .subscribeOn(Schedulers.boundedElastic());
    }
    
    // ==================== FULL PIPELINE ====================
    
    /**
     * Full Pipeline: OCR → Structure → Translate → HTML
     */
    public PipelineResponse processFullPipeline(PipelineRequest request) throws IOException {
        Callable<PipelineResponse> callable = () -> {
            MultipartBodyBuilder builder = new MultipartBodyBuilder();
            
            builder.part("file", new ByteArrayResource(request.getImage().getBytes()) {
                @Override
                public String getFilename() {
                    return request.getImage().getOriginalFilename();
                }
            });
            
            if (request.getTargetCountry() != null) {
                builder.part("target_country", request.getTargetCountry());
            }
            if (request.getGenerateHtml() != null) {
                builder.part("generate_html", request.getGenerateHtml().toString());
            }
            
            return webClient.post()
                .uri("/process")
                .contentType(MediaType.MULTIPART_FORM_DATA)
                .body(BodyInserters.fromMultipartData(builder.build()))
                .retrieve()
                .onStatus(HttpStatusCode::is4xxClientError,
                    response -> Mono.error(new IllegalArgumentException("Invalid pipeline request")))
                .onStatus(HttpStatusCode::is5xxServerError,
                    response -> Mono.error(new RuntimeException("Pipeline service error")))
                .bodyToMono(PipelineResponse.class)
                .block();
        };
        
        return executeWithResilienceCallable(callable);
    }
    
    public Mono<PipelineResponse> processFullPipelineAsync(PipelineRequest request) {
        return Mono.fromCallable(() -> processFullPipeline(request))
            .subscribeOn(Schedulers.boundedElastic());
    }
    
    /**
     * 배치 파이프라인
     */
    public Flux<PipelineResponse> processBatchPipeline(List<PipelineRequest> requests) {
        return Flux.fromIterable(requests)
            .parallel(5)
            .runOn(Schedulers.parallel())
            .flatMap(this::processFullPipelineAsync)
            .sequential()
            .doOnError(error -> log.error("Batch pipeline error", error));
    }
    
    // ==================== RESILIENCE ====================
    
    /**
     * Resilience 패턴 적용 (Supplier - unchecked exception용)
     */
    private <T> T executeWithResilience(Supplier<T> supplier) {
        return Decorators.ofSupplier(supplier)
            .withCircuitBreaker(circuitBreaker)
            .withRetry(retry)
            .withBulkhead(bulkhead)
            .withFallback(Arrays.asList(Exception.class), 
                throwable -> handleFallback(throwable))
            .decorate()
            .get();
    }
    
    /**
     * Resilience 패턴 적용 (Callable - checked exception용)
     */
    private <T> T executeWithResilienceCallable(Callable<T> callable) throws IOException {
        try {
            return Decorators.ofCallable(callable)
                .withCircuitBreaker(circuitBreaker)
                .withRetry(retry)
                .withBulkhead(bulkhead)
                .withFallback(Arrays.asList(Exception.class), 
                    throwable -> handleFallback(throwable))
                .decorate()
                .call();
        } catch (IOException e) {
            throw e;
        } catch (Exception e) {
            throw new RuntimeException("Unexpected error during API call", e);
        }
    }
    
    private <T> T handleFallback(Throwable throwable) {
        log.error("Food Label API call failed: {}", throwable.getMessage());
        throw new RuntimeException("Food Label API is temporarily unavailable", throwable);
    }
    
    private void setupEventListeners() {
        circuitBreaker.getEventPublisher()
            .onStateTransition(event -> 
                log.warn("Food Label API Circuit Breaker: {}", event))
            .onError(event -> 
                log.error("Food Label API error: {}", event));
        
        retry.getEventPublisher()
            .onRetry(event -> 
                log.info("Food Label API retry attempt #{}", event.getNumberOfRetryAttempts()));
    }
    
    // ==================== UTILITY ====================
    
    public String getCircuitBreakerState() {
        return circuitBreaker.getState().toString();
    }
    
    public void resetCircuitBreaker() {
        circuitBreaker.reset();
        log.info("Food Label API Circuit Breaker reset");
    }
    
    public boolean isHealthy() {
        try {
            webClient.get()
                .uri("/")
                .retrieve()
                .onStatus(HttpStatusCode::is4xxClientError,
                    response -> Mono.error(new RuntimeException("Health check failed: 4xx error")))
                .onStatus(HttpStatusCode::is5xxServerError,
                    response -> Mono.error(new RuntimeException("Health check failed: 5xx error")))
                .bodyToMono(String.class)
                .block();
            return true;
        } catch (Exception e) {
            log.error("Food Label API health check failed", e);
            return false;
        }
    }
}