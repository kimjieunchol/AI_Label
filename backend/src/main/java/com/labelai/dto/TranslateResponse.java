package com.labelai.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * Translate API 응답 DTO
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TranslateResponse {
    
    @JsonProperty("source_language")
    private String sourceLanguage;
    
    @JsonProperty("target_country")
    private String targetCountry;
    
    @JsonProperty("translated_data")
    private TranslatedData translatedData;
    
    /**
     * 번역된 데이터
     */
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TranslatedData {
        private ProductInfo product;
        private NutritionFacts nutrition;
        private AdditionalInfo additional;
    }
    
    /**
     * 제품 정보
     */
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ProductInfo {
        private String type;
        private String brand;
        
        @JsonProperty("best_before")
        private String bestBefore;
        
        private List<String> ingredients;
        private List<String> allergens;
    }
    
    /**
     * 영양 성분
     */
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class NutritionFacts {
        
        @JsonProperty("serving_size")
        private String servingSize;
        
        @JsonProperty("servings_per_container")
        private String servingsPerContainer;
        
        private String calories;
        
        @JsonProperty("total_fat")
        private NutrientValue totalFat;
        
        @JsonProperty("saturated_fat")
        private NutrientValue saturatedFat;
        
        @JsonProperty("trans_fat")
        private NutrientValue transFat;
        
        private NutrientValue cholesterol;
        private NutrientValue sodium;
        
        @JsonProperty("total_carbohydrate")
        private NutrientValue totalCarbohydrate;
        
        @JsonProperty("dietary_fiber")
        private NutrientValue dietaryFiber;
        
        @JsonProperty("total_sugars")
        private NutrientValue totalSugars;
        
        private NutrientValue protein;
    }
    
    /**
     * 영양소 값
     */
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class NutrientValue {
        private String amount;
        
        @JsonProperty("daily_value")
        private String dailyValue;
    }
    
    /**
     * 추가 정보
     */
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class AdditionalInfo {
        
        @JsonProperty("manufactured_by")
        private String manufacturedBy;
        
        private List<FacilityInfo> facilities;
        private String storage;
        private List<String> cautions;
    }
    
    /**
     * 시설 정보
     */
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class FacilityInfo {
        private String code;
        private String address;
    }
}