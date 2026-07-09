package com.campus.ai.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;

import java.util.Map;

/**
 * 当前登录用户信息
 */
@Data
@Builder
@AllArgsConstructor
public class UserInfo {
    private Long id;
    private String username;
    private String realName;
    private String role;
    /** 关联的档案信息（学生或教师的简要字段） */
    private Map<String, Object> profile;
}
