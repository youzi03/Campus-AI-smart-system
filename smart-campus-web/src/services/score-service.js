/* ============================================================
 * 成绩服务 score-service
 * 功能：成绩录入、查询、统计分析
 * ============================================================ */
(function (global) {

  const scoreSample = [
    { id: 'SC001', studentId: '2025001', studentName: '张明', courseId: 'CS101', courseName: '数据结构', score: 88, semester: '2025-2026春', type: '期末', inputAt: '2026-01-10' },
    { id: 'SC002', studentId: '2025001', studentName: '张明', courseId: 'MA201', courseName: '高等数学', score: 92, semester: '2025-2026春', type: '期末', inputAt: '2026-01-10' },
    { id: 'SC003', studentId: '2025002', studentName: '李思琪', courseId: 'MA201', courseName: '高等数学', score: 95, semester: '2025-2026春', type: '期末', inputAt: '2026-01-10' },
    { id: 'SC004', studentId: '2025002', studentName: '李思琪', courseId: 'EN101', courseName: '大学英语', score: 86, semester: '2025-2026春', type: '期末', inputAt: '2026-01-11' },
    { id: 'SC005', studentId: '2025003', studentName: '王浩然', courseId: 'CS101', courseName: '数据结构', score: 79, semester: '2025-2026春', type: '期末', inputAt: '2026-01-11' },
    { id: 'SC006', studentId: '2025003', studentName: '王浩然', courseId: 'CS102', courseName: '操作系统', score: 82, semester: '2025-2026春', type: '期末', inputAt: '2026-01-12' },
    { id: 'SC007', studentId: '2025004', studentName: '赵雅婷', courseId: 'EN101', courseName: '大学英语', score: 90, semester: '2025-2026春', type: '期末', inputAt: '2026-01-12' },
    { id: 'SC008', studentId: '2025005', studentName: '陈俊杰', courseId: 'PH101', courseName: '大学物理', score: 68, semester: '2025-2026春', type: '期末', inputAt: '2026-01-13' },
    { id: 'SC009', studentId: '2025006', studentName: '刘雨桐', courseId: 'EC201', courseName: '微观经济学', score: 74, semester: '2025-2026春', type: '期末', inputAt: '2026-01-13' },
    { id: 'SC010', studentId: '2025007', studentName: '孙博文', courseId: 'CS101', courseName: '数据结构', score: 85, semester: '2025-2026春', type: '期末', inputAt: '2026-01-14' },
    { id: 'SC011', studentId: '2025008', studentName: '周嘉怡', courseId: 'MA201', courseName: '高等数学', score: 71, semester: '2025-2026春', type: '期末', inputAt: '2026-01-14' },
    { id: 'SC012', studentId: '2025009', studentName: '吴天宇', courseId: 'PH101', courseName: '大学物理', score: 58, semester: '2025-2026春', type: '期末', inputAt: '2026-01-15' }
  ];

  const ScoreService = {
    getScores() {
      const cached = localStorage.getItem('scores');
      if (cached) return JSON.parse(cached);
      localStorage.setItem('scores', JSON.stringify(scoreSample));
      return scoreSample;
    },
    saveScores(list) { localStorage.setItem('scores', JSON.stringify(list)); },
    addScore(s) {
      const list = this.getScores();
      // 唯一性检查：同一学生+同一课程+同一学期
      if (list.some(x => x.studentId === s.studentId && x.courseId === s.courseId && x.semester === s.semester)) {
        Common.showMsg('该学生该课程的成绩已存在，请使用修改功能', 'warning');
        return false;
      }
      s.id = Common.uid('SC');
      s.inputAt = Common.today();
      list.unshift(s);
      this.saveScores(list);
      Common.showMsg('成绩录入成功：' + s.studentName + ' ' + s.courseName + ' ' + s.score + '分');
      return true;
    },
    updateScore(s) {
      const list = this.getScores();
      const idx = list.findIndex(x => x.id === s.id);
      if (idx < 0) { Common.showMsg('未找到该成绩记录', 'error'); return false; }
      list[idx] = Object.assign({}, list[idx], s);
      this.saveScores(list);
      Common.showMsg('成绩更新成功');
      return true;
    },
    deleteScore(id) {
      const list = this.getScores().filter(x => x.id !== id);
      this.saveScores(list);
      Common.showMsg('删除成绩记录成功');
    },

    /**
     * 统计：按课程维度 —— 平均分、最高分、最低分、及格率、不及格人数
     */
    statByCourse() {
      const list = this.getScores();
      const map = {};
      list.forEach(s => {
        if (!map[s.courseId]) {
          map[s.courseId] = { courseId: s.courseId, courseName: s.courseName, scores: [], count: 0, total: 0, max: 0, min: 100, pass: 0, fail: 0 };
        }
        const row = map[s.courseId];
        row.count++;
        row.total += Number(s.score);
        row.max = Math.max(row.max, Number(s.score));
        row.min = Math.min(row.min, Number(s.score));
        if (Number(s.score) >= 60) row.pass++; else row.fail++;
      });
      return Object.values(map).map(r => ({
        courseId: r.courseId,
        courseName: r.courseName,
        count: r.count,
        avg: (r.total / r.count).toFixed(1),
        max: r.max,
        min: r.min,
        passRate: ((r.pass / r.count) * 100).toFixed(1) + '%',
        fail: r.fail
      }));
    },

    /**
     * 统计：按分数段分布（用于柱状图）
     */
    statByScoreRange() {
      const list = this.getScores();
      const buckets = [
        { label: '0-59', value: 0, color: '#f56c6c' },
        { label: '60-69', value: 0, color: '#e6a23c' },
        { label: '70-79', value: 0, color: '#409eff' },
        { label: '80-89', value: 0, color: '#67c23a' },
        { label: '90-100', value: 0, color: '#4ecdc4' }
      ];
      list.forEach(s => {
        const score = Number(s.score);
        if (score < 60) buckets[0].value++;
        else if (score < 70) buckets[1].value++;
        else if (score < 80) buckets[2].value++;
        else if (score < 90) buckets[3].value++;
        else buckets[4].value++;
      });
      return buckets;
    },

    /**
     * 按学生统计：计算每个学生的平均分与课程数
     */
    statByStudent() {
      const list = this.getScores();
      const map = {};
      list.forEach(s => {
        if (!map[s.studentId]) map[s.studentId] = { studentId: s.studentId, studentName: s.studentName, total: 0, count: 0, max: 0, min: 100 };
        const row = map[s.studentId];
        row.total += Number(s.score);
        row.count++;
        row.max = Math.max(row.max, Number(s.score));
        row.min = Math.min(row.min, Number(s.score));
      });
      return Object.values(map).map(r => ({
        studentId: r.studentId, studentName: r.studentName,
        count: r.count, avg: (r.total / r.count).toFixed(1),
        max: r.max, min: r.min
      })).sort((a, b) => Number(b.avg) - Number(a.avg));
    },

    scoreCount() { return this.getScores().length; }
  };

  global.ScoreService = ScoreService;
})(window);
