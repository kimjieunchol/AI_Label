package com.labelai;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * Label AI 애플리케이션 메인 클래스
 * Spring Boot 애플리케이션의 진입점
 */
@SpringBootApplication
public class LabelAiApplication {
    public static void main(String[] args) {
        SpringApplication.run(LabelAiApplication.class, args);
        System.out.println("========================================");
        System.out.println("Label AI Backend Server Started!");
        System.out.println("API Documentation: http://localhost:8081");
        System.out.println("========================================");
    }
}