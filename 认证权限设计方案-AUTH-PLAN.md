# 🔐 认证与权限系统 — 设计方案

> 分析日期：2026-07-07
> 目标：设计登录、角色权限、菜单鉴权方案，评估对现有文件的干扰

---

## 一、现有基础评估

### ✅ 已有的有利条件

| 现有资源 | 状态 | 说明 |
|---|---|---|
| `User.java` → `sys_user` 表 | ✅ 已存在 | 含 `username` / `password` / `role`(admin/teacher/student) / `status` 字段 |
| `UserRepository.java` | ✅ 已存在 | 已有 `findByUsername()` / `existsByUsername()` 方法 |
| `Student.java` → `student` 表 | ✅ 已有 | 学号 String PK |
| `Teacher.java` → `teacher` 表 | ✅ 已有 | 工号 String PK |
| 前端 `api-client.js` | ✅ 已有 | 可扩展添加 Authorization header |
| 前端 `app.js` 菜单配置 | ✅ 已有 | 20 个菜单项集中定义，可扩展角色属性 |

### ❌ 需要新建或修改的

| 缺失项 | 说明 |
|---|---|
| JWT 依赖 | `pom.xml` 需添加 `jjwt` + `spring-security-crypto` |
| 密码加密 | 需 BCrypt，不能用明文 |
| 登录 API | `POST /api/auth/login` 返回 token |
| JWT 拦截器 | 校验 token，注入当前用户 |
| 账号-档案关联 | `sys_user.username` ↔ `Student.id` / `Teacher.id` 的关系 |
| 账号自动创建 | 新增学生/教师时，自动创建对应登录账号 |
| 前端登录页 | 登录表单 + token 存储 |
| 前端权限控制 | 菜单按角色显示/隐藏 |
| 前端 API 鉴权头 | `api-client.js` 自动附加 token |

---

## 二、角色-权限矩阵

### 2.1 三种角色

| 角色 | 标识 | 说明 |
|---|---|---|
| 🛡️ **管理员** | `admin` | 系统管理员，拥有全部权限 |
| 👨‍🏫 **教师** | `teacher` | 课程与成绩相关操作 |
| 👨‍🎓 **学生** | `student` | 仅查看个人信息与成绩 |

### 2.2 菜单访问权限

| 模块 | 菜单项 | admin | teacher | student |
|---|---|---|---|---|
| **首页** | 仪表板 | ✅ | ✅ | ✅ |
| **用户信息** | 学生信息 | ✅ | ❌ | ❌ |
| | 学生批量录入 | ✅ | ❌ | ❌ |
| | 教师信息 | ✅ | ❌ | ❌ |
| | 教师批量录入 | ✅ | ❌ | ❌ |
| | 操作日志 | ✅ | ❌ | ❌ |
| **课程服务** | 课程管理 | ✅ | ✅ | ❌ |
| | 教室管理 | ✅ | ✅ | ❌ |
| | 实验室管理 | ✅ | ✅ | ❌ |
| | 教学任务 | ✅ | ✅ | ❌ |
| | 课表查看 | ✅ | ✅ | ✅ |
| **成绩服务** | 成绩录入 | ✅ | ✅ | ❌ |
| | 成绩查询 | ✅ | ✅ | ✅ |
| | 成绩统计 | ✅ | ✅ | ✅ |
| | 成绩预警 | ✅ | ✅ | ✅ |
| **公告服务** | 公告列表 | ✅ | ✅ | ✅ |
| | 发布公告 | ✅ | ✅ | ❌ |
| | 预警消息 | ✅ | ✅ | ✅ |
| **宿舍服务** | 宿舍管理 | ✅ | ❌ | ❌ |
| **图书馆服务** | 书籍管理 | ✅ | ✅ | ✅ |
| | 借阅管理 | ✅ | ✅ | ✅ |

### 2.3 账号-档案关联机制

```
登录表 (sys_user)             档案表
┌─────────────────┐          ┌──────────────────┐
│ username = "T001"├─────────→│ Teacher.id = T001│  (教师)
│ role    = teacher│          └──────────────────┘
├─────────────────┤          ┌──────────────────┐
│ username = "2025001"├──────→│ Student.id = 2025001│ (学生)
│ role    = student │          └──────────────────┘
├─────────────────┤
│ username = "admin"│         无关联 (独立管理员)
│ role    = admin  │
└─────────────────┘
```

**规则：**
- `role = admin` → 无关联档案，独立账号
- `role = teacher` → `username` 等于 `Teacher.id`
- `role = student` → `username` 等于 `Student.id`
- **新增学生/教师时，自动创建对应 `sys_user` 账号**（初始密码可设为身份证后六位或学号）

---

## 三、所需新增文件清单

### 3.1 后端新增

