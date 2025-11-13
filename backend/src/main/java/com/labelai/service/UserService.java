package com.labelai.service;

import com.labelai.dto.request.ChangePasswordRequest;
import com.labelai.dto.response.UserResponse;
import com.labelai.entity.User;
import com.labelai.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

/**
 * 사용자 서비스
 * 프로필 조회, 비밀번호 변경 등
 */
@Service
@RequiredArgsConstructor
public class UserService {
    
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    
    /**
     * 사용자 프로필 조회
     */
    public UserResponse getProfile(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("사용자를 찾을 수 없습니다."));
        
        return convertToResponse(user);
    }
    
    /**
     * 비밀번호 변경
     */
    public void changePassword(String username, ChangePasswordRequest request) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("사용자를 찾을 수 없습니다."));
        
        // 현재 비밀번호 확인
        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPassword())) {
            throw new RuntimeException("현재 비밀번호가 일치하지 않습니다.");
        }
        
        // 새 비밀번호로 변경
        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        user.setIsFirstLogin(false); // 첫 로그인 플래그 해제
        userRepository.save(user);
    }
    
    /**
     * Entity -> DTO 변환
     */
    private UserResponse convertToResponse(User user) {
        return UserResponse.builder()
                .id(user.getId())
                .username(user.getUsername())
                .name(user.getName())
                .email(user.getEmail())
                .createdAt(user.getCreatedAt())
                .lastActive(user.getLastActive())
                .isFirstLogin(user.getIsFirstLogin())
                .build();
    }
}
