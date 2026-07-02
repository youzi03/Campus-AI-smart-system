-- =============================================================
-- campus_ai 数据库种子数据
-- 说明：数据库存在 4 张 uc_* 表（无 AUTO_INCREMENT），需手动指定 id
-- 密码：每个用户各不相同（详见注释）
-- =============================================================

-- ==================== 角色表 ====================
INSERT INTO uc_role (id, role_name) VALUES
(1, '超级管理员'),
(2, '系统管理员'),
(3, '教师'),
(4, '学生');

-- ==================== 权限表 ====================
INSERT INTO uc_permission (id, permission_code, resource_url) VALUES
(1,  'user:list',       '/api/user/list'),
(2,  'user:create',     '/api/user/create'),
(3,  'user:edit',       '/api/user/edit'),
(4,  'user:delete',     '/api/user/delete'),
(5,  'role:list',       '/api/role/list'),
(6,  'role:assign',     '/api/role/assign'),
(7,  'course:list',     '/api/course/list'),
(8,  'course:create',   '/api/course/create'),
(9,  'course:edit',     '/api/course/edit'),
(10, 'course:delete',   '/api/course/delete'),
(11, 'grade:view',      '/api/grade/view'),
(12, 'grade:edit',      '/api/grade/edit');

-- ==================== 角色-权限关联 ====================
-- 超级管理员 → 所有权限
INSERT INTO uc_role_permission (role_id, permission) VALUES
(1, 1), (1, 2), (1, 3), (1, 4), (1, 5), (1, 6),
(1, 7), (1, 8), (1, 9), (1, 10), (1, 11), (1, 12);

-- 系统管理员 → 用户管理 + 角色管理
INSERT INTO uc_role_permission (role_id, permission) VALUES
(2, 1), (2, 2), (2, 3), (2, 4), (2, 5), (2, 6);

-- 教师 → 课程管理 + 成绩查看/编辑
INSERT INTO uc_role_permission (role_id, permission) VALUES
(3, 7), (3, 8), (3, 9), (3, 10), (3, 11), (3, 12);

-- 学生 → 课程查看 + 成绩查看
INSERT INTO uc_role_permission (role_id, permission) VALUES
(4, 7), (4, 11);

-- ==================== 用户表 ====================
-- 管理员 (role_id=1,2)  密码: admin=Admin@2024, superadmin=Super@2024
INSERT INTO uc_user (id, username, password_hash, role_id, phone) VALUES
(1, 'admin',      '$2b$10$lVqfOV2.oZ72fVe1J68J9emRoCRpQ6J8lDneZ0yXQNsXrpje2cv5S', 1, '15595822412'),
(2, 'superadmin', '$2b$10$PzVLi/xa0fgTTXTRdYdHbeVWtimAMgLfhHCveXyZ8CHN0a8/XhbiG', 2, '13913356886');

-- 教师 (role_id=3)  密码: zhangsan=Zhang@123, lisi=Lisi@123, wangwu=Wang@123, zhaoliu=Zhao@123, sunqi=Sunqi@123
INSERT INTO uc_user (id, username, password_hash, role_id, phone) VALUES
(3,  'zhangsan', '$2b$10$kBYuvedKTZ6e4FL.Ee0GdO/2cGbWOcJR5brl.UyEm5e/I1ZeU2Tje', 3, '15546913810'),
(4,  'lisi',     '$2b$10$./5ABmgsRLBeA3HGFizjoOLoJ/imhRz3CvN984.feXKL4OGPyaYQW', 3, '17039958838'),
(5,  'wangwu',   '$2b$10$8/3fi2HSRbt1Y1cycDXJnumBG82ohaH8otlbRNNts8zgI21mdnGxu', 3, '15023756669'),
(6,  'zhaoliu',  '$2b$10$YxKmQavcH95qyDMGGzUvqeCkBOQzfbDvp1dN7lGobYGa0.Q361Rjm', 3, '19221668732'),
(7,  'sunqi',    '$2b$10$p1M.7Ql10KP1iY28n01nbOY2jjG/8W3Y5vOBde4Uqp6YEBaUqwemi', 3, '19766629388');

-- 学生 (role_id=4)  密码格式: XXX@abc
INSERT INTO uc_user (id, username, password_hash, role_id, phone) VALUES
(8,  '2024001', '$2b$10$/rsXQ9OSek8.kJbaLYSDnuN2v4PlCL3gGrH1XD4Q7wDHabcMKDTl6', 4, '13213999315'),
(9,  '2024002', '$2b$10$42wRehC5oXC5BLAuwQwQf.gH7hMH5HyqWnRH.H5p/6jouYVrjLFuC', 4, '13739345092'),
(10, '2024003', '$2b$10$UpBLNtva.xaBMHoEriVvkOVgI/t6T2awRmmNaVn/T7ZLe54XSShjC', 4, '15977827638'),
(11, '2024004', '$2b$10$GWBgTM95BuURoZeKkXid6e1Mdia/AHPJ6jQozDU.mK7GCvk3Iw8Ti', 4, '19813561597'),
(12, '2024005', '$2b$10$YGSxua7xG/rdBL/FE1aKd.tRgAhcEkRWJD3QLoeia1aHaXzuz9ywG', 4, '19536687537'),
(13, '2024006', '$2b$10$g2TwBSqAWo7rC.TR4fjsneObjZ5U5SgG/IpguZty.ECyi5Al4MNdm', 4, '19266306997'),
(14, '2024007', '$2b$10$gOQGgSmb41FNxr6DZ.IN/e5HP1OLiHHvXf5ldwZNh0rZf3.Lpm2Li', 4, '15970291817'),
(15, '2024008', '$2b$10$ttoOioRGxroTa/c2mJCM9evVsyOziwetwXxDPLt6YNlSgvv/IcDwK', 4, '19747338124'),
(16, '2024009', '$2b$10$FdfEsHNewtz/iiGb4x0sLOn.soLFVJzN4zZoWF.1AQ1G5Qqqk7Tje', 4, '13031429110'),
(17, '2024010', '$2b$10$oRTsxV1PNu8I3S8BGUWsf.5uonpThUqwGE0DRTpAABCWUe0TkmNb.', 4, '18555667651'),
(18, '2024011', '$2b$10$7readwwZ/irAYJBgcVKZM.cOs.cRPeQ/GaYrcLoiRDBGs9uvstOaO', 4, '17230868105'),
(19, '2024012', '$2b$10$Mq.RL/9WVo0sHzLBwvGFDOsExjNPDduk3hA6Lc1P/nhBixvsvlI7a', 4, '15855176955');
