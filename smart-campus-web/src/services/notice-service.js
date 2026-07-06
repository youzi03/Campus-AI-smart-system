/* ============================================================
 * 公告服务 notice-service
 * 功能：公告发布、推送、预警消息
 * ============================================================ */
(function (global) {

  const noticeSample = [
    { id: 'N001', title: '关于2026年春季学期开学工作的通知', type: '重要', level: 'high', target: '全体师生', publisher: '教务处', content: '根据学校安排，2026年春季学期将于2月24日正式开学，请各位师生做好开学准备工作。', createAt: '2026-01-20', views: 1892, pinned: true },
    { id: 'N002', title: '【预警】期末考试成绩低于60分学生名单提醒', type: '预警', level: 'warning', target: '相关学生', publisher: '学生工作处', content: '以下学生本次期末考试存在不及格科目，请及时关注并安排补考。', createAt: '2026-01-18', views: 452, pinned: false },
    { id: 'N003', title: '图书馆寒假开放时间调整公告', type: '通知', level: 'normal', target: '全体师生', publisher: '图书馆', content: '寒假期间图书馆开放时间调整为：周一至周五 9:00-17:00。', createAt: '2026-01-15', views: 1203, pinned: false },
    { id: 'N004', title: '关于开展2026年度科研项目申报工作的通知', type: '通知', level: 'normal', target: '教师', publisher: '科研处', content: '现启动2026年度科研项目申报工作，请各位教师按要求完成申报。', createAt: '2026-01-12', views: 688, pinned: false },
    { id: 'N005', title: '校园网络安全升级通知', type: '通知', level: 'normal', target: '全体师生', publisher: '信息中心', content: '校园网络将于1月25日凌晨2:00-6:00进行安全升级，届时网络可能中断。', createAt: '2026-01-10', views: 2341, pinned: false }
  ];

  const NoticeService = {
    getNotices() {
      const cached = localStorage.getItem('notices');
      if (cached) return JSON.parse(cached);
      localStorage.setItem('notices', JSON.stringify(noticeSample));
      return noticeSample;
    },
    saveNotices(list) { localStorage.setItem('notices', JSON.stringify(list)); },
    addNotice(n) {
      const list = this.getNotices();
      n.id = Common.uid('N');
      n.createAt = Common.today();
      n.views = 0;
      list.unshift(n);
      this.saveNotices(list);
      Common.showMsg('公告发布成功：' + n.title);
      return true;
    },
    updateNotice(n) {
      const list = this.getNotices();
      const idx = list.findIndex(x => x.id === n.id);
      if (idx < 0) { Common.showMsg('未找到该公告', 'error'); return false; }
      list[idx] = Object.assign({}, list[idx], n);
      this.saveNotices(list);
      Common.showMsg('公告更新成功');
      return true;
    },
    deleteNotice(id) {
      const list = this.getNotices().filter(x => x.id !== id);
      this.saveNotices(list);
      Common.showMsg('删除公告成功');
    },
    togglePin(id) {
      const list = this.getNotices();
      const item = list.find(x => x.id === id);
      if (!item) return;
      item.pinned = !item.pinned;
      this.saveNotices(list);
      Common.showMsg(item.pinned ? '已置顶该公告' : '已取消置顶');
    },
    /**
     * 模拟"推送"功能：把公告标记为已推送
     */
    pushNotice(id) {
      const list = this.getNotices();
      const item = list.find(x => x.id === id);
      if (!item) return;
      item.pushed = true;
      this.saveNotices(list);
      Common.showMsg('已向 ' + (item.target || '目标用户') + ' 推送：' + item.title);
    },
    /**
     * 预警消息生成：根据学生成绩不及格情况自动生成预警
     */
    generateWarning() {
      const list = this.getNotices();
      const scores = ScoreService.getScores();
      const fails = scores.filter(s => Number(s.score) < 60);
      if (fails.length === 0) {
        Common.showMsg('当前没有不及格成绩，无需生成预警', 'info');
        return 0;
      }
      const content = '系统检测到本学期共有 ' + fails.length + ' 条不及格成绩记录，请相关学院和辅导员关注学生学业情况，及时进行学业辅导。';
      const warning = {
        id: Common.uid('N'),
        title: '【学业预警】' + Common.today() + ' 不及格情况提醒',
        type: '预警',
        level: 'warning',
        target: '辅导员/学院',
        publisher: '教务处',
        content: content,
        createAt: Common.today(),
        views: 0,
        pinned: false,
        isWarning: true
      };
      list.unshift(warning);
      this.saveNotices(list);
      Common.showMsg('已生成学业预警公告');
      return 1;
    },

    noticeCount() { return this.getNotices().length; }
  };

  global.NoticeService = NoticeService;
})(window);
