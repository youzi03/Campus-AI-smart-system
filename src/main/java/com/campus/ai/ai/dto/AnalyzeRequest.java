package com.campus.ai.ai.dto;

import lombok.Data;

/**
 * AI 分析请求 DTO
 */
@Data
public class AnalyzeRequest {

    /** 分析类型: score_analysis | student_profile | teaching_evaluation | borrow_analysis | dorm_analysis | custom_query */
    private String type;

    /** 附加参数（如学生ID、课程ID、学期等） */
    private java.util.Map<String, Object> params;

    /** 用户自定义查询（用于 custom_query 类型） */
    private String query;

    /** 是否流式输出（默认 false） */
    private boolean stream = false;
}
