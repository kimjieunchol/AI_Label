package com.labelai.repository;

import com.labelai.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

/**
 * 사용자 데이터 접근 레포지토리
 */
@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    /**
     * username으로 사용자 찾기
     */
    Optional<User> findByUsername(String username);
    
    /**
     * username 중복 체크
     */
    boolean existsByUsername(String username);
    
    /**
     * email 중복 체크
     */
    boolean existsByEmail(String email);
}