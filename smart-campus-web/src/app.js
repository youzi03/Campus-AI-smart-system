/* ============================================================
 * 主应用 app.js - Vue 3 单页应用（Element Plus）
 * 模块化页面组件 + 侧边栏菜单 + 角色权限控制
 * ============================================================ */

const { createApp, ref, reactive, computed, onMounted } = Vue;

/* ========== 应用配置（含角色权限） ========== */
const AppConfig = {
  title: '校园信息管理系统',
  version: '1.0.0',
  author: 'SmartCampus',
  menuGroups: [
    {
      title: '用户信息',
      icon: '\u{1F465}',
      roles: ['admin'],
      items: [
        { key: 'student-list', title: '学生信息', icon: '\u{1F393}', roles: ['admin'] },
        { key: 'student-batch', title: '学生批量录入', icon: '\u{1F4E5}', roles: ['admin'] },
        { key: 'teacher-list', title: '教师信息', icon: '\u{1F9D1}\u200D\u{1F3EB}', roles: ['admin'] },
        { key: 'teacher-batch', title: '教师批量录入', icon: '\u{1F4E5}', roles: ['admin'] },
        { key: 'op-log', title: '操作日志', icon: '\u{1F4CB}', roles: ['admin'] }
      ]
    },
    {
      title: '课程服务',
      icon: '\u{1F4DA}',
      roles: ['admin', 'teacher', 'student'],
      items: [
        { key: 'course', title: '课程管理', icon: '\u{1F4D6}', roles: ['admin', 'teacher'] },
        { key: 'classroom', title: '教室管理', icon: '\u{1F3EB}', roles: ['admin', 'teacher'] },
        { key: 'lab', title: '实验室管理', icon: '\u{1F52C}', roles: ['admin', 'teacher'] },
        { key: 'teaching-task', title: '教学任务', icon: '\u{1F4CB}', roles: ['admin', 'teacher'] },
        { key: 'schedule', title: '课表查看', icon: '\u{1F5D3}', roles: ['admin', 'teacher', 'student'] }
      ]
    },
    {
      title: '成绩服务',
      icon: '\u{1F4CA}',
      roles: ['admin', 'teacher', 'student'],
      items: [
        { key: 'score-input', title: '成绩录入', icon: '\u270F', roles: ['admin', 'teacher'] },
        { key: 'score-query', title: '成绩查询', icon: '\u{1F50D}', roles: ['admin', 'teacher', 'student'] },
        { key: 'score-stat', title: '成绩统计', icon: '\u{1F4C8}', roles: ['admin', 'teacher', 'student'] },
        { key: 'score-warning', title: '成绩预警', icon: '\u26A0', roles: ['admin', 'teacher', 'student'] }
      ]
    },
    {
      title: '公告服务',
      icon: '\u{1F4E2}',
      roles: ['admin', 'teacher', 'student'],
      items: [
        { key: 'notice-list', title: '公告列表', icon: '\u{1F4DD}', roles: ['admin', 'teacher', 'student'] },
        { key: 'notice-publish', title: '发布公告', icon: '\u{1F4E3}', roles: ['admin', 'teacher'] },
        { key: 'notice-warning', title: '预警消息', icon: '\u{1F514}', roles: ['admin', 'teacher', 'student'] }
      ]
    },
    {
      title: '宿舍服务',
      icon: '\u{1F3E0}',
      roles: ['admin'],
      items: [
        { key: 'dorm', title: '宿舍管理', icon: '\u{1F9CF}', roles: ['admin'] }
      ]
    },
    {
      title: '图书馆服务',
      icon: '\u{1F4DA}',
      roles: ['admin', 'teacher', 'student'],
      items: [
        { key: 'library-book', title: '书籍管理', icon: '\u{1F4DA}', roles: ['admin', 'teacher', 'student'] },
        { key: 'library-borrow', title: '借阅管理', icon: '\u{1F4D6}', roles: ['admin', 'teacher', 'student'] }
      ]
    },
    {
      title: 'AI 智能分析',
      icon: '\u{1F916}',
      roles: ['admin', 'teacher', 'student'],
      items: [
        { key: 'ai-dashboard', title: 'AI 数据分析', icon: '\u{1F4CA}', roles: ['admin', 'teacher', 'student'] }
      ]
    }
  ]
};

