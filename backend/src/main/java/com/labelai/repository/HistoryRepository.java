package com.labelai.repository;

import com.labelai.entity.History;
import com.labelai.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

/**
 * 이력 데이터 접근 레포지토리
 */
@Repository
public interface HistoryRepository extends JpaRepository<History, Long> {
    /**
     * 사용자별 이력 조회 (페이징)
     */
    Page<History> findByUserOrderByIdDesc(User user, Pageable pageable);
    
    /**
     * 사용자별 이력 조회 (전체)
     */
    List<History> findByUserOrderByIdDesc(User user);
    
    /**
     * 전체 이력 조회 (페이징, 최신순)
     */
    Page<History> findAllByOrderByIdDesc(Pageable pageable);
}