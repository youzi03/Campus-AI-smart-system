package com.campus.ai.ai.service;

import com.campus.ai.ai.config.AIConfig;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.List;
import java.util.Map;

/**
 * DeepSeek API 客户端 — 封装与 DeepSeek 大模型的 HTTP 通信
 * 异常向上传播，由 AIService 统一处理为业务错误响应
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class DeepSeekClient {

    private final RestTemplate restTemplate;
    private final AIConfig aiConfig;
    private final ObjectMapper objectMapper;

    /**
     * 向 DeepSeek 发送对话请求，返回 AI 回复文本
     *
     * @param systemPrompt  系统提示词（设定角色和规则）
     * @param userPrompt    用户提示词（具体分析请求和数据）
     * @return AI 生成的回复文本
     * @throws Exception API 调用或响应解析失败时向上抛出
     */
    public String chat(String systemPrompt, String userPrompt) throws Exception {
        // 构建请求体（兼容 OpenAI 格式）
        var requestBody = Map.of(
            "model", aiConfig.getModel(),
            "temperature", aiConfig.getTemperature(),
            "max_tokens", aiConfig.getMaxTokens(),
            "messages", List.of(
                Map.of("role", "system", "content", systemPrompt),
                Map.of("role", "user", "content", userPrompt)
            )
        );

        log.debug("DeepSeek request model={}", aiConfig.getModel());

        // 发送 HTTP POST 请求
        var headers = new org.springframework.http.HttpHeaders();
        headers.set("Authorization", "Bearer " + aiConfig.getApiKey());
        headers.set("Content-Type", "application/json");

        var entity = new org.springframework.http.HttpEntity<>(requestBody, headers);
        var response = restTemplate.postForEntity(aiConfig.getApiUrl(), entity, String.class);

        var responseBody = response.getBody();
        log.debug("DeepSeek response received, length={}", responseBody != null ? responseBody.length() : 0);

        // 解析响应，提取 content
        var root = objectMapper.readTree(responseBody);
        var choice = root.path("choices").get(0);
        if (choice == null) {
            var errorMsg = root.has("error") ? root.get("error").toString() : "响应格式异常";
            throw new RuntimeException("DeepSeek API 返回异常: " + errorMsg);
        }
        return choice.path("message").path("content").asText();
    }

    /**
     * 检查 DeepSeek API 是否可连通
     */
    public boolean health() {
        try {
            chat("你是一个助手", "回复'ok'表示连通");
            return true;
        } catch (Exception e) {
            log.warn("DeepSeek 连通性检查失败", e);
            return false;
        }
    }
}
