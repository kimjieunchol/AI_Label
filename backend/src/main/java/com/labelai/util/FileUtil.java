package com.labelai.util;

import org.springframework.web.multipart.MultipartFile;
import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.UUID;

/**
 * 파일 처리 유틸리티
 */
public class FileUtil {
    
    private static final String UPLOAD_DIR = "./uploads/";
    private static final long MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
    
    /**
     * 파일 저장
     */
    public static String saveFile(MultipartFile file) throws IOException {
        // 파일 크기 검증
        if (file.getSize() > MAX_FILE_SIZE) {
            throw new RuntimeException("파일 크기는 10MB를 초과할 수 없습니다.");
        }
        
        // 파일 타입 검증
        String contentType = file.getContentType();
        if (contentType == null || !contentType.startsWith("image/")) {
            throw new RuntimeException("이미지 파일만 업로드 가능합니다.");
        }
        
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
     * 파일 삭제
     */
    public static void deleteFile(String filename) {
        try {
            Path filePath = Paths.get(UPLOAD_DIR + filename);
            Files.deleteIfExists(filePath);
        } catch (IOException e) {
            // 로그 기록
            System.err.println("파일 삭제 실패: " + filename);
        }
    }
    
    /**
     * 파일 존재 여부 확인
     */
    public static boolean fileExists(String filename) {
        Path filePath = Paths.get(UPLOAD_DIR + filename);
        return Files.exists(filePath);
    }
}