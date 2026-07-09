# 📋 智慧校园系统 — 项目计划书

> 项目名称：Campus AI Smart System（校园 AI 智能系统）
> 技术栈：Spring Boot 3.3.4 + Vue 3 + Element Plus + MySQL
> 状态：🟡 开发中（Phase 0-1 完成）

---

## 📊 项目总览

```
Campus-AI-smart-system/
├── 🖥️ 后端 (Spring Boot + JPA + MySQL)
│   └── src/main/java/com/campus/ai/
│       ├── common/        — 通用工具（响应封装/异常/处理器）
│       ├── config/        — 配置（CORS/数据初始化）
│       ├── controller/    — REST API 控制器
│       ├── entity/        — JPA 实体
│       ├── repository/    — 数据访问层
│       └── service/       — 业务逻辑层
│
├── 🎨 前端 (Vue 3 CDN + Element Plus)
│   └── smart-campus-web/
│       ├── index.html     — 入口
│       ├── src/
│       │   ├── app.js     — 主布局 + 路由
│       │   ├── pages/     — 页面组件（7 文件）
│       │   ├── services/  — 数据服务（7 文件含 api-client）
│       │   ├── styles/    — 样式
│       │   └── utils/     — 工具函数
│       └── public/
│
├── 🗄️ 数据库 (MySQL)
│   ├── application.yml    — 数据库配置
│   └── seed-data.sql      — 种子数据参考
│
├── 📄 项目计划-PROJECT-PLAN.md  ← 本文件
└── pom.xml                — Maven 构建
```

---

## 🎯 分阶段开发计划

### Phase 0 ✅ 已完成 — 项目基础设施

**目标**：打通前后端通信通道，建立 API 规范

| # | 任务 | 文件 | 状态 |
|---|---|---|---|
| 0.1 | 统一响应封装 `ApiResult<T>` + `PageResult` | `common/ApiResult.java` | ✅ |
| 0.2 | 自定义异常类（BusinessException / ResourceNotFoundException） | `common/` | ✅ |
| 0.3 | 全局异常处理器（@RestControllerAdvice） | `common/GlobalExceptionHandler.java` | ✅ |
| 0.4 | CORS 跨域配置 | `config/CorsConfig.java` | ✅ |
| 0.5 | 前端 API 客户端封装（fetch + 统一错误处理） | `services/api-client.js` | ✅ |

---

### Phase 1 ✅ 已完成 — 用户信息模块

**目标**：学生管理、教师管理、操作日志 CRUD + 批量操作

| # | 任务 | 后端 API | 状态 |
|---|---|---|---|
| 1.1 | **学生管理** — 列表/新增/编辑/删除 | `GET/POST/PUT/DELETE /api/students` | ✅ |
| 1.2 | **学籍状态变更** — 单个/批量 | `PUT /api/students/{id}/status` + `POST /api/students/batch-status` | ✅ |
| 1.3 | **批量录入学生** — CSV/Excel 导入 | `POST /api/students/batch` | ✅ |
| 1.4 | **教师管理** — 列表/新增/编辑/删除 | `GET/POST/PUT/DELETE /api/teachers` | ✅ |
| 1.5 | **批量录入教师** | `POST /api/teachers/batch` | ✅ |
| 1.6 | **操作日志** — 查询/清空 | `GET/DELETE /api/op-logs` | ✅ |
| 1.7 | **首页统计** | `GET /api/stats` | ✅ |
| 1.8 | **种子数据初始化** | `config/DataInitializer.java` | ✅ |
| 1.9 | **前端对接** — 5 个页面改为 API 调用 | `user-service.js` / `user-pages.js` / `app.js` | ✅ |

---

### Phase 2 ⏳ 待开发 — 课程服务模块

**对应前端**：`course-pages.js` · `course-service.js`

