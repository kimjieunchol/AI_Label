package com.labelai.service;

import com.labelai.dto.request.CreateUserRequest;
import com.labelai.dto.response.UserResponse;
import com.labelai.entity.User;
import com.labelai.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.stream.Collectors;

/**
 * 관리자 서비스
 * 사용자 CRUD, 전체 이력 관리
 */
@Service
@RequiredArgsConstructor
public class AdminService {
    
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    
    /**
     * 전체 사용자 목록 조회
     */
    public List<UserResponse> getAllUsers() {
        return userRepository.findAll().stream()
                .filter(user -> !user.getIsAdmin()) // 관리자 제외
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }
    
    /**
     * 사용자 생성
     */
    public UserResponse createUser(CreateUserRequest request) {
        // 중복 체크
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new RuntimeException("이미 존재하는 아이디입니다.");
        }
        
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("이미 존재하는 이메일입니다.");
        }
        
        // 사용자 생성
        User user = new User();
        user.setName(request.getName());
        user.setUsername(request.getUsername());
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getUsername())); // 초기 비밀번호 = 아이디
        user.setIsAdmin(false);
        user.setIsFirstLogin(true);
        
        LocalDateTime now = LocalDateTime.now();
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy.MM.dd");
        user.setCreatedAt(now.format(formatter));
        user.setLastActive("-");
        
        User savedUser = userRepository.save(user);
        return convertToResponse(savedUser);
    }
    
    /**
     * 사용자 삭제
     */
    public void deleteUser(Long userId) {
        if (!userRepository.existsById(userId)) {
            throw new RuntimeException("사용자를 찾을 수 없습니다.");
        }
        userRepository.deleteById(userId);
    }
    
    /**
     * 사용자 상세 조회
     */
    public UserResponse getUserDetail(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("사용자를 찾을 수 없습니다."));
        
        return convertToResponse(user);
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