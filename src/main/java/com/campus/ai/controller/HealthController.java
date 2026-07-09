package com.campus.ai.controller;

import com.campus.ai.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequiredArgsConstructor
public class HealthController {

    private final UserRepository userRepository;

    /**
     * 健康检查接口 — 同时验证数据库连接
     */
    @GetMapping("/api/health")
    public ResponseEntity<Map<String, Object>> health() {
        Map<String, Object> result = new HashMap<>();
        result.put("status", "UP");
        result.put("application", "campus-ai-system");

        try {
            long count = userRepository.count();
            result.put("database", "CONNECTED");
            result.put("userCount", count);
        } catch (Exception e) {
            result.put("database", "DISCONNECTED");
            result.put("error", e.getMessage());
        }

        return ResponseEntity.ok(result);
    }
}
