package com.labelai.controller;

import com.labelai.dto.response.ValidationResponse;
import com.labelai.service.LabelService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/label")
@RequiredArgsConstructor
public class LabelController {
    
    private final LabelService labelService;
    
    /**
     * FDA 규제 검증
     * POST /api/label/validate
     * 
     * Request:
     * - file: MultipartFile
     * - country: string (default: "usa")
     * 
     * Response:
     * {
     *   "product_name": "string",
     *   "source_html": "string",
     *   "product_type": "string",
     *   "total_errors": number,
     *   "errors": [
     *     {
     *       "location": {
     *         "selector": "string",
     *         "element_type": "string"
     *       },
     *       "missing"?: {
     *         "item": "string",
     *         "severity": "warning" | "info" | "error",
     *         "message": "string"
     *       },
     *       "incorrect"?: {
     *         "current_value": "string",
     *         "issue": "string",
     *         "severity": "warning" | "info" | "error",
     *         "message": "string"
     *       },
     *       "reference": {
     *         "regulation": "string",
     *         "guidance": "string",
     *         "sources": [
     *           {
     *             "source": "string",
     *             "category": "string"
     *           }
     *         ]
     *       }
     *     }
     *   ]
     * }
     */
    @PostMapping("/validate")
    public ResponseEntity<ValidationResponse> validateLabel(
            Authentication auth,
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "country", defaultValue = "usa") String country
    ) {
        String username = auth.getName();
        ValidationResponse result = labelService.validateLabel(username, file, country);
        return ResponseEntity.ok(result);
    }
    
    /**
     * 라벨 번역
     * POST /api/label/translate
     * 
     * Request:
     * - file: MultipartFile
     * - country: string (required)
     * 
     * Response: string (번역된 HTML)
     */
    @PostMapping("/translate")
    public ResponseEntity<String> translateLabel(
            Authentication auth,
            @RequestParam("file") MultipartFile file,
            @RequestParam("country") String country
    ) {
        String username = auth.getName();
        String result = labelService.translateLabel(username, file, country);
        return ResponseEntity.ok(result);
    }
}