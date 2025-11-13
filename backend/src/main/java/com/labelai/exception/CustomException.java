package com.labelai.exception;

import lombok.Getter;

/**
 * 커스텀 예외 클래스
 */
@Getter
public class CustomException extends RuntimeException {
    private final String errorCode;
    private final int statusCode;
    
    public CustomException(String message, String errorCode, int statusCode) {
        super(message);
        this.errorCode = errorCode;
        this.statusCode = statusCode;
    }
}