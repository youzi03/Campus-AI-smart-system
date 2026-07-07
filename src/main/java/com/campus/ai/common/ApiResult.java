package com.campus.ai.common;

import lombok.Data;

/**
 * 统一 API 响应封装
 */
@Data
public class ApiResult<T> {

    private int code;
    private String message;
    private T data;

    private ApiResult() {}

    private ApiResult(int code, String message, T data) {
        this.code = code;
        this.message = message;
        this.data = data;
    }

    /** 成功响应（带数据） */
    public static <T> ApiResult<T> success(T data) {
        return new ApiResult<>(200, "success", data);
    }

    /** 成功响应（无数据） */
    public static <T> ApiResult<T> success() {
        return new ApiResult<>(200, "success", null);
    }

    /** 失败响应（自定义状态码） */
    public static <T> ApiResult<T> error(int code, String message) {
        return new ApiResult<>(code, message, null);
    }

    /** 失败响应（默认 500） */
    public static <T> ApiResult<T> error(String message) {
        return new ApiResult<>(500, message, null);
    }
}
