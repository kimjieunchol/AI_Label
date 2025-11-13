package com.labelai.dto.request;

import lombok.Data;

/**
 * 사용자 생성 요청 DTO (관리자용)
 */
@Data
public class CreateUserRequest {
    private String name;
    private String username;
    private String email;
}