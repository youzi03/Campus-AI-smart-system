package com.campus.ai.common;

/**
 * 资源未找到异常（HTTP 404）
 */
public class ResourceNotFoundException extends RuntimeException {

    private final int code;

    public ResourceNotFoundException(String message) {
        super(message);
        this.code = 404;
    }

    public int getCode() {
        return code;
    }
}