| # | 文件 | 说明 |
|---|---|---|
| 1 | `common/JwtUtils.java` | JWT 签发 + 解析 + 过期校验 |
| 2 | `config/AuthInterceptor.java` | HandlerInterceptor：从请求头提取 token → 校验 → 注入用户信息 |
| 3 | `config/WebMvcConfig.java` | 注册拦截器，排除 `/api/auth/**` 和 `/api/health` |
| 4 | `dto/LoginRequest.java` | 登录请求体 `{username, password}` |
| 5 | `dto/LoginResponse.java` | 登录响应 `{token, userInfo}` |
| 6 | `dto/UserInfo.java` | 当前用户信息 `{id, username, realName, role, profile}` |
| 7 | `controller/AuthController.java` | `POST /api/auth/login` + `GET /api/auth/me` |
| 8 | `service/AuthService.java` | 登录验证、token 签发、密码加密校验 |

### 3.2 前端新增

| # | 文件 | 说明 |
|---|---|---|
| 9 | `auth.js` | 登录/登出、token 存取、当前用户信息、权限判断工具函数 |
| 10 | 登录页面（内嵌到 `index.html` 或新页面） | 登录表单 |

### 3.3 pom.xml 新增依赖

```xml
<!-- JWT -->
<dependency>
    <groupId>io.jsonwebtoken</groupId>
    <artifactId>jjwt-api</artifactId>
    <version>0.12.6</version>
</dependency>
<dependency>
    <groupId>io.jsonwebtoken</groupId>
    <artifactId>jjwt-impl</artifactId>
    <version>0.12.6</version>
    <scope>runtime</scope>
</dependency>
<dependency>
    <groupId>io.jsonwebtoken</groupId>
    <artifactId>jjwt-jackson</artifactId>
    <version>0.12.6</version>
    <scope>runtime</scope>
</dependency>
<!-- BCrypt（仅使用 crypto，不需要整个 Spring Security） -->
<dependency>
    <groupId>org.springframework.security</groupId>
    <artifactId>spring-security-crypto</artifactId>
</dependency>
```

---

## 四、对现有文件的干扰评估

### 🔴 需要修改（高影响）

| 文件 | 修改内容 | 风险 |
|---|---|---|
| `pom.xml` | 新增 jjwt + spring-security-crypto 依赖 | 低 — 纯新增，不影响现有编译 |
| `smart-campus-web/src/app.js` | ① 菜单项增加 `roles` 属性 ② 模板中 `v-for` 过滤菜单 ③ 顶部栏"管理员"改为动态用户名 ④ 启动时检查登录状态 | ⚠️ 中等 — 需调整菜单渲染逻辑 |
| `smart-campus-web/src/services/api-client.js` | 每个请求自动附加 `Authorization: Bearer <token>` header | ⚠️ 中等 — 需增加 token 读取逻辑 |
| `application.yml` | 新增 JWT 密钥配置（jwt.secret / jwt.expiration） | 低 |

### 🟡 可能需要修改（低影响）

| 文件 | 修改内容 | 风险 |
|---|---|---|
| `config/DataInitializer.java` | 初始化时同步创建 admin/teacher/student 的 `sys_user` 登录账号 | 低 — 纯新增逻辑 |
| `controller/UserController.java` | 新增学生/教师时，自动创建对应的 `sys_user` 账号 | 低 — 扩展现有方法 |
| `service/UserService.java` | 注入 AuthService，在 addStudent/addTeacher 时同步建账号 | 低 — 扩展现有方法 |

### 🟢 无需修改

| 文件 | 原因 |
|---|---|
| `entity/Student.java` | 不涉及权限字段 |
| `entity/Teacher.java` | 同上 |
| `entity/OpLog.java` | 同上 |
| `entity/User.java` | 已有 role 字段，够用 |
| `repository/StudentRepository.java` | 不涉及 |
| `repository/TeacherRepository.java` | 不涉及 |
| `repository/OpLogRepository.java` | 不涉及 |
| `repository/UserRepository.java` | 已有 `findByUsername`，够用 |
| `smart-campus-web/index.html` | 只需新增 auth.js 脚本引用 |
| `smart-campus-web/src/pages/*.js` | 页面本身无需改，菜单不可见即可 |
| `smart-campus-web/src/styles/*.css` | 不涉及 |
| `common/ApiResult.java` | 不受影响 |
| `common/GlobalExceptionHandler.java` | 不受影响 |
| `config/CorsConfig.java` | 不受影响 |

---

## 五、API 设计

### 5.1 新增接口

```
POST   /api/auth/login        — 登录（返回 JWT token + 用户信息）
GET    /api/auth/me           — 获取当前用户信息（需 token）
POST   /api/auth/logout        — 登出（前端清除 token，可选）
```

### 5.2 请求/响应示例

**登录请求：**
```json
POST /api/auth/login
{ "username": "admin", "password": "Admin@2024" }
```

