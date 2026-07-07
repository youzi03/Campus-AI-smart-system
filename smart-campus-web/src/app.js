/* ============================================================
 * 主应用 app.js - Vue 3 单页应用（Element Plus）
 * 模块化页面组件 + 侧边栏菜单
 * ============================================================ */

const { createApp, ref, reactive, computed, onMounted, onBeforeUnmount } = Vue;

/* ========== 应用配置 ========== */
const AppConfig = {
  title: '校园信息管理系统',
  version: '1.0.0',
  author: 'SmartCampus',
  menuGroups: [
    {
      title: '用户信息',
      icon: '\u{1F465}',
      items: [
        { key: 'student-list', title: '学生信息', icon: '\u{1F393}' },
        { key: 'student-batch', title: '学生批量录入', icon: '\u{1F4E5}' },
        { key: 'teacher-list', title: '教师信息', icon: '\u{1F9D1}\u200D\u{1F3EB}' },
        { key: 'teacher-batch', title: '教师批量录入', icon: '\u{1F4E5}' },
        { key: 'op-log', title: '操作日志', icon: '\u{1F4CB}' }
      ]
    },
    {
      title: '课程服务',
      icon: '\u{1F4DA}',
      items: [
        { key: 'course', title: '课程管理', icon: '\u{1F4D6}' },
        { key: 'classroom', title: '教室管理', icon: '\u{1F3EB}' },
        { key: 'lab', title: '实验室管理', icon: '\u{1F52C}' },
        { key: 'teaching-task', title: '教学任务', icon: '\u{1F4CB}' },
        { key: 'schedule', title: '课表查看', icon: '\u{1F5D3}' }
      ]
    },
    {
      title: '成绩服务',
      icon: '\u{1F4CA}',
      items: [
        { key: 'score-input', title: '成绩录入', icon: '\u270F' },
        { key: 'score-query', title: '成绩查询', icon: '\u{1F50D}' },
        { key: 'score-stat', title: '成绩统计', icon: '\u{1F4C8}' },
        { key: 'score-warning', title: '成绩预警', icon: '\u26A0' }
      ]
    },
    {
      title: '公告服务',
      icon: '\u{1F4E2}',
      items: [
        { key: 'notice-list', title: '公告列表', icon: '\u{1F4DD}' },
        { key: 'notice-publish', title: '发布公告', icon: '\u{1F4E3}' },
        { key: 'notice-warning', title: '预警消息', icon: '\u{1F514}' }
      ]
    },
    {
      title: '宿舍服务',
      icon: '\u{1F3E0}',
      items: [
        { key: 'dorm', title: '宿舍管理', icon: '\u{1F9CF}' }
      ]
    },
    {
      title: '图书馆服务',
      icon: '\u{1F4DA}',
      items: [
        { key: 'library-book', title: '书籍管理', icon: '\u{1F4DA}' },
        { key: 'library-borrow', title: '借阅管理', icon: '\u{1F4D6}' }
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

    // 统计数据（异步加载）
    const stats = reactive({
      studentCount: 0,
      teacherCount: 0,
      courseCount: 0,
      scoreCount: 0,
      noticeCount: 0,
      roomCount: 0
    });

    const recentNotices = ref([]);
    const recentLogs = ref([]);

    async function loadStats() {
      if (UserService) {
        try { stats.studentCount = await UserService.studentCount(); } catch {}
        try { stats.teacherCount = await UserService.teacherCount(); } catch {}
      }
      if (CourseService && CourseService.courseCount) {
        try { stats.courseCount = await CourseService.courseCount(); } catch {}
      }
      if (ScoreService && ScoreService.scoreCount) {
        try { stats.scoreCount = await ScoreService.scoreCount(); } catch {}
      }
      if (NoticeService && NoticeService.noticeCount) {
        try { stats.noticeCount = await NoticeService.noticeCount(); } catch {}
      }
      if (DormService && DormService.roomCount) {
        try { stats.roomCount = await DormService.roomCount(); } catch {}
      }
    }

    async function loadRecentData() {
      if (NoticeService && NoticeService.getNotices) {
        try { 
          const notices = await NoticeService.getNotices();
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

    // 挂载时加载数据
    onMounted(() => {
      loadStats();
      loadRecentData();
    });

    const switchMenu = (key) => {
      currentPage.value = key;
      for (const g of AppConfig.menuGroups) {
        const it = g.items.find(i => i.key === key);
        if (it) { currentTitle.value = it.title; break; }
      }
      ElementPlus.ElMessage && ElementPlus.ElMessage.closeAll && ElementPlus.ElMessage.closeAll();
      window.scrollTo && window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    window.$app = { switchMenu };

    return { currentPage, currentTitle, now, switchMenu, AppConfig, stats, recentNotices, recentLogs };
  },
  components: {},
  template: `
    <div class="app-layout">
      <aside class="sidebar">
        <div class="sidebar-header">
          <div style="font-size:24px">&#127891;</div>
          <div style="font-size:17px;font-weight:700;color:#fff;letter-spacing:1px">&#26684;&#23398;&#22253;&#20449;&#24687;&#31649;&#29702;</div>
          <div style="font-size:12px;color:#a0b8d8;margin-top:2px">Smart Campus v1.0</div>
        </div>

        <div style="padding:8px 12px 4px">
          <div
            @click="switchMenu('home')"
            :style="'display:flex;align-items:center;gap:10px;padding:10px 14px;border-radius:8px;cursor:pointer;font-size:14px;font-weight:500;transition:all 0.2s;' + (currentPage==='home'?'background:linear-gradient(90deg,#3a7bd5,#4a8de0);color:#fff;box-shadow:0 2px 8px rgba(58,123,213,0.4);':'background:rgba(255,255,255,0.08);color:rgba(255,255,255,0.75);')"
          >
            <span style="font-size:16px">&#127968;</span>
            <span>&#39318;&#39029;</span>
          </div>
        </div>
        <el-divider style="margin:6px 12px;border-color:rgba(255,255,255,0.1)" />

        <el-menu
          :default-active="currentPage"
          @select="switchMenu"
          background-color="#1a3a5c"
          text-color="#c9d8e8"
          active-text-color="#ffffff"
          style="border-right:none;background:transparent;flex:1"
          class="sidebar-menu"
        >
          <el-sub-menu v-for="(group, gi) in AppConfig.menuGroups" :key="gi" :index="'g-' + gi">
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
            <div style="font-size:16px;color:#303133;font-weight:600">{{ currentTitle }}</div>
            <el-tag size="small" type="info">{{ now }}</el-tag>
          </div>
          <div style="display:flex;align-items:center;gap:14px">
            <el-tooltip content="&#28857;&#20987;&#21047;&#26032;&#24403;&#21069;&#39029;&#38754;" placement="bottom">
              <el-icon :size="20" @click="switchMenu(currentPage)" style="cursor:pointer;color:#606266">&#128260;</el-icon>
            </el-tooltip>
            <div style="display:flex;align-items:center;gap:8px;padding:4px 12px;background:#f0f7ff;border-radius:20px;">
              <div style="font-size:20px">&#128100;</div>
              <div style="font-size:14px;color:#303133;font-weight:500">&#31649;&#29702;&#21592;</div>
            </div>
          </div>
        </header>

        <section class="content-area">
          <div v-if="currentPage==='home'" class="page-wrapper">

            <div class="home-welcome">
              <div class="welcome-text">
                <div class="welcome-title">&#127891; &#27426;&#36814;&#20351;&#29992;&#26234;&#25000;&#26657;&#22253;&#20449;&#24687;&#31649;&#29702;&#31995;&#32479;</div>
                <div class="welcome-sub">&#25972;&#21512;&#23398;&#29983;&#31649;&#29702;&#12289;&#35838;&#31243;&#25490;&#35838;&#12289;&#25104;&#32489;&#32479;&#35745;&#12289;&#20844;&#21578;&#21457;&#24067;&#12289;&#23487;&#20250;&#20998;&#37197;&#12289;&#22270;&#20070;&#20511;&#38405;&#31561;&#26680;&#24515;&#27169;&#22359;&#65292;&#21161;&#21147;&#26657;&#22253;&#25968;&#23383;&#21270;&#31649;&#29702;</div>
                <div class="welcome-time">{{ now }} &nbsp;&middot;&nbsp; &#22825;&#27668;&#26222;&#26126;&#37011;&#22635;&nbsp;&middot;&nbsp; &#25945;&#23398;&#21608;&#31532; 8 &#21608;</div>
              </div>
              <div class="welcome-deco">&#127891;</div>
            </div>

            <div class="home-section-title">&#9889; &#24555;&#25463;&#20837;&#21475;</div>
            <el-row :gutter="14" style="margin-bottom:20px">
              <el-col :span="4" v-for="(item, idx) in [
                {key:'student-list', title:'&#23398;&#29983;&#20449;&#24687;', icon:'&#127894;', color:'#e8f1fb', textColor:'#2e5fa8'},
                {key:'score-input', title:'&#25104;&#32489;&#24405;&#20837;', icon:'&#9998;', color:'#e6f9f7', textColor:'#2d8f6f'},
                {key:'notice-publish', title:'&#21457;&#24067;&#20844;&#21578;', icon:'&#128227;', color:'#fef0f0', textColor:'#c44a6a'},
                {key:'schedule', title:'&#26597;&#30475;&#35838;&#34920;', icon:'&#128197;', color:'#f5f0ff', textColor:'#6b4a9a'},
                {key:'dorm', title:'&#23487;&#20250;&#31649;&#29702;', icon:'&#128719;', color:'#e8f5f9', textColor:'#2a7a9a'},
                {key:'library-book', title:'&#22270;&#20070;&#31649;&#29702;', icon:'&#128218;', color:'#fef4e6', textColor:'#b07030'}
              ]" :key="idx">
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
                <div class="stat-card-home" style="background:linear-gradient(135deg,#e8f1fb,#dbe9fb)">
                  <div style="font-size:26px;margin-bottom:8px">&#127894;</div>
                  <div style="font-size:26px;font-weight:800;color:#2e5fa8">{{ stats.studentCount }}</div>
                  <div style="font-size:13px;color:#606266;margin-top:4px">&#23398;&#29983;&#24635;&#25968;</div>
                </div>
              </el-col>
              <el-col :span="4">
                <div class="stat-card-home" style="background:linear-gradient(135deg,#e6f9f7,#d9f2e6)">
                  <div style="font-size:26px;margin-bottom:8px">&#128104;&#8205;&#127979;</div>
                  <div style="font-size:26px;font-weight:800;color:#2d8f6f">{{ stats.teacherCount }}</div>
                  <div style="font-size:13px;color:#606266;margin-top:4px">&#25945;&#32844;&#24037;&#25968;</div>
                </div>
              </el-col>
              <el-col :span="4">
                <div class="stat-card-home" style="background:linear-gradient(135deg,#fef4e6,#fde8cd)">
                  <div style="font-size:26px;margin-bottom:8px">&#128218;</div>
                  <div style="font-size:26px;font-weight:800;color:#b07030">{{ stats.courseCount }}</div>
                  <div style="font-size:13px;color:#606266;margin-top:4px">&#24320;&#35774;&#35838;&#31243;</div>
                </div>
              </el-col>
              <el-col :span="4">
                <div class="stat-card-home" style="background:linear-gradient(135deg,#f5f0ff,#e8dbf5)">
                  <div style="font-size:26px;margin-bottom:8px">&#128203;</div>
                  <div style="font-size:26px;font-weight:800;color:#6b4a9a">{{ stats.scoreCount }}</div>
                  <div style="font-size:13px;color:#606266;margin-top:4px">&#25104;&#32489;&#35760;&#24405;</div>
                </div>
              </el-col>
              <el-col :span="4">
                <div class="stat-card-home" style="background:linear-gradient(135deg,#fef0f0,#fde2e2)">
                  <div style="font-size:26px;margin-bottom:8px">&#128226;</div>
                  <div style="font-size:26px;font-weight:800;color:#c44a6a">{{ stats.noticeCount }}</div>
                  <div style="font-size:13px;color:#606266;margin-top:4px">&#21457;&#24067;&#20844;&#21578;</div>
                </div>
              </el-col>
              <el-col :span="4">
                <div class="stat-card-home" style="background:linear-gradient(135deg,#e8f5f9,#d3eaf5)">
                  <div style="font-size:26px;margin-bottom:8px">&#128719;</div>
                  <div style="font-size:26px;font-weight:800;color:#2a7a9a">{{ stats.roomCount }}</div>
                  <div style="font-size:13px;color:#606266;margin-top:4px">&#23487;&#20250;&#25968;&#37327;</div>
                </div>
              </el-col>
            </el-row>

            <el-row :gutter="14">
              <el-col :span="14">
                <div class="panel">
                  <div class="panel-section-title">&#128226; &#26368;&#26032;&#20844;&#21578;</div>
                  <div v-if="recentNotices.length === 0" style="color:#c0c4cc;text-align:center;padding:20px 0;font-size:13px">&#26242;&#26080;&#20844;&#21578;</div>
                  <div v-else>
                    <div
                      v-for="(n, i) in recentNotices"
                      :key="i"
                      style="display:flex;align-items:center;gap:12px;padding:10px 0;border-bottom:1px solid #f0f0f0;cursor:pointer"
                      :style="i === recentNotices.length - 1 ? 'border-bottom:none' : ''"
                      @click="switchMenu('notice-list')"
                    >
                      <div style="width:8px;height:8px;border-radius:50%;background:#3a7bd5;flex-shrink:0"></div>
                      <div style="flex:1;min-width:0">
                        <div style="font-size:13px;color:#303133;font-weight:500;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">{{ n.title }}</div>
                        <div style="font-size:12px;color:#909399;margin-top:2px">{{ n.time || n.createAt }}</div>
                      </div>
                      <el-tag size="small" :type="n.priority==='高'?'danger':n.priority==='中'?'warning':'info'" effect="plain">{{ n.priority || '&#26242;&#36890;' }}</el-tag>
                    </div>
                  </div>
                  <div style="text-align:center;margin-top:10px">
                    <el-button size="small" plain @click="switchMenu('notice-list')" style="color:#3a7bd5;border-color:#3a7bd5">&#26597;&#30475;&#20840;&#37096;&#20844;&#21578; &#8594;</el-button>
                  </div>
                </div>
              </el-col>
              <el-col :span="10">
                <div class="panel">
                  <div class="panel-section-title">&#128203; &#26368;&#36817;&#25805;&#20316;</div>
                  <div v-if="recentLogs.length === 0" style="color:#c0c4cc;text-align:center;padding:20px 0;font-size:13px">&#26242;&#26080;&#25805;&#20316;&#35760;&#24405;</div>
                  <div v-else>
                    <div
                      v-for="(log, i) in recentLogs"
                      :key="i"
                      style="display:flex;align-items:flex-start;gap:10px;padding:8px 0;border-bottom:1px solid #f0f0f0"
                      :style="i === recentLogs.length - 1 ? 'border-bottom:none' : ''"
                    >
                      <div style="width:6px;height:6px;border-radius:50%;background:#3a7bd5;flex-shrink:0;margin-top:6px"></div>
                      <div style="flex:1;min-width:0">
                        <div style="font-size:13px;color:#303133">{{ log.detail }}</div>
                        <div style="font-size:12px;color:#909399;margin-top:2px">{{ log.time }}</div>
                      </div>
                      <el-tag size="small" :type="log.type==='&#26032;&#22686;'?'success':log.type==='&#32534;&#36753;'?'warning':log.type==='&#21024;&#38500;'?'danger':'info'" effect="plain" style="flex-shrink:0">{{ log.type }}</el-tag>
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
        </section>
      </main>
    </div>
  `
};

/* ========== 启动 Vue 应用 ========== */
window.addEventListener('DOMContentLoaded', () => {
  const app = createApp(App);
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
  app.mount('#app');
});
