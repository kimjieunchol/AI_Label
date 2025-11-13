package com.labelai.service;

import com.labelai.dto.response.HistoryResponse;
import com.labelai.entity.History;
import com.labelai.entity.User;
import com.labelai.repository.HistoryRepository;
import com.labelai.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.stream.Collectors;

/**
 * 이력 관리 서비스
 */
@Service
@RequiredArgsConstructor
public class HistoryService {
    
    private final HistoryRepository historyRepository;
    private final UserRepository userRepository;
    
    /**
     * 사용자별 이력 조회
     */
    public List<HistoryResponse> getUserHistory(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("사용자를 찾을 수 없습니다."));
        
        return historyRepository.findByUserOrderByIdDesc(user).stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }
    
    /**
     * 전체 이력 조회 (관리자용)
     */
    public List<HistoryResponse> getAllHistory() {
        return historyRepository.findAll().stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }
    
    /**
     * 이력 생성
     */
    @Transactional
    public HistoryResponse createHistory(String username, History history) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("사용자를 찾을 수 없습니다."));
        
        history.setUser(user);
        History savedHistory = historyRepository.save(history);
        return convertToResponse(savedHistory);
    }
    
    /**
     * 사용자의 이력 삭제 (권한 검증 포함)
     * 사용자는 자신의 이력만 삭제 가능
     */
    @Transactional
    public void deleteUserHistories(String username, List<Long> ids) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("사용자를 찾을 수 없습니다."));
        
        // 삭제하려는 이력들이 모두 해당 사용자의 것인지 확인
        List<History> historiesToDelete = historyRepository.findAllById(ids);
        
        for (History history : historiesToDelete) {
            if (!history.getUser().getId().equals(user.getId())) {
                throw new RuntimeException("다른 사용자의 이력은 삭제할 수 없습니다.");
            }
        }
        
        historyRepository.deleteAllById(ids);
    }
    
    /**
     * 이력 삭제 (관리자용 - 권한 검증 없음)
     */
    @Transactional
    public void deleteHistories(List<Long> ids) {
        historyRepository.deleteAllById(ids);
    }
    
    /**
     * Entity -> DTO 변환
     */
    private HistoryResponse convertToResponse(History history) {
        return HistoryResponse.builder()
                .id(history.getId())
                .type(history.getType())
                .fileName(history.getFileName())
                .date(history.getDate())
                .time(history.getTime())
                .status(history.getStatus())
                .errorCount(history.getErrorCount())
                .warningCount(history.getWarningCount())
                .country(history.getCountry())
                .userId(history.getUser().getUsername())
                .build();
    }
}