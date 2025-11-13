package com.labelai.controller;

import com.labelai.dto.request.ChangePasswordRequest;
import com.labelai.dto.response.HistoryResponse;
import com.labelai.dto.response.UserResponse;
import com.labelai.service.HistoryService;
import com.labelai.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/user")
@RequiredArgsConstructor
public class UserController {
    
    private final UserService userService;
    private final HistoryService historyService;
    
    /**
     * 내 프로필 조회
     * GET /api/user/profile
     * 
     * Response:
     * {
     *   "id": number,
     *   "username": "string",
     *   "name": "string",
     *   "email": "string",
     *   "createdAt": "string",
     *   "lastActive": "string",
     *   "isFirstLogin": boolean
     * }
     */
    @GetMapping("/profile")
    public ResponseEntity<UserResponse> getProfile(Authentication auth) {
        String username = auth.getName();
        UserResponse response = userService.getProfile(username);
        return ResponseEntity.ok(response);
    }
    
    /**
     * 비밀번호 변경
     * PUT /api/user/password
     * 
     * Request Body:
     * {
     *   "currentPassword": "string",
     *   "newPassword": "string"
     * }
     */
    @PutMapping("/password")
    public ResponseEntity<Void> changePassword(
            Authentication auth,
            @RequestBody ChangePasswordRequest request
    ) {
        String username = auth.getName();
        userService.changePassword(username, request);
        return ResponseEntity.ok().build();
    }
    
    /**
     * 내 이력 조회
     * GET /api/user/history
     * 
     * Response: HistoryResponse[]
     * {
     *   "id": number,
     *   "type": "validate" | "translate",
     *   "fileName": "string",
     *   "date": "string",
     *   "time": "string",
     *   "status": "completed" | "failed",
     *   "errorCount": number?,
     *   "warningCount": number?,
     *   "country": "string?",
     *   "userId": "string"
     * }
     */
    @GetMapping("/history")
    public ResponseEntity<List<HistoryResponse>> getMyHistory(Authentication auth) {
        String username = auth.getName();
        List<HistoryResponse> history = historyService.getUserHistory(username);
        return ResponseEntity.ok(history);
    }
    
    /**
     * 내 이력 삭제
     * DELETE /api/user/history
     * 
     * Request Body: number[] (id 배열)
     */
    @DeleteMapping("/history")
    public ResponseEntity<Void> deleteHistory(
            Authentication auth,
            @RequestBody List<Long> ids
    ) {
        String username = auth.getName();
        historyService.deleteUserHistories(username, ids);
        return ResponseEntity.ok().build();
    }
}