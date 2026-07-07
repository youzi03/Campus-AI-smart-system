/* ============================================================
 * 用户服务 user-service — 对接后端 REST API
 * 包含：学生列表、教师列表、CRUD、批量录入、学籍状态变更、操作日志
 * ============================================================ */
(function (global) {

  const collegeOptions = ['计算机学院', '数学学院', '物理学院', '外语学院', '化学学院', '经济学院', '机械学院', '艺术学院', '文学院'];
  const gradeOptions = ['大一', '大二', '大三', '大四'];
  const titleOptions = ['讲师', '副教授', '教授', '助教'];
  const statusOptions = ['在读', '休学', '退学', '毕业'];

  // ========== 后端可用性检测 ==========
  let _online = true;

  async function checkOnline() {
    try {
      await apiClient.get('/health');
      _online = true;
    } catch {
      _online = false;
    }
    return _online;
  }

  // ========== 操作日志（localStorage 兜底） ==========
  const logSample = [
    { id: Common.uid(), type: '新增', target: '学生', targetId: '2025001', operator: '管理员', time: '2025-09-01 09:00:00', detail: '新增学生：张明' },
    { id: Common.uid(), type: '新增', target: '学生', targetId: '2025002', operator: '管理员', time: '2025-09-01 09:05:00', detail: '新增学生：李思琪' },
    { id: Common.uid(), type: '编辑', target: '学生', targetId: '2025001', operator: '管理员', time: '2025-09-10 14:20:00', detail: '修改电话：13800138001 → 13800138999' },
    { id: Common.uid(), type: '状态变更', target: '学生', targetId: '2025006', operator: '管理员', time: '2025-10-15 10:00:00', detail: '刘雨桐：休学（在读 → 休学）' }
  ];

  const fallbackGetOpLogs = () => {
    const cached = localStorage.getItem('oplogs');
    if (cached) return JSON.parse(cached);
    localStorage.setItem('oplogs', JSON.stringify(logSample));
    return logSample;
  };
  const fallbackSaveOpLogs = (list) => localStorage.setItem('oplogs', JSON.stringify(list));
  const fallbackAddOpLog = (type, target, targetId, detail) => {
    const logs = fallbackGetOpLogs();
    logs.unshift({ id: Common.uid(), type, target, targetId, operator: '管理员', time: Common.now(), detail });
    fallbackSaveOpLogs(logs);
  };

  // ========== 主服务 ==========
  const UserService = {

    /** 检测后端可用性 */
    get online() { return _online; },
    checkOnline,

    // ---- 学生 ----

    async getStudents() {
      try {
        return await apiClient.get('/students/all');
      } catch {
        _online = false;
        const cached = localStorage.getItem('students');
        return cached ? JSON.parse(cached) : [];
      }
    },

    async addStudent(s) {
      try {
        return await apiClient.post('/students', s);
      } catch {
        _online = false;
        const list = JSON.parse(localStorage.getItem('students') || '[]');
        if (list.some(x => x.id === s.id)) {
          Common.showMsg('学号已存在：' + s.id, 'error'); return false;
        }
        s.status = s.status || '在读';
        s.createAt = s.createAt || Common.today();
        list.unshift(s);
        localStorage.setItem('students', JSON.stringify(list));
        fallbackAddOpLog('新增', '学生', s.id, '新增学生：' + s.name + '（' + s.college + ' ' + s.major + '）');
        Common.showMsg('添加学生成功：' + s.name);
        return true;
      }
    },

    async updateStudent(s, oldData) {
      try {
        return await apiClient.put('/students/' + s.id, s);
      } catch {
        _online = false;
        const list = JSON.parse(localStorage.getItem('students') || '[]');
        const idx = list.findIndex(x => x.id === s.id);
        if (idx < 0) { Common.showMsg('未找到该学生', 'error'); return false; }
        list[idx] = Object.assign({}, list[idx], s);
        localStorage.setItem('students', JSON.stringify(list));
        if (oldData) {
          const changes = [];
          Object.keys(s).forEach(k => {
            if (oldData[k] !== s[k] && k !== 'createAt') {
              changes.push(k + '：' + oldData[k] + ' → ' + s[k]);
            }
          });
          if (changes.length) fallbackAddOpLog('编辑', '学生', s.id, changes.join('；'));
        } else {
          fallbackAddOpLog('编辑', '学生', s.id, '编辑学生：' + s.name);
        }
        Common.showMsg('更新学生信息成功');
        return true;
      }
    },

    async deleteStudent(s) {
      try {
        return await apiClient.del('/students/' + s.id);
      } catch {
        _online = false;
        const list = JSON.parse(localStorage.getItem('students') || '[]');
        fallbackAddOpLog('删除', '学生', s.id, '删除学生：' + s.name + '（学号：' + s.id + '）');
        localStorage.setItem('students', JSON.stringify(list.filter(x => x.id !== s.id)));
        Common.showMsg('删除学生成功：' + s.name, 'success');
        return true;
      }
    },

    async changeStatus(id, newStatus) {
      try {
        return await apiClient.put('/students/' + id + '/status', { status: newStatus });
      } catch {
        _online = false;
        const list = JSON.parse(localStorage.getItem('students') || '[]');
        const idx = list.findIndex(x => x.id === id);
        if (idx < 0) { Common.showMsg('未找到该学生', 'error'); return false; }
        const oldStatus = list[idx].status;
        list[idx].status = newStatus;
        list[idx].statusChangeAt = Common.now();
        list[idx].statusOperator = '管理员';
        localStorage.setItem('students', JSON.stringify(list));
        fallbackAddOpLog('状态变更', '学生', id, list[idx].name + '：' + oldStatus + ' → ' + newStatus);
        Common.showMsg('学籍状态已变更为：' + newStatus);
        return true;
      }
    },

    async batchChangeStatus(ids, newStatus) {
      try {
        return await apiClient.post('/students/batch-status', { ids, status: newStatus });
      } catch {
        _online = false;
        const list = JSON.parse(localStorage.getItem('students') || '[]');
        let changed = 0;
        ids.forEach(id => {
          const idx = list.findIndex(x => x.id === id);
          if (idx >= 0) { list[idx].status = newStatus; list[idx].statusChangeAt = Common.now(); list[idx].statusOperator = '管理员'; changed++; }
        });
        if (changed > 0) {
          localStorage.setItem('students', JSON.stringify(list));
          fallbackAddOpLog('批量状态变更', '学生', ids.join(','), '批量变更 ' + changed + ' 名学生状态为：' + newStatus);
          Common.showMsg('批量变更学籍状态成功：' + changed + ' 人');
        }
        return { changed };
      }
    },

    // ---- 教师 ----

    async getTeachers() {
      try {
        return await apiClient.get('/teachers/all');
      } catch {
        _online = false;
        const cached = localStorage.getItem('teachers');
        return cached ? JSON.parse(cached) : [];
      }
    },

    async addTeacher(t) {
      try {
        return await apiClient.post('/teachers', t);
      } catch {
        _online = false;
        const list = JSON.parse(localStorage.getItem('teachers') || '[]');
        if (list.some(x => x.id === t.id)) { Common.showMsg('工号已存在：' + t.id, 'error'); return false; }
        list.unshift(t);
        localStorage.setItem('teachers', JSON.stringify(list));
        fallbackAddOpLog('新增', '教师', t.id, '新增教师：' + t.name + '（' + t.college + ' ' + t.title + '）');
        Common.showMsg('添加教师成功：' + t.name);
        return true;
      }
    },

    async updateTeacher(t, oldData) {
      try {
        return await apiClient.put('/teachers/' + t.id, t);
      } catch {
        _online = false;
        const list = JSON.parse(localStorage.getItem('teachers') || '[]');
        const idx = list.findIndex(x => x.id === t.id);
        if (idx < 0) { Common.showMsg('未找到该教师', 'error'); return false; }
        list[idx] = Object.assign({}, list[idx], t);
        localStorage.setItem('teachers', JSON.stringify(list));
        if (oldData) {
          const changes = [];
          Object.keys(t).forEach(k => { if (oldData[k] !== t[k] && k !== 'joinYear') { changes.push(k + '：' + oldData[k] + ' → ' + t[k]); } });
          if (changes.length) fallbackAddOpLog('编辑', '教师', t.id, changes.join('；'));
        } else {
          fallbackAddOpLog('编辑', '教师', t.id, '编辑教师：' + t.name);
        }
        Common.showMsg('更新教师信息成功');
        return true;
      }
    },

    async deleteTeacher(t) {
      try {
        return await apiClient.del('/teachers/' + t.id);
      } catch {
        _online = false;
        const list = JSON.parse(localStorage.getItem('teachers') || '[]');
        fallbackAddOpLog('删除', '教师', t.id, '删除教师：' + t.name + '（工号：' + t.id + '）');
        localStorage.setItem('teachers', JSON.stringify(list.filter(x => x.id !== t.id)));
        Common.showMsg('删除教师成功：' + t.name);
      }
    },

    // ---- 批量录入 ----

    async batchAddStudents(rows) {
      try {
        return await apiClient.post('/students/batch', rows);
      } catch {
        _online = false;
        const list = JSON.parse(localStorage.getItem('students') || '[]');
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
          localStorage.setItem('students', JSON.stringify(list));
          fallbackAddOpLog('批量新增', '学生', 'batch', '批量录入新增 ' + added + ' 名学生');
        }
        return { added, skipped, errors, total: rows.length };
      }
    },

    async batchAddTeachers(rows) {
      try {
        return await apiClient.post('/teachers/batch', rows);
      } catch {
        _online = false;
        const list = JSON.parse(localStorage.getItem('teachers') || '[]');
        let added = 0, skipped = 0;
        const errors = [];
        rows.forEach((r, i) => {
          if (!r.id || !r.name) { errors.push({ row: i + 1, msg: '工号或姓名不能为空' }); skipped++; return; }
          if (list.some(x => x.id === r.id)) { errors.push({ row: i + 1, msg: '工号 ' + r.id + ' 已存在（跳过）' }); skipped++; return; }
          list.unshift(r);
          added++;
        });
        if (added > 0) {
          localStorage.setItem('teachers', JSON.stringify(list));
          fallbackAddOpLog('批量新增', '教师', 'batch', '批量录入新增 ' + added + ' 名教师');
        }
        return { added, skipped, errors, total: rows.length };
      }
    },

    // ---- 操作日志 ----

    async getOpLogs(opts) {
      try {
        return await apiClient.get('/op-logs', opts || {});
      } catch {
        _online = false;
        const logs = fallbackGetOpLogs();
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
      }
    },

    // ---- 操作日志管理 ----

    async clearOpLogs() {
      try {
        return await apiClient.del('/op-logs');
      } catch {
        _online = false;
        localStorage.removeItem('oplogs');
        Common.showMsg('日志已清空');
      }
    },

    // ---- 统计数据 ----

    async studentCount() {
      try {
        const stats = await apiClient.get('/stats');
        return stats.studentCount || 0;
      } catch {
        _online = false;
        const list = JSON.parse(localStorage.getItem('students') || '[]');
        return list.filter(s => s.status !== '退学').length;
      }
    },

    async teacherCount() {
      try {
        const stats = await apiClient.get('/stats');
        return stats.teacherCount || 0;
      } catch {
        _online = false;
        const list = JSON.parse(localStorage.getItem('teachers') || '[]');
        return list.length;
      }
    },

    // ---- 辅助（同步属性） ----
    get collegeOptions() { return collegeOptions; },
    get gradeOptions() { return gradeOptions; },
    get titleOptions() { return titleOptions; },
    get statusOptions() { return statusOptions; }
  };

  global.UserService = UserService;
})(window);
