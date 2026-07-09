package com.campus.ai.ai.dto;

import lombok.Data;

/**
 * AI 分析响应 DTO
 */
@Data
public class AnalyzeResponse {

    /** AI 生成的分析文本（Markdown 格式） */
    private String analysis;

    /** 补充建议列表 */
    private java.util.List<String> suggestions;

    /** 数据快照（用于前端展示的原始数据摘要） */
    private DataSnapshot dataSnapshot;

    /** 分析类型 */
    private String type;

    /** 错误信息（如有） */
    private String error;

    /** 是否成功 */
    private boolean success = true;

    public static AnalyzeResponse ok(String analysis, java.util.List<String> suggestions, DataSnapshot snapshot, String type) {
        var r = new AnalyzeResponse();
        r.setAnalysis(analysis);
        r.setSuggestions(suggestions);
        r.setDataSnapshot(snapshot);
        r.setType(type);
        r.setSuccess(true);
        return r;
    }

    public static AnalyzeResponse fail(String error) {
        var r = new AnalyzeResponse();
        r.setError(error);
        r.setSuccess(false);
        return r;
    }
}
