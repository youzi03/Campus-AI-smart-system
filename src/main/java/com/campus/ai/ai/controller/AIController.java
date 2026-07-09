package com.campus.ai.ai.controller;

import com.campus.ai.ai.dto.AnalyzeRequest;
import com.campus.ai.ai.dto.AnalyzeResponse;
import com.campus.ai.ai.dto.DataSnapshot;
import com.campus.ai.ai.service.AIService;
import com.campus.ai.common.ApiResult;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

/**
 * AI 分析 REST 控制器 — 提供 AI 数据分析 API
 */
@RestController
@RequestMapping("/api/ai")
@RequiredArgsConstructor
public class AIController {

    private final AIService aiService;

    /**
     * AI 智能分析 — 根据请求类型和参数，调用 DeepSeek 大模型进行数据分析
     *
     * @param request 分析请求 {type, params, query, stream}
     * @return 分析结果 {analysis, suggestions, dataSnapshot, type}
     */
    @PostMapping("/analyze")
    public ApiResult<AnalyzeResponse> analyze(@RequestBody AnalyzeRequest request) {
        AnalyzeResponse result = aiService.analyze(request);
        return ApiResult.success(result);
    }

    /**
     * 获取系统数据总览快照（前端 AI 看板展示用）
     */
    @GetMapping("/data-snapshot")
    public ApiResult<DataSnapshot> dataSnapshot() {
        return ApiResult.success(aiService.getDataSnapshot());
    }

    /**
     * 快速分析 — 简化版接口，传入查询文本进行快速分析
     *
     * @param request 含 query 字段的分析请求
     * @return 分析结果
     */
    @PostMapping("/quick-analyze")
    public ApiResult<AnalyzeResponse> quickAnalyze(@RequestBody AnalyzeRequest request) {
        request.setType("custom_query");
        return ApiResult.success(aiService.analyze(request));
    }
}