| # | 任务 | 后端实体 | API 端点规划 |
|---|---|---|---|
| 2.1 | **课程管理** | `Course` | `GET/POST/PUT/DELETE /api/courses` |
| 2.2 | **教室管理** | `Classroom` | `GET/POST/PUT/DELETE /api/classrooms` |
| 2.3 | **实验室管理** | `Lab` | `GET/POST/PUT/DELETE /api/labs` |
| 2.4 | **教学任务** | `TeachingTask` | `GET/POST/PUT/DELETE /api/teaching-tasks` |
| 2.5 | **课表查看** | `Schedule` | `GET /api/schedules` |
| 2.6 | **前端对接** | — | 改造 `course-service.js` + `course-pages.js` |

**数据库表**：`course` / `classroom` / `lab` / `teaching_task` / `schedule`

---

### Phase 3 ⏳ 待开发 — 成绩服务模块

**对应前端**：`score-pages.js` · `score-service.js`

| # | 任务 | API 端点规划 |
|---|---|---|
| 3.1 | **成绩录入** — 单条/批量 | `POST /api/scores` |
| 3.2 | **成绩查询** — 按学生/课程/学期 | `GET /api/scores` |
| 3.3 | **成绩统计** — 平均分/最高/最低/及格率 | `GET /api/scores/statistics` |
| 3.4 | **成绩预警** — 不及格/低分提醒 | `GET /api/scores/warnings` |
| 3.5 | **前端对接** | 改造 `score-service.js` + `score-pages.js` |

**数据库表**：`score`

---

### Phase 4 ⏳ 待开发 — 公告服务模块

**对应前端**：`notice-pages.js` · `notice-service.js`

| # | 任务 | API 端点规划 |
|---|---|---|
| 4.1 | **公告管理** — 发布/编辑/删除 | `GET/POST/PUT/DELETE /api/notices` |
| 4.2 | **公告置顶** | `PUT /api/notices/{id}/pin` |
| 4.3 | **公告推送** | `POST /api/notices/{id}/push` |
| 4.4 | **预警消息** | `GET /api/notices/warnings` |
| 4.5 | **前端对接** | 改造 `notice-service.js` + `notice-pages.js` |

**数据库表**：`notice`

---

### Phase 5 ⏳ 待开发 — 宿舍服务模块

**对应前端**：`dorm-pages.js` · `dorm-service.js`

| # | 任务 | API 端点规划 |
|---|---|---|
| 5.1 | **宿舍房间管理** — 列表/新增/编辑/删除 | `GET/POST/PUT/DELETE /api/dorm-rooms` |
| 5.2 | **住宿分配** — 入住/退宿/调宿 | `POST/PUT/DELETE /api/dorm-allocations` |
| 5.3 | **楼栋统计** — 使用率/容量 | `GET /api/dorm-rooms/statistics` |
| 5.4 | **前端对接** | 改造 `dorm-service.js` + `dorm-pages.js` |

**数据库表**：`dorm_room` / `dorm_allocation`

---

### Phase 6 ⏳ 待开发 — 图书馆服务模块

**对应前端**：`library-pages.js` · `library-service.js`

| # | 任务 | API 端点规划 |
|---|---|---|
| 6.1 | **图书管理** — 列表/新增/编辑/删除 | `GET/POST/PUT/DELETE /api/books` |
| 6.2 | **借阅管理** — 借书/还书/续借 | `POST/PUT /api/borrow-records` |
| 6.3 | **逾期判断** — 自动标记逾期 | `GET /api/borrow-records/overdue` |
| 6.4 | **馆藏统计** | `GET /api/books/statistics` |
| 6.5 | **前端对接** | 改造 `library-service.js` + `library-pages.js` |

**数据库表**：`book` / `borrow_record`

---

### Phase 7 🎯 规划中 — 认证与部署

| # | 任务 | 说明 |
|---|---|---|
| 7.1 | **登录页面** | 用户名+密码表单 |
| 7.2 | **JWT 认证** | Token 签发/验证 |
| 7.3 | **接口鉴权拦截器** | 未登录拦截 + 角色权限控制 |
| 7.4 | **Docker Compose** | 一键部署（后端 + Nginx + MySQL） |

---

## 📐 API 设计规范

```
统一前缀: /api
响应格式: { "code": 200, "message": "success", "data": {...} }

标准 CRUD 路由:
  GET    /api/{resource}          — 列表（?keyword=&page=&size=）
  GET    /api/{resource}/all      — 全量数据
  GET    /api/{resource}/{id}     — 详情
  POST   /api/{resource}          — 新增
  PUT    /api/{resource}/{id}     — 修改
  DELETE /api/{resource}/{id}     — 删除

分页响应:
  { "list": [...], "total": 100, "page": 1, "size": 10 }
```

