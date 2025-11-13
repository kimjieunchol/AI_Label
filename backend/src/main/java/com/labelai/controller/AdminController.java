package com.labelai.controller;

import com.labelai.dto.request.CreateUserRequest;
import com.labelai.dto.response.HistoryResponse;
import com.labelai.dto.response.UserResponse;
import com.labelai.service.AdminService;
import com.labelai.service.HistoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {
    
    private final AdminService adminService;
    private final HistoryService historyService;
    
    /**
     * 전체 사용자 목록
     * GET /api/admin/users
     * 
     * Response: UserResponse[]
     */
    @GetMapping("/users")
    public ResponseEntity<List<UserResponse>> getAllUsers() {
        List<UserResponse> users = adminService.getAllUsers();
        return ResponseEntity.ok(users);
    }
    
    /**
     * 사용자 생성
     * POST /api/admin/users
     * 
     * Request Body:
     * {
     *   "name": "string",
     *   "username": "string",
     *   "email": "string"
     * }
     * 
     * Response: UserResponse
     * 비밀번호는 username과 동일하게 자동 설정, isFirstLogin = true
     */
    @PostMapping("/users")
    public ResponseEntity<UserResponse> createUser(@RequestBody CreateUserRequest request) {
        UserResponse user = adminService.createUser(request);
        return ResponseEntity.ok(user);
    }
    
    /**
     * 사용자 삭제
     * DELETE /api/admin/users/{id}
     */
    @DeleteMapping("/users/{id}")
    public ResponseEntity<Void> deleteUser(@PathVariable Long id) {
        adminService.deleteUser(id);
        return ResponseEntity.ok().build();
    }
    
    /**
     * 사용자 상세 조회
     * GET /api/admin/users/{id}
     * 
     * Response: UserResponse
     */
    @GetMapping("/users/{id}")
    public ResponseEntity<UserResponse> getUserDetail(@PathVariable Long id) {
        UserResponse user = adminService.getUserDetail(id);
        return ResponseEntity.ok(user);
    }
    
    /**
     * 전체 이력 조회
     * GET /api/admin/history
     * 
     * Response: HistoryResponse[]
     * 모든 사용자의 이력을 반환
     */
    @GetMapping("/history")
    public ResponseEntity<List<HistoryResponse>> getAllHistory() {
        List<HistoryResponse> history = historyService.getAllHistory();
        return ResponseEntity.ok(history);
    }
    
    /**
     * 이력 삭제 (관리자)
     * DELETE /api/admin/history
     * 
     * Request Body: number[] (id 배열)
     */
    @DeleteMapping("/history")
    public ResponseEntity<Void> deleteHistory(@RequestBody List<Long> ids) {
        historyService.deleteHistories(ids);
        return ResponseEntity.ok().build();
    }
}