package com.labelai.dto.request;

import lombok.Data;

/**
 * 비밀번호 변경 요청 DTO
 */
@Data
public class ChangePasswordRequest {
    private String currentPassword;
    private String newPassword;
}