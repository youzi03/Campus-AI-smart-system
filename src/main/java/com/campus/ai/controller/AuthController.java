package com.campus.ai.controller;

import com.campus.ai.common.ApiResult;
import com.campus.ai.dto.LoginRequest;
import com.campus.ai.dto.LoginResponse;
import com.campus.ai.dto.UserInfo;
import com.campus.ai.service.AuthService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    /**
     * 登录
     */
    @PostMapping("/login")
    public ApiResult<LoginResponse> login(@RequestBody LoginRequest request) {
        LoginResponse response = authService.login(request.getUsername(), request.getPassword());
        return ApiResult.success(response);
    }

    /**
     * 获取当前登录用户信息（需 token）
     */
    @GetMapping("/me")
    public ApiResult<UserInfo> me(HttpServletRequest request) {
        String username = (String) request.getAttribute("currentUser");
        UserInfo userInfo = authService.getCurrentUser(username);
        return ApiResult.success(userInfo);
    }
}