/* ========== 主应用组件 ========== */
const App = {
  setup() {
    const currentPage = ref('home');
    const currentTitle = ref('首页');
    const now = ref(Common.today());

    // 当前登录用户
    const currentUser = Auth.getUser();
    const userName = ref(currentUser ? (currentUser.realName || (currentUser.profile && currentUser.profile.name) || currentUser.username) : '管理员');
    const userRole = ref(currentUser ? currentUser.role : 'admin');

    // ========== 菜单权限过滤 ==========
    const visibleMenuGroups = computed(() => {
      const role = userRole.value;
      return AppConfig.menuGroups
        .filter(g => !g.roles || g.roles.includes(role))
        .map(g => ({
          ...g,
          items: g.items.filter(item => !item.roles || item.roles.includes(role))
        }))
        .filter(g => g.items.length > 0);
    });

    // ========== 统计数据 ==========
    const stats = reactive({
      studentCount: 0, teacherCount: 0, courseCount: 0,
      scoreCount: 0, noticeCount: 0, roomCount: 0
    });

    const recentNotices = ref([]);
    const recentLogs = ref([]);

    async function loadStats() {
      if (UserService) {
        try { stats.studentCount = await UserService.studentCount(); } catch {}
        try { stats.teacherCount = await UserService.teacherCount(); } catch {}
      }
      if (window.CourseService && window.CourseService.courseCount) {
        try { stats.courseCount = await window.CourseService.courseCount(); } catch {}
      }
      if (window.ScoreService && window.ScoreService.scoreCount) {
        try { stats.scoreCount = await window.ScoreService.scoreCount(); } catch {}
      }
      if (window.NoticeService && window.NoticeService.noticeCount) {
        try { stats.noticeCount = await window.NoticeService.noticeCount(); } catch {}
      }
      if (window.DormService && window.DormService.roomCount) {
        try { stats.roomCount = await window.DormService.roomCount(); } catch {}
      }
    }

    async function loadRecentData() {
      if (window.NoticeService && window.NoticeService.getNotices) {
        try {
          const notices = await window.NoticeService.getNotices();
          recentNotices.value = (notices || []).slice(0, 5);
        } catch {}
      }
      if (UserService && UserService.getOpLogs) {
        try {
          const logs = await UserService.getOpLogs();
          recentLogs.value = (logs || []).slice(0, 6);
        } catch {}
      }
    }

    onMounted(() => {
      loadStats();
      loadRecentData();
    });

    // ========== 路由 ==========
    const switchMenu = (key) => {
      currentPage.value = key;
      for (const g of AppConfig.menuGroups) {
        const it = g.items.find(i => i.key === key);
        if (it) { currentTitle.value = it.title; break; }
      }
      ElementPlus.ElMessage && ElementPlus.ElMessage.closeAll && ElementPlus.ElMessage.closeAll();
      window.scrollTo && window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    // ========== 登出 ==========
    const handleLogout = () => {
      ElementPlus.ElMessageBox.confirm('确定要退出登录吗？', '退出确认', { type: 'info', confirmButtonText: '退出', cancelButtonText: '取消' })
        .then(() => { Auth.logout(); })
        .catch(() => {});
    };

    window.$app = { switchMenu };

    return {
      currentPage, currentTitle, now, switchMenu,
      AppConfig, visibleMenuGroups, stats, recentNotices, recentLogs,
      userName, userRole, handleLogout
    };
  },
  components: {},
  template: `
    <div class="app-layout">
      <aside class="sidebar">
        <div class="sidebar-header">
          <div style="font-size:26px">🎓</div>
          <div style="font-size:16px;font-weight:700;color:#1e293b;letter-spacing:-0.3px">智慧校园管理系统</div>
          <div style="font-size:12px;color:#94a3b8;margin-top:2px">Smart Campus v2.0</div>
        </div>

        <div style="padding:8px 12px 4px">
          <div
            @click="switchMenu('home')"
            :style="'display:flex;align-items:center;gap:10px;padding:10px 14px;border-radius:8px;cursor:pointer;font-size:14px;font-weight:500;transition:all 0.2s;' + (currentPage==='home'?'background:linear-gradient(135deg,#4f6ef7,#6c5ce7);color:#fff;box-shadow:0 2px 8px rgba(79,110,247,0.4);':'background:var(--color-primary-light);color:var(--color-primary);')"
          >
            <span style="font-size:16px">&#127968;</span>
            <span>&#39318;&#39029;</span>
          </div>
        </div>
        <el-divider style="margin:6px 12px;border-color:var(--color-border)" />

        <!-- 按角色过滤的菜单 -->
        <el-menu
          :default-active="currentPage"
          @select="switchMenu"
          background-color="#ffffff"
          text-color="#475569"
          active-text-color="#4f6ef7"
          style="border-right:none;background:transparent;flex:1"
          class="sidebar-menu"
        >
          <el-sub-menu v-for="(group, gi) in visibleMenuGroups" :key="gi" :index="'g-' + gi">
            <template #title><span style="font-size:15px">{{ group.icon }} {{ group.title }}</span></template>
            <el-menu-item v-for="item in group.items" :key="item.key" :index="item.key">
              <span>{{ item.icon }} {{ item.title }}</span>
            </el-menu-item>
          </el-sub-menu>
        </el-menu>
      </aside>

      <main class="main-area">
        <header class="top-bar">
          <div style="display:flex;align-items:center;gap:12px">
            <div style="font-size:16px;color:#1e293b;font-weight:600">{{ currentTitle }}</div>
            <el-tag size="small" type="info">{{ now }}</el-tag>
          </div>
          <div style="display:flex;align-items:center;gap:14px">
            <el-tooltip content="&#28857;&#20987;&#21047;&#26032;&#24403;&#21069;&#39029;&#38754;" placement="bottom">
              <el-icon :size="20" @click="switchMenu(currentPage)" style="cursor:pointer;color:#94a3b8">&#128260;</el-icon>
            </el-tooltip>
            <!-- 用户信息 + 登出 -->
            <el-dropdown trigger="click" @command="handleLogout">
              <div style="display:flex;align-items:center;gap:8px;padding:4px 12px;background:#eef1ff;border-radius:20px;cursor:pointer">
                <div style="font-size:20px">&#128100;</div>
                <div style="font-size:14px;color:#1e293b;font-weight:500">{{ userName }}</div>
                <el-tag size="small" :type="userRole==='admin'?'danger':userRole==='teacher'?'warning':'success'" effect="plain" style="margin-left:2px">{{ {admin:'管理员',teacher:'教师',student:'学生'}[userRole] || userRole }}</el-tag>
              </div>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item command="logout" style="color:#f56c6c">&#128682; 退出登录</el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </div>
        </header>

        <section class="content-area">
          <div v-if="currentPage==='home'" class="page-wrapper">

            <div class="home-welcome">
              <div class="welcome-text">
                <div class="welcome-title">&#127891; &#27426;&#36814;&#20351;&#29992;&#26234;&#25000;&#26657;&#22253;&#20449;&#24687;&#31649;&#29702;&#31995;&#32479;</div>
                <div class="welcome-sub">&#25972;&#21512;&#23398;&#29983;&#31649;&#29702;&#12289;&#35838;&#31243;&#25490;&#35838;&#12289;&#25104;&#32489;&#32479;&#35745;&#12289;&#20844;&#21578;&#21457;&#24067;&#12289;&#23487;&#20250;&#20998;&#37197;&#12289;&#22270;&#20070;&#20511;&#38405;&#31561;&#26680;&#24515;&#27169;&#22359;&#65292;&#21161;&#21147;&#26657;&#22253;&#25968;&#23383;&#21270;&#31649;&#29702;</div>
                <div class="welcome-time">{{ now }} &nbsp;&middot;&nbsp; &#27426;&#36814;&#24744;&#65292;{{ userName }}</div>
              </div>
              <div class="welcome-deco">&#127891;</div>
            </div>

            <div class="home-section-title">&#9889; &#24555;&#25463;&#20837;&#21475;</div>
            <el-row :gutter="14" style="margin-bottom:20px">
              <el-col :span="4" v-for="(item, idx) in [
                {key:'student-list', title:'学生信息', icon:'🎓', color:'#eef1ff', textColor:'#4f6ef7', roles:['admin']},
                {key:'score-input', title:'成绩录入', icon:'✏', color:'#ecfdf5', textColor:'#16a34a', roles:['admin','teacher']},
                {key:'notice-publish', title:'发布公告', icon:'📣', color:'#fef2f2', textColor:'#ef4444', roles:['admin','teacher']},
                {key:'schedule', title:'查看课表', icon:'📅', color:'#f5f3ff', textColor:'#7c3aed', roles:['admin','teacher','student']},
                {key:'dorm', title:'宿舍管理', icon:'🏠', color:'#ecfeff', textColor:'#0891b2', roles:['admin']},
                {key:'library-book', title:'图书管理', icon:'📚', color:'#fff7ed', textColor:'#c2410c', roles:['admin','teacher','student']}
              ].filter(x => !x.roles || x.roles.includes(userRole))" :key="idx">
                <div
                  @click="switchMenu(item.key)"
                  :style="'padding:18px 12px;border-radius:10px;text-align:center;cursor:pointer;transition:all 0.2s;background:' + item.color + ';border:1px solid transparent'"
                  class="quick-card"
                >
                  <div style="font-size:26px;margin-bottom:8px">{{ item.icon }}</div>
                  <div :style="'font-size:13px;font-weight:600;color:' + item.textColor">{{ item.title }}</div>
                </div>
              </el-col>
            </el-row>

            <div class="home-section-title">&#128202; &#25968;&#25454;&#32479;&#35745;</div>
            <el-row :gutter="14" style="margin-bottom:20px">
              <el-col :span="4">
                <div class="stat-card-home" style="background:linear-gradient(135deg,#eef1ff,#e2e5ff)">
                  <div style="font-size:26px;margin-bottom:8px">🎓</div>
                  <div style="font-size:26px;font-weight:800;color:#4f6ef7">{{ stats.studentCount }}</div>
                  <div style="font-size:13px;color:#64748b;margin-top:4px">学生总数</div>
                </div>
              </el-col>
              <el-col :span="4">
                <div class="stat-card-home" style="background:linear-gradient(135deg,#ecfdf5,#d1fae5)">
                  <div style="font-size:26px;margin-bottom:8px">👨‍🏫</div>
                  <div style="font-size:26px;font-weight:800;color:#16a34a">{{ stats.teacherCount }}</div>
                  <div style="font-size:13px;color:#64748b;margin-top:4px">教职工数</div>
                </div>
              </el-col>
              <el-col :span="4">
                <div class="stat-card-home" style="background:linear-gradient(135deg,#fff7ed,#ffedd5)">
                  <div style="font-size:26px;margin-bottom:8px">📖</div>
                  <div style="font-size:26px;font-weight:800;color:#c2410c">{{ stats.courseCount }}</div>
                  <div style="font-size:13px;color:#64748b;margin-top:4px">开设课程</div>
                </div>
              </el-col>
              <el-col :span="4">
                <div class="stat-card-home" style="background:linear-gradient(135deg,#f5f3ff,#ede9fe)">
                  <div style="font-size:26px;margin-bottom:8px">📋</div>
                  <div style="font-size:26px;font-weight:800;color:#7c3aed">{{ stats.scoreCount }}</div>
                  <div style="font-size:13px;color:#64748b;margin-top:4px">成绩记录</div>
                </div>
              </el-col>
              <el-col :span="4">
                <div class="stat-card-home" style="background:linear-gradient(135deg,#fef2f2,#fecaca)">
                  <div style="font-size:26px;margin-bottom:8px">🔔</div>
                  <div style="font-size:26px;font-weight:800;color:#ef4444">{{ stats.noticeCount }}</div>
                  <div style="font-size:13px;color:#64748b;margin-top:4px">发布公告</div>
                </div>
              </el-col>
              <el-col :span="4">
                <div class="stat-card-home" style="background:linear-gradient(135deg,#ecfeff,#cffafe)">
                  <div style="font-size:26px;margin-bottom:8px">🏠</div>
                  <div style="font-size:26px;font-weight:800;color:#0891b2">{{ stats.roomCount }}</div>
                  <div style="font-size:13px;color:#64748b;margin-top:4px">宿舍数量</div>
                </div>
              </el-col>
            </el-row>

            <el-row :gutter="14">
              <el-col :span="14">
                <div class="panel">
                  <div class="panel-section-title">&#128226; &#26368;&#26032;&#20844;&#21578;</div>
                  <div v-if="recentNotices.length === 0" style="color:#c0c4cc;text-align:center;padding:20px 0;font-size:13px">&#26242;&#26080;&#20844;&#21578;</div>
                  <div v-else>
                    <div v-for="(n, i) in recentNotices" :key="i"
                      style="display:flex;align-items:center;gap:12px;padding:10px 0;border-bottom:1px solid #f0f0f0;cursor:pointer"
                      :style="i === recentNotices.length - 1 ? 'border-bottom:none' : ''"
                      @click="switchMenu('notice-list')">
                      <div style="width:8px;height:8px;border-radius:50%;background:#4f6ef7;flex-shrink:0"></div>
                      <div style="flex:1;min-width:0">
                        <div style="font-size:13px;color:#303133;font-weight:500;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">{{ n.title }}</div>
                        <div style="font-size:12px;color:#909399;margin-top:2px">{{ n.time || n.createAt }}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </el-col>
              <el-col :span="10">
                <div class="panel">
                  <div class="panel-section-title">&#128203; &#26368;&#36817;&#25805;&#20316;</div>
                  <div v-if="recentLogs.length === 0" style="color:#c0c4cc;text-align:center;padding:20px 0;font-size:13px">&#26242;&#26080;&#25805;&#20316;&#35760;&#24405;</div>
                  <div v-else>
                    <div v-for="(log, i) in recentLogs" :key="i"
                      style="display:flex;align-items:flex-start;gap:10px;padding:8px 0;border-bottom:1px solid #f0f0f0"
                      :style="i === recentLogs.length - 1 ? 'border-bottom:none' : ''">
                      <div style="width:6px;height:6px;border-radius:50%;background:#4f6ef7;flex-shrink:0;margin-top:6px"></div>
                      <div style="flex:1;min-width:0">
                        <div style="font-size:13px;color:#303133">{{ log.detail }}</div>
                        <div style="font-size:12px;color:#909399;margin-top:2px">{{ log.time }}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </el-col>
            </el-row>

          </div>

          <page-user-student v-else-if="currentPage==='student-list'"></page-user-student>
          <page-user-student-batch v-else-if="currentPage==='student-batch'"></page-user-student-batch>
          <page-user-teacher v-else-if="currentPage==='teacher-list'"></page-user-teacher>
          <page-user-teacher-batch v-else-if="currentPage==='teacher-batch'"></page-user-teacher-batch>
          <page-op-log v-else-if="currentPage==='op-log'"></page-op-log>
          <page-course v-else-if="currentPage==='course'"></page-course>
          <page-classroom v-else-if="currentPage==='classroom'"></page-classroom>
          <page-lab v-else-if="currentPage==='lab'"></page-lab>
          <page-teaching-task v-else-if="currentPage==='teaching-task'"></page-teaching-task>
          <page-schedule v-else-if="currentPage==='schedule'"></page-schedule>
          <page-score-input v-else-if="currentPage==='score-input'"></page-score-input>
          <page-score-query v-else-if="currentPage==='score-query'"></page-score-query>
          <page-score-stat v-else-if="currentPage==='score-stat'"></page-score-stat>
          <page-score-warning v-else-if="currentPage==='score-warning'"></page-score-warning>
          <page-notice-list v-else-if="currentPage==='notice-list'"></page-notice-list>
          <page-notice-publish v-else-if="currentPage==='notice-publish'"></page-notice-publish>
          <page-notice-warning v-else-if="currentPage==='notice-warning'"></page-notice-warning>
          <page-dorm v-else-if="currentPage==='dorm'"></page-dorm>
          <page-library-book v-else-if="currentPage==='library-book'"></page-library-book>
          <page-library-borrow v-else-if="currentPage==='library-borrow'"></page-library-borrow>
          <page-ai-dashboard v-else-if="currentPage==='ai-dashboard'"></page-ai-dashboard>
        </section>
      </main>
    </div>
  `
};

/* ========== 启动 Vue 应用 ========== */
/* 不使用自动挂载，由登录脚本在登录成功后调用 window.initApp() */
window.initApp = function () {
  var app = createApp(App);
  app.config.errorHandler = function (err) { console.error('[Vue Error]', err); };
  app.use(ElementPlus);
  app.component('page-user-student', UserPages.PageUserStudent);
  app.component('page-user-student-batch', UserPages.PageUserStudentBatch);
  app.component('page-user-teacher', UserPages.PageUserTeacher);
  app.component('page-user-teacher-batch', UserPages.PageUserTeacherBatch);
  app.component('page-op-log', UserPages.PageOpLog);
  app.component('page-course', CoursePages.PageCourseCourse);
  app.component('page-classroom', CoursePages.PageCourseRoom);
  app.component('page-lab', CoursePages.PageCourseLab);
  app.component('page-teaching-task', CoursePages.PageCourseTask);
  app.component('page-schedule', CoursePages.PageCourseSchedule);
  app.component('page-score-input', ScorePages.PageScoreInput);
  app.component('page-score-query', ScorePages.PageScoreQuery);
  app.component('page-score-stat', ScorePages.PageScoreStat);
  app.component('page-score-warning', ScorePages.PageScoreWarn);
  app.component('page-notice-list', NoticePages.PageNoticeList);
  app.component('page-notice-publish', NoticePages.PageNoticePublish);
  app.component('page-notice-warning', NoticePages.PageNoticeWarning);
  app.component('page-dorm', DormPages.PageDorm);
  app.component('page-library-book', LibraryPages.PageLibraryBook);
  app.component('page-library-borrow', LibraryPages.PageLibraryBorrow);
  app.component('page-ai-dashboard', AIPages.PageAIDashboard);
  app.mount('#app');
};
