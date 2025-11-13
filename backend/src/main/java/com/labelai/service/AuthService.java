package com.labelai.service;

import com.labelai.dto.request.LoginRequest;
import com.labelai.dto.response.LoginResponse;
import com.labelai.entity.User;
import com.labelai.repository.UserRepository;
import com.labelai.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

/**
 * 인증 서비스
 * 로그인, 로그아웃, 토큰 갱신 처리
 */
@Service
@RequiredArgsConstructor
public class AuthService {
    
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    
    /**
     * 로그인 처리
     */
    public LoginResponse login(LoginRequest request) {
        User user = userRepository.findByUsername(request.getUsername())
                .orElseThrow(() -> new RuntimeException("사용자를 찾을 수 없습니다."));
        
        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new RuntimeException("비밀번호가 일치하지 않습니다.");
        }
        
        // 마지막 활동 시간 업데이트
        updateLastActive(user);
        
        // JWT 토큰 생성
        String token = jwtUtil.generateToken(user.getUsername());
        
        return LoginResponse.builder()
                .token(token)
                .username(user.getUsername())
                .name(user.getName())
                .email(user.getEmail())
                .isAdmin(user.getIsAdmin())
                .isFirstLogin(user.getIsFirstLogin())
                .build();
    }
    
    /**
     * 마지막 활동 시간 업데이트
     */
    private void updateLastActive(User user) {
        LocalDateTime now = LocalDateTime.now();
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy.MM.dd HH:mm");
        user.setLastActive(now.format(formatter));
        userRepository.save(user);
    }
}