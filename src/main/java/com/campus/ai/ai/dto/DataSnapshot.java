package com.campus.ai.ai.dto;

import lombok.Data;

/**
 * 数据快照 — 汇总系统关键数据供 AI 分析使用
 */
@Data
public class DataSnapshot {

    /** 学生总数 */
    private long studentCount;

    /** 教师总数 */
    private long teacherCount;

    /** 课程总数 */
    private long courseCount;

    /** 成绩记录数 */
    private long scoreCount;

    /** 不及格人数 */
    private long failCount;

    /** 全校平均分 */
    private String averageScore;

    /** 借阅记录数 */
    private long borrowCount;

    /** 逾期记录数 */
    private long overdueCount;

    /** 宿舍入住率 */
    private String dormOccupancy;

    /** 近一个月新增公告数 */
    private long recentNoticeCount;
}
