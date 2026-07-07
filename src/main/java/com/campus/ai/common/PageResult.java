package com.campus.ai.common;

import lombok.Data;

import java.util.List;

/**
 * 分页结果封装
 */
@Data
public class PageResult<T> {

    private List<T> list;
    private long total;
    private int page;
    private int size;

    public static <T> PageResult<T> of(List<T> list, long total, int page, int size) {
        PageResult<T> r = new PageResult<>();
        r.setList(list);
        r.setTotal(total);
        r.setPage(page);
        r.setSize(size);
        return r;
    }

    /** 从总数据中手动分页（用于简单场景） */
    public static <T> PageResult<T> slice(List<T> all, int page, int size) {
        int total = all.size();
        int from = (page - 1) * size;
        int to = Math.min(from + size, total);
        List<T> list = (from >= total) ? List.of() : all.subList(from, to);
        return of(list, total, page, size);
    }
}