**登录响应：**
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "userInfo": {
      "id": 1,
      "username": "admin",
      "realName": "系统管理员",
      "role": "admin"
    }
  }
}
```

**鉴权请求头：**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
```

### 5.3 公开接口（无需 token）

```
GET  /api/health
POST /api/auth/login
```

---

## 六、开发计划

| 步骤 | 任务 | 文件数 | 预计工时 |
|---|---|---|---|
| **Step 1** | `pom.xml` 新增 JWT + BCrypt 依赖 | 1 | 5min |
| **Step 2** | `application.yml` 新增 JWT 配置 | 1 | 5min |
| **Step 3** | 后端: `JwtUtils.java` + `AuthInterceptor.java` + `WebMvcConfig.java` | 3 | 1h |
| **Step 4** | 后端: `AuthService.java` + `AuthController.java` + DTO 类 | 4 | 1h |
| **Step 5** | 修改 `DataInitializer.java` — 创建管理员默认账号 | 1 | 15min |
| **Step 6** | 修改 `UserService.java` / `UserController.java` — 新增学生/教师时自动建账号 | 2 | 30min |
| **Step 7** | 前端: `auth.js` — token 管理 + 用户状态 + 权限判断 | 1 | 30min |
| **Step 8** | 前端: 修改 `api-client.js` — 自动附加 token header | 1 | 15min |
| **Step 9** | 前端: 修改 `app.js` — 登录页切换 + 菜单按角色过滤 + 顶部栏动态用户名 | 1 | 1h |
| **Step 10** | 编译测试 + 端到端验证 | — | 30min |

**总计：约 4.5 小时，15+ 个文件涉及（10 个新增，5 个修改）**

---

## 七、遗漏点检查

### 已考虑的方面

| 方面 | 状态 |
|---|---|
| 菜单权限过滤 | ✅ 设计完成 |
| API 接口鉴权 | ✅ 拦截器方案 |
| 密码加密存储 | ✅ BCrypt |
| 账号-档案关联 | ✅ username 匹配机制 |
| 自动创建账号 | ✅ 新增学生/教师时同步 |
| 前端 token 持久化 | ✅ localStorage |
| 401 未授权处理 | ✅ api-client.js 已可扩展 |
| 管理员默认账号 | ✅ DataInitializer 创建 |

### 可能遗漏的点 🔍

| # | 潜在遗漏 | 分析 |
|---|---|---|
| 1 | **登录页面 UI 设计** | 目前前端是单页应用，登录页应独立于主界面。可以用两种方式：① 在 `index.html` 中内嵌登录表单（启动时显示，登录后隐藏）② 独立 login.html 页面。推荐方式① — 简单、无需额外路由 |
| 2 | **token 过期刷新** | JWT 过期后用户需要重新登录。对于校园管理系统，token 有效期设 24 小时较合理。暂不实现 refresh token 机制（增加复杂度），到期重登即可 |
| 3 | **操作日志记录操作人** | 当前 `UserService.addOpLog()` 写死 "管理员"。鉴权后应改为从当前登录用户获取 `realName`。这是一个需要修改的点 |
| 4 | **前端 localStorage 离线回退与鉴权的冲突** | 如果后端不可达（离线模式），前端无法登录。解决方案：离线模式下自动以"管理员"身份进入（保留现有本地操作能力） |
| 5 | **退出登录** | 需要登出按钮，清除 token 回到登录页。在顶部栏用户区域添加下拉菜单（个人信息 / 退出登录） |
| 6 | **首次启动的默认管理员密码** | DataInitializer 需创建默认管理员账号：`admin` / `Admin@2024` |
| 7 | **学生/教师初始密码策略** | 新增学生/教师时，初始密码可以用学号/工号。首次登录应提示修改密码（可选功能，可延后） |

---

## 八、总结

此认证方案**对现有项目文件的干扰可控**：
- **10 个文件新增**（不影响现有功能）
- **5 个文件修改**（`pom.xml` / `app.js` / `api-client.js` / `application.yml` / `DataInitializer.java`）
- **0 个文件删除**
- **已完成的 Phase 1 功能**（Student/Teacher/OpLog 实体、页面、API）**完全不受影响**

建议在 Phase 2-6（业务模块）**之前或之后**完成认证系统。两种选择：

| 方案 | 顺序 | 优缺点 |
|---|---|---|
| **A** 🔥 先做认证 | Phase 7 → Phase 2-6 | ✅ 后续所有 API 自带鉴权；❌ 业务模块开发时需先登录 |
| **B** 后做认证 | Phase 2-6 → Phase 7 | ✅ 业务功能优先可用；❌ 后续需逐个接口加权限注解，返工较多 |

**推荐方案 A**：先完成认证，再开发后续业务模块。这样 Phase 2-6 的 API 可以从一开始就带上权限控制，避免后期大规模返工。
