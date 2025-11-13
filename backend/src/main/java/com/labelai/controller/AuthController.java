package com.labelai.controller;

import com.labelai.dto.request.LoginRequest;
import com.labelai.dto.response.LoginResponse;
import com.labelai.service.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {
    
    private final AuthService authService;
    
    /**
     * 로그인
     * POST /api/auth/login
     * 
     * Request Body:
     * {
     *   "username": "string",
     *   "password": "string"
     * }
     * 
     * Response:
     * {
     *   "token": "string",
     *   "username": "string",
     *   "name": "string",
     *   "email": "string",
     *   "isAdmin": boolean,
     *   "isFirstLogin": boolean
     * }
     */
    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@RequestBody LoginRequest request) {
        LoginResponse response = authService.login(request);
        return ResponseEntity.ok(response);
    }
    
    /**
     * 로그아웃
     * POST /api/auth/logout
     * (클라이언트에서 토큰 삭제, 서버는 200 OK만 반환)
     */
    @PostMapping("/logout")
    public ResponseEntity<Void> logout() {
        // 토큰 기반이므로 서버에서는 특별한 처리 없음
        return ResponseEntity.ok().build();
    }
}