package com.labelai.util;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

/**
 * 날짜 포맷팅 유틸리티
 */
public class DateUtil {
    
    private static final DateTimeFormatter DATE_FORMATTER = 
        DateTimeFormatter.ofPattern("yyyy.MM.dd");
    
    private static final DateTimeFormatter TIME_FORMATTER = 
        DateTimeFormatter.ofPattern("HH:mm");
    
    private static final DateTimeFormatter DATETIME_FORMATTER = 
        DateTimeFormatter.ofPattern("yyyy.MM.dd HH:mm");
    
    /**
     * 현재 날짜 반환 (yyyy.MM.dd)
     */
    public static String getCurrentDate() {
        return LocalDateTime.now().format(DATE_FORMATTER);
    }
    
    /**
     * 현재 시간 반환 (HH:mm)
     */
    public static String getCurrentTime() {
        return LocalDateTime.now().format(TIME_FORMATTER);
    }
    
    /**
     * 현재 날짜+시간 반환 (yyyy.MM.dd HH:mm)
     */
    public static String getCurrentDateTime() {
        return LocalDateTime.now().format(DATETIME_FORMATTER);
    }
}