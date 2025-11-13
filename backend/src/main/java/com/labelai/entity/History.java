package com.labelai.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * 이력 엔티티
 */
@Entity
@Table(name = "history")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class History {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false)
    private String type; // "validate" or "translate"
    
    @Column(nullable = false)
    private String fileName;
    
    private String date;
    private String time;
    
    @Column(nullable = false)
    private String status; // "completed" or "failed"
    
    private Integer errorCount;
    private Integer warningCount;
    private String country;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;
}
