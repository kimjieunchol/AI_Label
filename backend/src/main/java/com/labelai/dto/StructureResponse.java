package com.labelai.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * Structure API 응답 DTO
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StructureResponse {
    
    private String language;
    private StructuredData data;
    
    /**
     * 구조화된 데이터
     */
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class StructuredData {
        
        @JsonProperty("표시사항")
        private LabelInfo labelInfo;
        
        @JsonProperty("영양정보")
        private NutritionInfo nutritionInfo;
        
        @JsonProperty("설명")
        private Description description;
    }
    
    /**
     * 라벨 정보
     */
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class LabelInfo {
        
        @JsonProperty("식품유형")
        private String foodType;
        
        @JsonProperty("소비기한")
        private String expirationDate;
        
        @JsonProperty("제조원")
        private Manufacturer manufacturer;
        
        @JsonProperty("원재료명")
        private List<String> ingredients;
        
        @JsonProperty("알레르기_유발물질")
        private List<String> allergens;
    }
    
    /**
     * 제조원 정보
     */
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Manufacturer {
        
        @JsonProperty("회사명")
        private String companyName;
        
        @JsonProperty("공장정보")
        private List<FactoryInfo> factoryInfo;
    }
    
    /**
     * 공장 정보
     */
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class FactoryInfo {
        
        @JsonProperty("공장코드")
        private String factoryCode;
        
        @JsonProperty("주소")
        private String address;
        
        @JsonProperty("품목보고번호")
        private String reportNumber;
    }
    
    /**
     * 영양 정보
     */
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class NutritionInfo {
        
        @JsonProperty("총내용량")
        private String totalVolume;
        
        @JsonProperty("총칼로리")
        private String calories;
        
        @JsonProperty("나트륨")
        private NutrientDetail sodium;
        
        @JsonProperty("탄수화물")
        private NutrientDetail carbohydrate;
        
        @JsonProperty("당류")
        private NutrientDetail sugars;
        
        @JsonProperty("지방")
        private NutrientDetail fat;
        
        @JsonProperty("트랜스지방")
        private NutrientDetail transFat;
        
        @JsonProperty("포화지방")
        private NutrientDetail saturatedFat;
        
        @JsonProperty("콜레스테롤")
        private NutrientDetail cholesterol;
        
        @JsonProperty("단백질")
        private NutrientDetail protein;
        
        @JsonProperty("기준치_안내")
        private String dailyValueNote;
    }
    
    /**
     * 영양소 상세
     */
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class NutrientDetail {
        
        @JsonProperty("용량")
        private String amount;
        
        @JsonProperty("비율")
        private String percentage;
    }
    
    /**
     * 설명 정보
     */
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Description {
        
        @JsonProperty("보관방법")
        private String storage;
        
        @JsonProperty("경고문")
        private String warning;
        
        @JsonProperty("주의사항")
        private List<String> cautions;
        
        @JsonProperty("기타")
        private String other;
    }
}