---

## 🗄️ 数据库设计概览

```
students                       teachers
├── id (VARCHAR PK = 学号)     ├── id (VARCHAR PK = 工号)
├── name                       ├── name
├── gender                     ├── gender
├── college                    ├── college
├── major                      ├── title (职称)
├── status (在读/休学/退学/毕业) ├── phone
└── ...                        └── ...

courses                        classrooms
├── id (VARCHAR PK = 编号)     ├── id (VARCHAR PK)
├── name                       ├── name
├── teacher_id (FK)            ├── building
├── credit                     ├── capacity
└── ...                        └── ...

scores                         notices
├── id (LONG PK 自增)          ├── id (VARCHAR PK)
├── student_id (FK)            ├── title
├── course_id (FK)             ├── content
├── score                      ├── type (重要/通知/预警)
├── semester                   └── ...
└── ...

dorm_rooms                     books
├── id (VARCHAR PK)            ├── id (VARCHAR PK)
├── building                   ├── title
├── capacity                   ├── author
├── gender                     ├── isbn
└── ...                        ├── total / available
                               └── ...

dorm_allocations               borrow_records
├── id (LONG PK)               ├── id (LONG PK)
├── room_id (FK)               ├── book_id (FK)
├── student_id (FK)            ├── student_id
├── check_in                   ├── borrow_date
└── status                     ├── due_date
                                └── status

op_logs                        sys_user (已有)
├── id (LONG PK 自增)          ├── id (LONG PK 自增)
├── type (新增/编辑/删除/...)   ├── username
├── target (学生/教师)          ├── password
├── detail                     ├── role
└── ...                        └── ...
```

---

## ⚡ 启动指南

### 后端启动
```powershell
# 1. 确保 MySQL 已运行，创建数据库
mysql -u root -p -e "CREATE DATABASE IF NOT EXISTS campus_ai DEFAULT CHARACTER SET utf8mb4;"

# 2. 创建用户（如需）
mysql -u root -p -e "
  CREATE USER IF NOT EXISTS 'campus_user'@'localhost' IDENTIFIED BY 'Campus@2024';
  GRANT ALL PRIVILEGES ON campus_ai.* TO 'campus_user'@'localhost';
  FLUSH PRIVILEGES;"

# 3. 启动后端
cd Campus-AI-smart-system
mvn spring-boot:run
# → 启动在 http://localhost:8080
# → 自动创建表 + 初始化示例数据
```

### 前端访问
```powershell
# 直接用浏览器打开（无需构建）
start smart-campus-web/index.html
# 或使用 Live Server / Nginx 托管
```

### 验证后端
```
GET http://localhost:8080/api/health
→ { "status": "UP", "database": "CONNECTED", ... }

GET http://localhost:8080/api/students
→ { "code": 200, "data": { "list": [...], "total": 10 } }
```

---

## 📈 进度追踪

| Phase | 模块 | 状态 | 预计工时 |
|---|---|---|---|
| **Phase 0** | 项目基础设施 | ✅ **完成** | 1 天 |
| **Phase 1** | 用户信息（学生/教师/日志） | ✅ **完成** | 2 天 |
| **Phase 2** | 课程服务（课程/教室/实验室/课表） | ⏳ 待开发 | 1.5 天 |
| **Phase 3** | 成绩服务（录入/查询/统计/预警） | ⏳ 待开发 | 1 天 |
| **Phase 4** | 公告服务（发布/推送/预警） | ⏳ 待开发 | 0.5 天 |
| **Phase 5** | 宿舍服务（房间/分配） | ⏳ 待开发 | 0.5 天 |
| **Phase 6** | 图书馆服务（书籍/借阅） | ⏳ 待开发 | 1 天 |
| **Phase 7** | 认证 + 部署 | 🎯 规划中 | 1 天 |

---

> 📅 最后更新：2026-07-07
> 由 Reasonix 生成和维护
