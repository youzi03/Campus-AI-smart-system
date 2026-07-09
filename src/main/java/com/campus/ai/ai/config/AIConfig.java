package com.campus.ai.ai.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

/**
 * AI 大模型配置 — 从 application.yml 读取 deepseek 配置
 */
@Data
@Configuration
@ConfigurationProperties(prefix = "deepseek")
public class AIConfig {

    /** API 请求地址 */
    private String apiUrl = "https://api.deepseek.com/v1/chat/completions";

    /** API Key */
    private String apiKey;

    /** 使用的模型名称 */
    private String model = "deepseek-chat";

    /** 温度参数 (0-2)，越低越确定 */
    private double temperature = 0.7;

    /** 最大输出 Token 数 */
    private int maxTokens = 2048;
}
