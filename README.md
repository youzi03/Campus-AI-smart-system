# Campus-AI-smart-system

校园 AI 智能系统

## 项目简介

基于人工智能的校园智能系统，后端使用 Java + Spring Boot 3 + MySQL。

## 技术栈

- **语言**: Java 17
- **框架**: Spring Boot 3.3.4, Spring Data JPA
- **数据库**: MySQL 8.0
- **构建工具**: Maven 3.9.16

## 快速启动

```bash
# 编译
mvn clean compile

# 运行
mvn spring-boot:run
```

访问 `http://localhost:8080/api/health` 验证服务状态。

## 数据库配置

| 配置项 | 值 |
|--------|-----|
| 数据库 | `campus_ai` |
| 用户名 | `campus_user` |
| 密码 | `Campus@2024` |

> 数据库配置文件: `src/main/resources/application.yml`
