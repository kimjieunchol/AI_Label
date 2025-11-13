package com.labelai.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.context.request.WebRequest;
import java.time.LocalDateTime;

/**
 * 전역 예외 핸들러
 * 모든 컨트롤러에서 발생하는 예외를 통합 처리
 */
@RestControllerAdvice
public class GlobalExceptionHandler {
    
    /**
     * CustomException 처리
     */
    @ExceptionHandler(CustomException.class)
    public ResponseEntity<ErrorResponse> handleCustomException(
            CustomException ex, 
            WebRequest request
    ) {
        ErrorResponse errorResponse = ErrorResponse.builder()
                .message(ex.getMessage())
                .errorCode(ex.getErrorCode())
                .statusCode(ex.getStatusCode())
                .timestamp(LocalDateTime.now())
                .path(request.getDescription(false))
                .build();
        
        return new ResponseEntity<>(errorResponse, HttpStatus.valueOf(ex.getStatusCode()));
    }
    
    /**
     * 일반 RuntimeException 처리
     */
    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<ErrorResponse> handleRuntimeException(
            RuntimeException ex, 
            WebRequest request
    ) {
        ErrorResponse errorResponse = ErrorResponse.builder()
                .message(ex.getMessage())
                .errorCode("RUNTIME_ERROR")
                .statusCode(500)
                .timestamp(LocalDateTime.now())
                .path(request.getDescription(false))
                .build();
        
        return new ResponseEntity<>(errorResponse, HttpStatus.INTERNAL_SERVER_ERROR);
    }
    
    /**
     * 인증 실패 처리
     */
    @ExceptionHandler(BadCredentialsException.class)
    public ResponseEntity<ErrorResponse> handleBadCredentialsException(
            BadCredentialsException ex, 
            WebRequest request
    ) {
        ErrorResponse errorResponse = ErrorResponse.builder()
                .message("아이디 또는 비밀번호가 일치하지 않습니다.")
                .errorCode("INVALID_CREDENTIALS")
                .statusCode(401)
                .timestamp(LocalDateTime.now())
                .path(request.getDescription(false))
                .build();
        
        return new ResponseEntity<>(errorResponse, HttpStatus.UNAUTHORIZED);
    }
    
    /**
     * 권한 없음 처리
     */
    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<ErrorResponse> handleAccessDeniedException(
            AccessDeniedException ex, 
            WebRequest request
    ) {
        ErrorResponse errorResponse = ErrorResponse.builder()
                .message("접근 권한이 없습니다.")
                .errorCode("ACCESS_DENIED")
                .statusCode(403)
                .timestamp(LocalDateTime.now())
                .path(request.getDescription(false))
                .build();
        
        return new ResponseEntity<>(errorResponse, HttpStatus.FORBIDDEN);
    }
    
    /**
     * 기타 모든 예외 처리
     */
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handleGlobalException(
            Exception ex, 
            WebRequest request
    ) {
        ErrorResponse errorResponse = ErrorResponse.builder()
                .message("서버 오류가 발생했습니다.")
                .errorCode("INTERNAL_ERROR")
                .statusCode(500)
                .timestamp(LocalDateTime.now())
                .path(request.getDescription(false))
                .build();
        
        return new ResponseEntity<>(errorResponse, HttpStatus.INTERNAL_SERVER_ERROR);
    }
}
