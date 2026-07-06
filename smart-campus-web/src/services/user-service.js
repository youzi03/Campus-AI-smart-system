/* ============================================================
 * 学生与教师基础信息服务
 * 包含：学生列表、教师列表、CRUD、批量录入
 * 增强：学籍状态管理、操作日志、数据校验
 * ============================================================ */
(function (global) {

  // ========== 学生数据（增加 status 字段） ==========
  const studentSample = [
    { id: '2025001', name: '张明', gender: '男', birth: '2005-08-12', college: '计算机学院', major: '软件工程', phone: '13800138001', dorm: '1号楼302', grade: '大三', status: '在读', createAt: '2025-09-01' },
    { id: '2025002', name: '李思琪', gender: '女', birth: '2005-10-20', college: '数学学院', major: '应用数学', phone: '13800138002', dorm: '2号楼205', grade: '大二', status: '在读', createAt: '2025-09-01' },
    { id: '2025003', name: '王浩然', gender: '男', birth: '2005-05-18', college: '计算机学院', major: '计算机科学与技术', phone: '13800138003', dorm: '1号楼305', grade: '大三', status: '在读', createAt: '2025-09-02' },
    { id: '2025004', name: '赵雅婷', gender: '女', birth: '2006-02-11', college: '外语学院', major: '英语', phone: '13800138004', dorm: '2号楼401', grade: '大一', status: '在读', createAt: '2025-09-03' },
    { id: '2025005', name: '陈俊杰', gender: '男', birth: '2004-12-09', college: '物理学院', major: '物理学', phone: '13800138005', dorm: '3号楼102', grade: '大四', status: '在读', createAt: '2025-09-01' },
    { id: '2025006', name: '刘雨桐', gender: '女', birth: '2005-07-22', college: '经济学院', major: '经济学', phone: '13800138006', dorm: '2号楼502', grade: '大二', status: '休学', createAt: '2025-09-05' },
    { id: '2025007', name: '孙博文', gender: '男', birth: '2005-03-30', college: '计算机学院', major: '人工智能', phone: '13800138007', dorm: '1号楼201', grade: '大三', status: '在读', createAt: '2025-09-06' },
    { id: '2025008', name: '周嘉怡', gender: '女', birth: '2006-01-14', college: '化学学院', major: '应用化学', phone: '13800138008', dorm: '4号楼303', grade: '大一', status: '在读', createAt: '2025-09-07' },
    { id: '2025009', name: '吴天宇', gender: '男', birth: '2004-11-05', college: '机械学院', major: '机械工程', phone: '13800138009', dorm: '3号楼204', grade: '大四', status: '在读', createAt: '2025-09-08' },
    { id: '2025010', name: '郑欣怡', gender: '女', birth: '2005-09-15', college: '艺术学院', major: '视觉设计', phone: '13800138010', dorm: '4号楼501', grade: '大二', status: '在读', createAt: '2025-09-09' }
  ];

  // ========== 教师数据 ==========
  const teacherSample = [
    { id: 'T001', name: '王明', gender: '男', college: '计算机学院', title: '副教授', major: '软件工程', phone: '13911112222', email: 'wangming@edu.cn', joinYear: 2015 },
    { id: 'T002', name: '李华', gender: '女', college: '数学学院', title: '讲师', major: '应用数学', phone: '13922223333', email: 'lihua@edu.cn', joinYear: 2018 },
    { id: 'T003', name: '张伟', gender: '男', college: '计算机学院', title: '教授', major: '人工智能', phone: '13933334444', email: 'zhangwei@edu.cn', joinYear: 2010 },
    { id: 'T004', name: '陈雪', gender: '女', college: '外语学院', title: '副教授', major: '英语', phone: '13944445555', email: 'chenxue@edu.cn', joinYear: 2012 },
    { id: 'T005', name: '刘强', gender: '男', college: '物理学院', title: '教授', major: '物理学', phone: '13955556666', email: 'liuqiang@edu.cn', joinYear: 2008 },
    { id: 'T006', name: '黄丽', gender: '女', college: '经济学院', title: '讲师', major: '经济学', phone: '13966667777', email: 'huangli@edu.cn', joinYear: 2019 }
  ];

  // ========== 操作日志 ==========
  const logSample = [
    { id: Common.uid(), type: '新增', target: '学生', targetId: '2025001', operator: '管理员', time: '2025-09-01 09:00:00', detail: '新增学生：张明' },
    { id: Common.uid(), type: '新增', target: '学生', targetId: '2025002', operator: '管理员', time: '2025-09-01 09:05:00', detail: '新增学生：李思琪' },
    { id: Common.uid(), type: '编辑', target: '学生', targetId: '2025001', operator: '管理员', time: '2025-09-10 14:20:00', detail: '修改电话：13800138001 → 13800138999' },
    { id: Common.uid(), type: '状态变更', target: '学生', targetId: '2025006', operator: '管理员', time: '2025-10-15 10:00:00', detail: '刘雨桐：休学（在读 → 休学）' }
  ];

  const collegeOptions = ['计算机学院', '数学学院', '物理学院', '外语学院', '化学学院', '经济学院', '机械学院', '艺术学院', '文学院'];
  const gradeOptions = ['大一', '大二', '大三', '大四'];
  const titleOptions = ['讲师', '副教授', '教授', '助教'];
  const statusOptions = ['在读', '休学', '退学', '毕业'];

  // ========== 操作日志工具 ==========
  const getOpLogs = () => {
    const cached = localStorage.getItem('oplogs');
    if (cached) return JSON.parse(cached);
    localStorage.setItem('oplogs', JSON.stringify(logSample));
    return logSample;
  };
  const saveOpLogs = (list) => localStorage.setItem('oplogs', JSON.stringify(list));

  const addOpLog = (type, target, targetId, detail) => {
    const logs = getOpLogs();
    logs.unshift({ id: Common.uid(), type, target, targetId, operator: '管理员', time: Common.now(), detail });
    saveOpLogs(logs);
  };

  // ========== 主服务 ==========
  const UserService = {
    // ---- 学生 ----
    getStudents() {
      const cached = localStorage.getItem('students');
      if (cached) return JSON.parse(cached);
      localStorage.setItem('students', JSON.stringify(studentSample));
      return studentSample;
    },
    saveStudents(list) { localStorage.setItem('students', JSON.stringify(list)); },

    addStudent(s) {
      const list = this.getStudents();
      if (list.some(x => x.id === s.id)) {
        Common.showMsg('学号已存在：' + s.id, 'error'); return false;
      }
      s.status = s.status || '在读';
      s.createAt = s.createAt || Common.today();
      list.unshift(s);
      this.saveStudents(list);
      addOpLog('新增', '学生', s.id, '新增学生：' + s.name + '（' + s.college + ' ' + s.major + '）');
      Common.showMsg('添加学生成功：' + s.name);
      return true;
    },

    updateStudent(s, oldData) {
      const list = this.getStudents();
      const idx = list.findIndex(x => x.id === s.id);
      if (idx < 0) { Common.showMsg('未找到该学生', 'error'); return false; }
      list[idx] = Object.assign({}, list[idx], s);
      this.saveStudents(list);

      // 记录变更日志
      if (oldData) {
        const changes = [];
        Object.keys(s).forEach(k => {
          if (oldData[k] !== s[k] && k !== 'createAt') {
            changes.push(k + '：' + oldData[k] + ' → ' + s[k]);
          }
        });
        if (changes.length) addOpLog('编辑', '学生', s.id, changes.join('；'));
      } else {
        addOpLog('编辑', '学生', s.id, '编辑学生：' + s.name);
      }
      Common.showMsg('更新学生信息成功');
      return true;
    },

    deleteStudent(s) {
      const list = this.getStudents();
      const idx = list.findIndex(x => x.id === s.id);
      if (idx < 0) { Common.showMsg('未找到该学生', 'error'); return false; }
      addOpLog('删除', '学生', s.id, '删除学生：' + s.name + '（学号：' + s.id + '）');
      this.saveStudents(list.filter(x => x.id !== s.id));
      Common.showMsg('删除学生成功：' + s.name, 'success');
      return true;
    },

    // 变更学籍状态（Epic 3）
    changeStatus(id, newStatus, operator) {
      const list = this.getStudents();
      const idx = list.findIndex(x => x.id === id);
      if (idx < 0) { Common.showMsg('未找到该学生', 'error'); return false; }
      const oldStatus = list[idx].status;
      list[idx].status = newStatus;
      list[idx].statusChangeAt = Common.now();
      list[idx].statusOperator = operator || '管理员';
      this.saveStudents(list);
      addOpLog('状态变更', '学生', id, list[idx].name + '：' + oldStatus + ' → ' + newStatus + '（操作人：' + (operator || '管理员') + '）');
      Common.showMsg('学籍状态已变更为：' + newStatus);
      return true;
    },

    // 批量变更学籍状态
    batchChangeStatus(ids, newStatus) {
      const list = this.getStudents();
      let changed = 0;
      ids.forEach(id => {
        const idx = list.findIndex(x => x.id === id);
        if (idx >= 0) {
          list[idx].status = newStatus;
          list[idx].statusChangeAt = Common.now();
          list[idx].statusOperator = '管理员';
          changed++;
        }
      });
      if (changed > 0) {
        this.saveStudents(list);
        addOpLog('批量状态变更', '学生', ids.join(','), '批量变更 ' + changed + ' 名学生状态为：' + newStatus);
        Common.showMsg('批量变更学籍状态成功：' + changed + ' 人');
      }
      return { changed };
    },

    // ---- 教师 ----
    getTeachers() {
      const cached = localStorage.getItem('teachers');
      if (cached) return JSON.parse(cached);
      localStorage.setItem('teachers', JSON.stringify(teacherSample));
      return teacherSample;
    },
    saveTeachers(list) { localStorage.setItem('teachers', JSON.stringify(list)); },

    addTeacher(t) {
      const list = this.getTeachers();
      if (list.some(x => x.id === t.id)) { Common.showMsg('工号已存在：' + t.id, 'error'); return false; }
      list.unshift(t);
      this.saveTeachers(list);
      addOpLog('新增', '教师', t.id, '新增教师：' + t.name + '（' + t.college + ' ' + t.title + '）');
      Common.showMsg('添加教师成功：' + t.name);
      return true;
    },

    updateTeacher(t, oldData) {
      const list = this.getTeachers();
      const idx = list.findIndex(x => x.id === t.id);
      if (idx < 0) { Common.showMsg('未找到该教师', 'error'); return false; }
      list[idx] = Object.assign({}, list[idx], t);
      this.saveTeachers(list);
      if (oldData) {
        const changes = [];
        Object.keys(t).forEach(k => {
          if (oldData[k] !== t[k] && k !== 'joinYear') {
            changes.push(k + '：' + oldData[k] + ' → ' + t[k]);
          }
        });
        if (changes.length) addOpLog('编辑', '教师', t.id, changes.join('；'));
      } else {
        addOpLog('编辑', '教师', t.id, '编辑教师：' + t.name);
      }
      Common.showMsg('更新教师信息成功');
      return true;
    },

    deleteTeacher(t) {
      const list = this.getTeachers();
      addOpLog('删除', '教师', t.id, '删除教师：' + t.name + '（工号：' + t.id + '）');
      this.saveTeachers(list.filter(x => x.id !== t.id));
      Common.showMsg('删除教师成功：' + t.name);
    },

    // ---- 批量录入（增强：返回校验结果） ----
    batchAddStudents(rows) {
      const list = this.getStudents();
      let added = 0, skipped = 0;
      const errors = [];
      rows.forEach((r, i) => {
        if (!r.id || !r.name) { errors.push({ row: i + 1, msg: '学号或姓名不能为空' }); skipped++; return; }
        if (list.some(x => x.id === r.id)) { errors.push({ row: i + 1, msg: '学号 ' + r.id + ' 已存在（跳过）' }); skipped++; return; }
        r.status = r.status || '在读';
        r.createAt = r.createAt || Common.today();
        list.unshift(r);
        added++;
      });
      if (added > 0) {
        this.saveStudents(list);
        addOpLog('批量新增', '学生', 'batch', '批量录入新增 ' + added + ' 名学生');
      }
      return { added, skipped, errors, total: rows.length };
    },

    batchAddTeachers(rows) {
      const list = this.getTeachers();
      let added = 0, skipped = 0;
      const errors = [];
      rows.forEach((r, i) => {
        if (!r.id || !r.name) { errors.push({ row: i + 1, msg: '工号或姓名不能为空' }); skipped++; return; }
        if (list.some(x => x.id === r.id)) { errors.push({ row: i + 1, msg: '工号 ' + r.id + ' 已存在（跳过）' }); skipped++; return; }
        list.unshift(r);
        added++;
      });
      if (added > 0) {
        this.saveTeachers(list);
        addOpLog('批量新增', '教师', 'batch', '批量录入新增 ' + added + ' 名教师');
      }
      return { added, skipped, errors, total: rows.length };
    },

    // ---- 操作日志 ----
    getOpLogs(opts) {
      const logs = getOpLogs();
      if (!opts) return logs;
      return logs.filter(l => {
        if (opts.target && l.target !== opts.target) return false;
        if (opts.type && l.type !== opts.type) return false;
        if (opts.keyword) {
          const kw = opts.keyword.trim();
          if (!l.detail.includes(kw) && !l.targetId.includes(kw)) return false;
        }
        return true;
      });
    },

    // ---- 辅助 ----
    get collegeOptions() { return collegeOptions; },
    get gradeOptions() { return gradeOptions; },
    get titleOptions() { return titleOptions; },
    get statusOptions() { return statusOptions; },

    studentCount() { return this.getStudents().filter(s => s.status !== '退学').length; },
    activeStudentCount() { return this.getStudents().filter(s => s.status === '在读').length; },
    teacherCount() { return this.getTeachers().length; }
  };

  global.UserService = UserService;
})(window);
