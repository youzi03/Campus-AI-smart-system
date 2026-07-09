-- =============================================================
-- 数据库清理脚本 — 删除项目中无实体映射的旧表
-- 使用方式：mysql -u campus_user -p campus_ai < cleanup.sql
-- =============================================================

-- 旧版 RBAC 表（uc_* 前缀），无对应 JPA 实体，无法使用
DROP TABLE IF EXISTS uc_role_permission;
DROP TABLE IF EXISTS uc_role;
DROP TABLE IF EXISTS uc_permission;
DROP TABLE IF EXISTS uc_user;

SELECT '已清理 4 张旧表 (uc_role, uc_permission, uc_role_permission, uc_user)' AS 结果;

-- =============================================================
-- 当前 JPA 实体映射的表（由 ddl-auto: update 自动管理）：
--   student        → Student.java
--   teacher        → Teacher.java
--   op_log         → OpLog.java
--   sys_user       → User.java（已有，系统登录用）
--   registration_certificate → RegistrationCertificate.java
-- =============================================================
