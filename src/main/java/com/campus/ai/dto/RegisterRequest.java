package com.campus.ai.dto;

import lombok.Data;

/**
 * 注册请求
 */
@Data
public class RegisterRequest {
    private String username;
    private String password;
    private String realName;
    private String phone;
    /** 角色：student / teacher / admin */
    private String role;
    /** 证书验证码（教师/管理员注册时需要） */
    private String certificateCode;
}
