package com.campus.ai.common;

/**
 * 当前登录用户上下文 — 基于 ThreadLocal
 * 在 AuthInterceptor 中设置，请求完成后自动清除
 */
public class UserContext {

    private static final ThreadLocal<String> currentUserHolder = new ThreadLocal<>();
    private static final String DEFAULT_OPERATOR = "管理员";

    /** 设置当前登录用户名 */
    public static void setCurrentUser(String username) {
        currentUserHolder.set(username);
    }

    /** 获取当前登录用户名（不存在时返回默认值"管理员"） */
    public static String getCurrentUser() {
        String user = currentUserHolder.get();
        return user != null ? user : DEFAULT_OPERATOR;
    }

    /** 清除上下文（请求完成后由拦截器调用） */
    public static void clear() {
        currentUserHolder.remove();
    }
}
