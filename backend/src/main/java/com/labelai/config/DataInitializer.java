package com.labelai.config;

import com.labelai.entity.User;
import com.labelai.repository.UserRepository;
import com.labelai.util.DateUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

/**
 * 애플리케이션 시작 시 초기 데이터 생성
 */
@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {
    
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    
    @Override
    public void run(String... args) {
        // 관리자 계정이 없으면 생성
        if (!userRepository.existsByUsername("admin")) {
            User admin = User.builder()
                    .username("admin")
                    .password(passwordEncoder.encode("admin"))
                    .name("관리자")
                    .email("admin@company.com")
                    .isAdmin(true)
                    .isFirstLogin(false)
                    .createdAt(DateUtil.getCurrentDate())
                    .lastActive("-")
                    .build();
            
            userRepository.save(admin);
            
            System.out.println("========================================");
            System.out.println("초기 관리자 계정 생성 완료");
            System.out.println("아이디: admin");
            System.out.println("비밀번호: admin");
            System.out.println("========================================");
        }
    }
}