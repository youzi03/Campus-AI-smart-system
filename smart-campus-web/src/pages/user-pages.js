/* ============================================================
 * 用户服务 user-service - 页面组件（对接后端 API）
 * 页面：学生管理 / 学生批量录入 / 教师管理 / 教师批量录入 / 操作日志
 * ============================================================ */
(function (global) {

  const E = ElementPlus;

  // ========== 1. 学生管理 ==========
  const PageUserStudent = {
    template: `
      <div class="page-wrapper">
        <div class="page-header">
          <div>
            <div class="page-title">👨‍🎓 学生信息管理</div>
            <div class="page-desc">管理在校学生的基础信息与学籍状态</div>
          </div>
          <div style="display:flex;gap:10px">
            <el-button type="primary" @click="openAdd">+ 新增学生</el-button>
            <el-button type="success" plain @click="goBatch">📥 批量录入</el-button>
            <el-button type="warning" plain @click="goLogs">📋 操作日志</el-button>
            <el-button plain @click="reset">🔄 重置数据</el-button>
          </div>
        </div>

        <!-- 状态统计卡片 -->
        <el-row :gutter="16" style="margin-bottom:16px">
          <el-col :span="6" v-for="(s, idx) in statusStats" :key="idx">
            <div :style="'padding:16px;border-radius:10px;cursor:pointer;transition:all 0.2s;border:2px solid transparent;' + (filter.status===s.val?'border-color:#3a7bd5;background:#f0f7ff':'background:#f5f7fa')" @click="toggleStatusFilter(s.val)">
              <div style="display:flex;justify-content:space-between;align-items:center">
                <div><div style="font-size:24px">{{ s.icon }}</div><div style="font-size:13px;color:#606266;margin-top:4px">{{ s.label }}</div></div>
                <div style="font-size:28px;font-weight:700;color:#303133">{{ s.count }}</div>
              </div>
            </div>
          </el-col>
        </el-row>

        <div class="panel">
          <div style="display:flex;gap:12px;margin-bottom:16px">
            <el-input v-model="filter.keyword" placeholder="学号/姓名/电话" clearable style="width:260px" />
            <el-select v-model="filter.college" placeholder="全部学院" clearable style="width:160px">
              <el-option v-for="c in collegeOptions" :key="c" :label="c" :value="c" />
            </el-select>
            <el-select v-model="filter.grade" placeholder="全部年级" clearable style="width:140px">
              <el-option v-for="g in gradeOptions" :key="g" :label="g" :value="g" />
            </el-select>
            <el-select v-model="filter.status" placeholder="全部状态" clearable style="width:130px">
              <el-option v-for="s in statusOptions" :key="s" :label="s" :value="s" />
            </el-select>
          </div>
          <el-table :data="pagedList" border stripe style="width:100%" @selection-change="onSelect">
            <el-table-column type="selection" width="45" />
            <el-table-column prop="id" label="学号" width="110" />
            <el-table-column prop="name" label="姓名" width="100" />
            <el-table-column prop="gender" label="性别" width="80" align="center">
              <template #default="s"><el-tag size="small" :type="s.row.gender==='男'?'primary':'danger'" effect="plain">{{ s.row.gender }}</el-tag></template>
            </el-table-column>
            <el-table-column prop="college" label="学院" width="140" />
            <el-table-column prop="major" label="专业" width="150" />
            <el-table-column prop="grade" label="年级" width="90" align="center" />
            <el-table-column prop="phone" label="联系电话" width="140" />
            <el-table-column prop="status" label="学籍状态" width="100" align="center">
              <template #default="s">
                <el-tag size="small" :type="statusType(s.row.status)" effect="dark">{{ s.row.status }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="220" fixed="right">
              <template #default="s">
                <el-button size="small" @click="openEdit(s.row)">编辑</el-button>
                <el-dropdown trigger="click" @command="cmd => changeStatus(s.row, cmd)">
                  <el-button size="small" type="info" style="margin-left:4px">状态 ▾</el-button>
                  <template #dropdown>
                    <el-dropdown-menu>
                      <el-dropdown-item v-for="opt in statusOptions" :key="opt" :command="opt" :disabled="s.row.status===opt">{{ opt }}</el-dropdown-item>
                    </el-dropdown-menu>
                  </template>
                </el-dropdown>
                <el-button size="small" type="danger" plain @click="confirmDelete(s.row)" style="margin-left:4px">删除</el-button>
              </template>
            </el-table-column>
          </el-table>

          <!-- 批量操作栏 -->
          <div v-if="selected.length" style="margin-top:12px;padding:10px 14px;background:#f0f7ff;border-radius:8px;display:flex;align-items:center;gap:12px">
            <el-tag type="primary" size="small">已选 {{ selected.length }} 人</el-tag>
            <el-dropdown @command="batchChangeStatus">
              <el-button type="primary" size="small">批量变更状态 ▾</el-button>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item v-for="opt in statusOptions" :key="opt" :command="opt">{{ opt }}</el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </div>

          <div style="display:flex;justify-content:flex-end;margin-top:16px">
            <el-pagination v-model:current-page="page.current" v-model:page-size="page.size"
              :page-sizes="[10,20,30,50]" layout="total, sizes, prev, pager, next, jumper" :total="filteredList.length" />
          </div>
        </div>

        <el-dialog v-model="dialog.show" :title="dialog.mode==='add'?'新增学生':'编辑学生'" width="640px">
          <el-form label-width="100px">
            <el-row :gutter="16">
              <el-col :span="12"><el-form-item label="学号"><el-input v-model="form.id" :disabled="dialog.mode==='edit'" /></el-form-item></el-col>
              <el-col :span="12"><el-form-item label="姓名"><el-input v-model="form.name" /></el-form-item></el-col>
              <el-col :span="12"><el-form-item label="性别">
                <el-radio-group v-model="form.gender"><el-radio label="男">男</el-radio><el-radio label="女">女</el-radio></el-radio-group>
              </el-form-item></el-col>
              <el-col :span="12"><el-form-item label="出生日期"><el-input v-model="form.birth" placeholder="如 2005-08-12" /></el-form-item></el-col>
              <el-col :span="12"><el-form-item label="学院">
                <el-select v-model="form.college" style="width:100%"><el-option v-for="c in collegeOptions" :key="c" :label="c" :value="c" /></el-select>
              </el-form-item></el-col>
              <el-col :span="12"><el-form-item label="专业"><el-input v-model="form.major" /></el-form-item></el-col>
              <el-col :span="12"><el-form-item label="年级">
                <el-select v-model="form.grade" style="width:100%"><el-option v-for="g in gradeOptions" :key="g" :label="g" :value="g" /></el-select>
              </el-form-item></el-col>
              <el-col :span="12"><el-form-item label="学籍状态">
                <el-select v-model="form.status" style="width:100%"><el-option v-for="s in statusOptions" :key="s" :label="s" :value="s" /></el-select>
              </el-form-item></el-col>
              <el-col :span="12"><el-form-item label="宿舍"><el-input v-model="form.dorm" placeholder="如 1号楼302" /></el-form-item></el-col>
              <el-col :span="24"><el-form-item label="联系电话"><el-input v-model="form.phone" /></el-form-item></el-col>
            </el-row>
          </el-form>
          <template #footer>
            <el-button @click="dialog.show=false">取消</el-button>
            <el-button type="primary" @click="submitForm">确定</el-button>
          </template>
        </el-dialog>
      </div>
    `,
    data() {
      return {
        list: [], selected: [],
        collegeOptions: UserService.collegeOptions,
        gradeOptions: UserService.gradeOptions,
        statusOptions: UserService.statusOptions,
        filter: { keyword: '', college: '', grade: '', status: '' },
        page: { current: 1, size: 10 },
        dialog: { show: false, mode: 'add' },
        form: { id: '', name: '', gender: '男', birth: '', college: '', major: '', grade: '大一', status: '在读', dorm: '', phone: '' }
      };
    },
    computed: {
      statusStats() {
        const all = this.list;
        const map = { '在读': { label: '在读', icon: '📚', val: '在读' }, '休学': { label: '休学', icon: '⏸', val: '休学' }, '退学': { label: '退学', icon: '🚫', val: '退学' }, '毕业': { label: '毕业', icon: '🎓', val: '毕业' } };
        Object.values(map).forEach(m => m.count = all.filter(s => s.status === m.val).length);
        return Object.values(map);
      },
      filteredList() {
        const kw = this.filter.keyword.trim();
        return this.list.filter(s => {
          if (kw && !s.id.includes(kw) && !s.name.includes(kw) && !(s.phone || '').includes(kw)) return false;
          if (this.filter.college && s.college !== this.filter.college) return false;
          if (this.filter.grade && s.grade !== this.filter.grade) return false;
          if (this.filter.status && s.status !== this.filter.status) return false;
          return true;
        });
      },
      pagedList() {
        const start = (this.page.current - 1) * this.page.size;
        return this.filteredList.slice(start, start + this.page.size);
      }
    },
    created() { this.load(); },
    methods: {
      async load() { this.list = await UserService.getStudents(); },
      statusType(s) { return { '在读': 'success', '休学': 'warning', '退学': 'danger', '毕业': 'info' }[s] || 'info'; },
      toggleStatusFilter(val) { this.filter.status = this.filter.status === val ? '' : val; },
      onSelect(rows) { this.selected = rows; },
      async changeStatus(row, newStatus) {
        if (row.status === newStatus) return;
        try {
          await E.ElMessageBox.confirm('确定将【' + row.name + '】的学籍状态变更为【' + newStatus + '】？', '学籍状态变更', { type: 'warning' });
          await UserService.changeStatus(row.id, newStatus);
          await this.load();
        } catch {}
      },
      async batchChangeStatus(newStatus) {
        if (!this.selected.length) return;
        const names = this.selected.slice(0, 3).map(s => s.name).join('、') + (this.selected.length > 3 ? '等' : '');
        try {
          await E.ElMessageBox.confirm('确定将【' + names + '】等 ' + this.selected.length + ' 名学生的学籍状态变更为【' + newStatus + '】？', '批量学籍状态变更', { type: 'warning' });
          await UserService.batchChangeStatus(this.selected.map(s => s.id), newStatus);
          await this.load();
          this.selected = [];
        } catch {}
      },
      openAdd() { this.dialog.mode = 'add'; this.form = { id: '', name: '', gender: '男', birth: '', college: '', major: '', grade: '大一', status: '在读', dorm: '', phone: '' }; this.dialog.show = true; },
      openEdit(row) { this.dialog.mode = 'edit'; this.form = Object.assign({}, row); this.dialog.show = true; },
      async submitForm() {
        if (!this.form.id || !this.form.name) { Common.showMsg('学号和姓名不能为空', 'warning'); return; }
        if (this.dialog.mode === 'add') await UserService.addStudent(this.form);
        else await UserService.updateStudent(this.form, this.form);
        await this.load(); this.dialog.show = false;
      },
      async confirmDelete(row) {
        try {
          await E.ElMessageBox.confirm('确定要删除学生【' + row.name + '】（学号：' + row.id + '）？', '删除确认', { type: 'warning' });
          await UserService.deleteStudent(row);
          await this.load();
        } catch {}
      },
      async reset() {
        try {
          await E.ElMessageBox.confirm('将清空当前学生数据并恢复为示例数据，确定？', '重置确认', { type: 'warning' });
          localStorage.removeItem('students');
          await this.load();
          Common.showMsg('已重置学生数据');
        } catch {}
      },
      goBatch() { global.$app && global.$app.switchMenu('student-batch'); },
      goLogs() { global.$app && global.$app.switchMenu('op-log'); }
    }
  };

  // ========== 2. 学生批量录入 ==========
  const PageUserStudentBatch = {
    template: `
      <div class="page-wrapper">
        <div class="page-header">
          <div>
            <div class="page-title">📥 学生批量录入</div>
            <div class="page-desc">支持 CSV / Excel 文件导入，自动校验数据格式，错误行高亮标注</div>
          </div>
          <el-button type="primary" @click="goList">📋 返回学生列表</el-button>
        </div>

        <div class="panel">
          <el-alert title="支持 .xlsx / .csv / .txt 文件。字段顺序：学号,姓名,性别,出生日期,学院,专业,联系电话,宿舍号（第一行若为表头会自动跳过）" type="info" :closable="false" style="margin-bottom:20px" />

          <div style="display:flex;gap:12px;margin-bottom:16px;flex-wrap:wrap;align-items:center">
            <el-button type="success" plain @click="downloadTemplate">📄 下载 CSV 模板</el-button>
            <el-upload action="#" :auto-upload="false" :show-file-list="false" :on-change="handleUpload" accept=".csv,.txt,.xlsx" style="display:inline-block">
              <el-button type="primary">📁 上传文件</el-button>
            </el-upload>
          </div>

          <el-divider content-position="left">📝 或直接粘贴数据</el-divider>
          <el-input type="textarea" v-model="text" :rows="10" placeholder="示例：&#10;2025020,王小萌,女,2005-03-15,计算机学院,软件工程,13800000020,1号楼302&#10;2025021,李大壮,男,2005-07-22,数学学院,应用数学,13800000021,2号楼208" style="width:100%;font-family:monospace" />
          <div style="margin-top:16px;display:flex;gap:10px">
            <el-button type="primary" @click="doPreview" :disabled="!text">🔍 预览并校验</el-button>
            <el-button @click="text='';previewResult=null;">🔄 清空</el-button>
          </div>
        </div>

        <!-- 预览 + 错误标注结果 -->
        <div v-if="previewResult" class="panel" style="margin-top:16px">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px">
            <div>
              <el-tag type="success" size="medium">✅ 新增 {{ previewResult.added }} 条</el-tag>
              <el-tag v-if="previewResult.skipped" type="warning" size="medium" style="margin-left:8px">⚠️ 跳过 {{ previewResult.skipped }} 条</el-tag>
              <el-tag type="info" size="medium" style="margin-left:8px">共 {{ previewResult.total }} 条</el-tag>
            </div>
            <div style="display:flex;gap:8px">
              <el-button type="primary" @click="doImport">✅ 确认导入</el-button>
              <el-button @click="previewResult=null">取消</el-button>
            </div>
          </div>
          <div v-if="previewResult.errors && previewResult.errors.length" style="background:#fef0f0;border-radius:8px;padding:12px;margin-bottom:12px;font-size:13px">
            <div style="color:#f56c6c;font-weight:600;margin-bottom:6px">⚠️ 校验告警（以下行被跳过）：</div>
            <div v-for="(err, i) in previewResult.errors" :key="i" style="color:#606266">行 {{ err.row }}: {{ err.msg }}</div>
          </div>
          <el-table :data="previewRows" border stripe style="width:100%" max-height="360">
            <el-table-column type="index" label="#" width="50" />
            <el-table-column prop="id" label="学号" width="110" />
            <el-table-column prop="name" label="姓名" width="100" />
            <el-table-column prop="gender" label="性别" width="70" />
            <el-table-column prop="college" label="学院" width="120" />
            <el-table-column prop="major" label="专业" width="130" />
            <el-table-column prop="phone" label="电话" width="130" />
            <el-table-column prop="dorm" label="宿舍" width="120" />
          </el-table>
        </div>

        <el-dialog v-model="result.show" title="✅ 批量导入结果" width="520px">
          <div style="text-align:center;padding:12px 0">
            <div style="font-size:48px;margin-bottom:12px">✅</div>
            <div style="font-size:18px;font-weight:700;color:#303133;margin-bottom:12px">批量导入完成</div>
            <div style="display:flex;justify-content:center;gap:24px">
              <div><div style="font-size:28px;font-weight:700;color:#67c23a">{{ result.added }}</div><div style="font-size:13px;color:#606266">新增</div></div>
              <div><div style="font-size:28px;font-weight:700;color:#e6a23c">{{ result.skipped }}</div><div style="font-size:13px;color:#606266">跳过</div></div>
              <div><div style="font-size:28px;font-weight:700;color:#303133">{{ result.total }}</div><div style="font-size:13px;color:#606266">总计</div></div>
            </div>
          </div>
          <template #footer><el-button type="primary" @click="result.show=false;text='';previewResult=null">完成</el-button></template>
        </el-dialog>
      </div>
    `,
    data() {
      return { text: '', previewResult: null, previewRows: [], result: { show: false, added: 0, skipped: 0, total: 0 } };
    },
    methods: {
      downloadTemplate() {
        const header = '学号,姓名,性别,出生日期,学院,专业,联系电话,宿舍号';
        const sample = '2025020,王小萌,女,2005-03-15,计算机学院,软件工程,13800000020,1号楼302\n2025021,李大壮,男,2005-07-22,数学学院,应用数学,13800000021,2号楼208';
        const blob = new Blob(['\uFEFF' + header + '\n' + sample], { type: 'text/csv;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a'); a.href = url; a.download = '学生信息导入模板.csv';
        document.body.appendChild(a); a.click();
        document.body.removeChild(a); URL.revokeObjectURL(url);
        Common.showMsg('模板已下载');
      },
      handleUpload(file) {
        const reader = new FileReader();
        reader.onload = (e) => { this.text = e.target.result; Common.showMsg('文件已加载'); };
        if (file.raw && file.raw.name && file.raw.name.endsWith('.xlsx')) {
          // XLSX 通过 SheetJS 解析
          reader.onload = (e) => {
            try {
              const wb = XLSX.read(e.target.result, { type: 'array' });
              const ws = wb.Sheets[wb.SheetNames[0]];
              const json = XLSX.utils.sheet_to_json(ws, { header: 1 });
              this.text = json.map(row => row.join(',')).join('\n');
              Common.showMsg('Excel 文件已解析');
            } catch (err) {
              Common.showMsg('解析 Excel 失败：' + err.message, 'error');
            }
          };
          reader.readAsArrayBuffer(file.raw);
        } else {
          reader.readAsText(file.raw || file, 'UTF-8');
        }
      },
      doPreview() {
        const lines = this.text.split(/\r?\n/).map(l => l.trim()).filter(l => l);
        if (!lines.length) { Common.showMsg('未找到有效数据', 'warning'); return; }
        const rows = []; const errors = []; let skipped = 0;
        lines.forEach((line, i) => {
          if (i === 0 && (line.toLowerCase().includes('学号') || line.toLowerCase().includes('姓名'))) { skipped++; return; }
          const parts = line.split(/[,，\t]/).map(p => p.trim());
          if (parts.length < 2) { errors.push({ row: i + 1, msg: '字段不足（至少需要学号和姓名）' }); skipped++; return; }
          rows.push({ id: parts[0], name: parts[1], gender: parts[2] || '男', birth: parts[3] || '', college: parts[4] || '', major: parts[5] || '', phone: parts[6] || '', dorm: parts[7] || '', status: '在读' });
        });
        this.previewRows = rows;
        this.previewResult = { added: rows.length, skipped, total: lines.length, errors };
      },
      async doImport() {
        if (!this.previewRows.length) { Common.showMsg('没有可导入的数据', 'warning'); return; }
        const res = await UserService.batchAddStudents(this.previewRows);
        this.result = { show: true, added: res.added, skipped: res.skipped + (this.previewResult ? this.previewResult.skipped : 0), total: res.total };
      },
      goList() { global.$app && global.$app.switchMenu('student-list'); }
    }
  };

  // ========== 3. 教师管理 ==========
  const PageUserTeacher = {
    template: `
      <div class="page-wrapper">
        <div class="page-header">
          <div>
            <div class="page-title">👨‍🏫 教师信息管理</div>
            <div class="page-desc">管理全校教职工基本信息与职称信息</div>
          </div>
          <div style="display:flex;gap:10px">
            <el-button type="primary" @click="openAdd">+ 新增教师</el-button>
            <el-button type="success" plain @click="goBatch">📥 批量录入</el-button>
            <el-button type="warning" plain @click="goLogs">📋 操作日志</el-button>
            <el-button plain @click="reset">🔄 重置数据</el-button>
          </div>
        </div>
        <div class="panel">
          <div style="display:flex;gap:12px;margin-bottom:16px">
            <el-input v-model="filter.keyword" placeholder="工号/姓名/电话" clearable style="width:240px" />
            <el-select v-model="filter.college" placeholder="全部学院" clearable style="width:160px">
              <el-option v-for="c in collegeOptions" :key="c" :label="c" :value="c" />
            </el-select>
            <el-select v-model="filter.title" placeholder="全部职称" clearable style="width:140px">
              <el-option v-for="t in titleOptions" :key="t" :label="t" :value="t" />
            </el-select>
          </div>
          <el-table :data="filteredList" border stripe style="width:100%">
            <el-table-column prop="id" label="工号" width="100" />
            <el-table-column prop="name" label="姓名" width="90" />
            <el-table-column prop="gender" label="性别" width="70" align="center" />
            <el-table-column prop="college" label="学院" width="140" />
            <el-table-column prop="title" label="职称" width="100" align="center" />
            <el-table-column prop="major" label="专业方向" width="150" />
            <el-table-column prop="phone" label="联系电话" width="140" />
            <el-table-column prop="email" label="邮箱" width="180" />
            <el-table-column prop="joinYear" label="入职年份" width="100" align="center" />
            <el-table-column label="操作" width="150" fixed="right">
              <template #default="s">
                <el-button size="small" @click="openEdit(s.row)">编辑</el-button>
                <el-button size="small" type="danger" plain @click="confirmDelete(s.row)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
          <div style="display:flex;justify-content:flex-end;margin-top:16px">
            <el-pagination v-model:current-page="page.current" v-model:page-size="page.size"
              :page-sizes="[10,20,30,50]" layout="total, sizes, prev, pager, next, jumper" :total="filteredList.length" />
          </div>
        </div>

        <el-dialog v-model="dialog.show" :title="dialog.mode==='add'?'新增教师':'编辑教师'" width="640px">
          <el-form label-width="100px">
            <el-row :gutter="16">
              <el-col :span="12"><el-form-item label="工号"><el-input v-model="form.id" :disabled="dialog.mode==='edit'" /></el-form-item></el-col>
              <el-col :span="12"><el-form-item label="姓名"><el-input v-model="form.name" /></el-form-item></el-col>
              <el-col :span="12"><el-form-item label="性别"><el-radio-group v-model="form.gender"><el-radio label="男">男</el-radio><el-radio label="女">女</el-radio></el-radio-group></el-form-item></el-col>
              <el-col :span="12"><el-form-item label="职称"><el-select v-model="form.title" style="width:100%"><el-option v-for="t in titleOptions" :key="t" :label="t" :value="t" /></el-select></el-form-item></el-col>
              <el-col :span="12"><el-form-item label="学院"><el-select v-model="form.college" style="width:100%"><el-option v-for="c in collegeOptions" :key="c" :label="c" :value="c" /></el-select></el-form-item></el-col>
              <el-col :span="12"><el-form-item label="专业方向"><el-input v-model="form.major" /></el-form-item></el-col>
              <el-col :span="12"><el-form-item label="电话"><el-input v-model="form.phone" /></el-form-item></el-col>
              <el-col :span="12"><el-form-item label="邮箱"><el-input v-model="form.email" /></el-form-item></el-col>
              <el-col :span="12"><el-form-item label="入职年份"><el-input-number v-model.number="form.joinYear" :min="1990" :max="2100" style="width:100%" /></el-form-item></el-col>
            </el-row>
          </el-form>
          <template #footer>
            <el-button @click="dialog.show=false">取消</el-button>
            <el-button type="primary" @click="submitForm">确定</el-button>
          </template>
        </el-dialog>
      </div>
    `,
    data() {
      return { list: [], collegeOptions: UserService.collegeOptions, titleOptions: UserService.titleOptions, filter: { keyword: '', college: '', title: '' }, page: { current: 1, size: 10 }, dialog: { show: false, mode: 'add' }, form: { id: '', name: '', gender: '男', college: '', title: '讲师', major: '', phone: '', email: '', joinYear: 2025 } };
    },
    computed: {
      filteredList() {
        const kw = this.filter.keyword.trim();
        return this.list.filter(t => {
          if (kw && !t.id.includes(kw) && !t.name.includes(kw) && !(t.phone || '').includes(kw)) return false;
          if (this.filter.college && t.college !== this.filter.college) return false;
          if (this.filter.title && t.title !== this.filter.title) return false;
          return true;
        });
      },
      pagedList() { const start = (this.page.current - 1) * this.page.size; return this.filteredList.slice(start, start + this.page.size); }
    },
    created() { this.load(); },
    methods: {
      async load() { this.list = await UserService.getTeachers(); },
      openAdd() { this.dialog.mode = 'add'; this.form = { id: '', name: '', gender: '男', college: '', title: '讲师', major: '', phone: '', email: '', joinYear: 2025 }; this.dialog.show = true; },
      openEdit(row) { this.dialog.mode = 'edit'; this.form = Object.assign({}, row); this.dialog.show = true; },
      async submitForm() {
        if (!this.form.id || !this.form.name) { Common.showMsg('工号和姓名不能为空', 'warning'); return; }
        if (this.dialog.mode === 'add') await UserService.addTeacher(this.form);
        else await UserService.updateTeacher(this.form, this.form);
        await this.load(); this.dialog.show = false;
      },
      async confirmDelete(row) {
        try {
          await E.ElMessageBox.confirm('确定要删除教师【' + row.name + '】？', '删除确认', { type: 'warning' });
          await UserService.deleteTeacher(row);
          await this.load();
        } catch {}
      },
      async reset() {
        try {
          await E.ElMessageBox.confirm('将清空当前教师数据并恢复为示例数据，确定？', '重置确认', { type: 'warning' });
          localStorage.removeItem('teachers');
          await this.load();
          Common.showMsg('已重置教师数据');
        } catch {}
      },
      goBatch() { global.$app && global.$app.switchMenu('teacher-batch'); },
      goLogs() { global.$app && global.$app.switchMenu('op-log'); }
    }
  };

  // ========== 4. 教师批量录入 ==========
  const PageUserTeacherBatch = {
    template: `
      <div class="page-wrapper">
        <div class="page-header">
          <div>
            <div class="page-title">📥 教师批量录入</div>
            <div class="page-desc">支持 CSV 文件导入或文本粘贴批量添加教师</div>
          </div>
          <el-button type="primary" @click="goList">📋 返回教师列表</el-button>
        </div>

        <div class="panel">
          <el-alert title="字段顺序：工号,姓名,性别,学院,职称,专业方向,联系电话,邮箱" type="info" :closable="false" style="margin-bottom:20px" />
          <div style="display:flex;gap:12px;margin-bottom:16px">
            <el-button type="success" plain @click="downloadTemplate">📄 下载模板</el-button>
            <el-upload action="#" :auto-upload="false" :show-file-list="false" :on-change="handleUpload" accept=".csv,.txt" style="display:inline-block">
              <el-button type="primary">📁 上传文件</el-button>
            </el-upload>
          </div>
          <el-divider content-position="left">📝 或直接粘贴数据</el-divider>
          <el-input type="textarea" v-model="text" :rows="10" placeholder="示例：&#10;T020,陈老师,女,计算机学院,副教授,软件工程,13911110020,chen@edu.cn&#10;T021,刘老师,男,数学学院,讲师,应用数学,13911110021,liu@edu.cn" style="width:100%" />
          <div style="margin-top:16px;display:flex;gap:10px">
            <el-button type="primary" @click="confirmBatch" :disabled="!text">✅ 确认批量录入</el-button>
            <el-button @click="text=''">🔄 清空</el-button>
          </div>
        </div>

        <el-dialog v-model="result.show" title="✅ 批量录入结果" width="480px">
          <div style="line-height:2;font-size:14px;color:#606266">
            <div style="font-size:16px;color:#303133;font-weight:700;margin-bottom:12px">📊 操作完成</div>
            <div>✅ 新增教师：<strong style="color:#67c23a;font-size:18px">{{ result.added }}</strong> 条</div>
            <div>⚠️ 跳过重复：<strong style="color:#e6a23c;font-size:18px">{{ result.skipped }}</strong> 条</div>
          </div>
          <template #footer>
            <el-button type="primary" @click="result.show=false; text=''">完成</el-button>
          </template>
        </el-dialog>
      </div>
    `,
    data() { return { text: '', result: { show: false, added: 0, skipped: 0 } }; },
    methods: {
      downloadTemplate() {
        const header = '工号,姓名,性别,学院,职称,专业方向,联系电话,邮箱';
        const sample = 'T020,陈老师,女,计算机学院,副教授,软件工程,13911110020,chen@edu.cn\nT021,刘老师,男,数学学院,讲师,应用数学,13911110021,liu@edu.cn';
        const blob = new Blob(['\uFEFF' + header + '\n' + sample], { type: 'text/csv;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a'); a.href = url; a.download = '教师信息导入模板.csv';
        document.body.appendChild(a); a.click();
        document.body.removeChild(a); URL.revokeObjectURL(url);
        Common.showMsg('模板已下载');
      },
      handleUpload(file) {
        const reader = new FileReader();
        reader.onload = (e) => { this.text = e.target.result; Common.showMsg('文件已加载'); };
        reader.readAsText(file.raw || file, 'UTF-8');
      },
      async confirmBatch() {
        const lines = this.text.split(/\r?\n/).map(l => l.trim()).filter(l => l);
        if (!lines.length) { Common.showMsg('未找到有效数据', 'warning'); return; }
        const records = []; let skipped = 0;
        lines.forEach((line, i) => {
          if (i === 0 && (line.includes('工号') || line.toLowerCase().includes('id'))) { skipped++; return; }
          const parts = line.split(/[,，]/).map(p => p.trim());
          if (parts.length < 2) { skipped++; return; }
          records.push({ id: parts[0] || '', name: parts[1] || '', gender: parts[2] || '男', college: parts[3] || '计算机学院', title: parts[4] || '讲师', major: parts[5] || '', phone: parts[6] || '', email: parts[7] || '', joinYear: 2025 });
        });
        if (!records.length) { Common.showMsg('没有可录入的数据', 'warning'); return; }
        const res = await UserService.batchAddTeachers(records);
        this.result = { show: true, added: res.added, skipped: res.skipped + skipped };
      },
      goList() { global.$app && global.$app.switchMenu('teacher-list'); }
    }
  };

  // ========== 5. 操作日志 ==========
  const PageOpLog = {
    template: `
      <div class="page-wrapper">
        <div class="page-header">
          <div>
            <div class="page-title">📋 操作日志</div>
            <div class="page-desc">查看系统中所有新增、编辑、删除、状态变更操作的历史记录</div>
          </div>
          <el-button type="warning" plain @click="clearLogs">🗑 清空日志</el-button>
        </div>

        <el-row :gutter="16" style="margin-bottom:16px">
          <el-col :span="6"><div style="background:#e8f1fb;padding:16px 20px;border-radius:10px;text-align:center">
            <div style="font-size:26px">📝</div><div style="font-size:24px;font-weight:700;color:#303133;margin:4px 0">{{ totalCount }}</div><div style="font-size:13px;color:#606266">总记录</div>
          </div></el-col>
          <el-col :span="6"><div style="background:#e6f9f7;padding:16px 20px;border-radius:10px;text-align:center">
            <div style="font-size:26px">✅</div><div style="font-size:24px;font-weight:700;color:#303133;margin:4px 0">{{ countByType('新增') }}</div><div style="font-size:13px;color:#606266">新增</div>
          </div></el-col>
          <el-col :span="6"><div style="background:#fef4e6;padding:16px 20px;border-radius:10px;text-align:center">
            <div style="font-size:26px">✏️</div><div style="font-size:24px;font-weight:700;color:#303133;margin:4px 0">{{ countByType('编辑') }}</div><div style="font-size:13px;color:#606266">编辑</div>
          </div></el-col>
          <el-col :span="6"><div style="background:#fef0f0;padding:16px 20px;border-radius:10px;text-align:center">
            <div style="font-size:26px">🔔</div><div style="font-size:24px;font-weight:700;color:#303133;margin:4px 0">{{ countByType('状态变更') }}</div><div style="font-size:13px;color:#606266">状态变更</div>
          </div></el-col>
        </el-row>

        <div class="panel">
          <div style="display:flex;gap:12px;margin-bottom:16px">
            <el-select v-model="filter.target" placeholder="全部对象" clearable style="width:130px">
              <el-option label="学生" value="学生" /><el-option label="教师" value="教师" />
            </el-select>
            <el-select v-model="filter.type" placeholder="全部操作" clearable style="width:130px">
              <el-option label="新增" value="新增" /><el-option label="编辑" value="编辑" />
              <el-option label="删除" value="删除" /><el-option label="状态变更" value="状态变更" />
              <el-option label="批量新增" value="批量新增" /><el-option label="批量状态变更" value="批量状态变更" />
            </el-select>
            <el-input v-model="filter.keyword" placeholder="搜索关键词（学号/姓名）" clearable style="width:280px" />
            <el-button @click="filter={target:'',type:'',keyword:''}">🔄 重置筛选</el-button>
          </div>
          <el-table :data="pagedLogs" border stripe style="width:100%">
            <el-table-column prop="time" label="操作时间" width="170" align="center" />
            <el-table-column prop="type" label="操作类型" width="110" align="center">
              <template #default="s">
                <el-tag size="small" :type="logTypeTag(s.row.type)">{{ s.row.type }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="target" label="对象" width="80" align="center" />
            <el-table-column prop="targetId" label="目标ID" width="110" />
            <el-table-column prop="operator" label="操作人" width="100" align="center" />
            <el-table-column prop="detail" label="详情" min-width="360" />
          </el-table>
          <div style="display:flex;justify-content:flex-end;margin-top:16px">
            <el-pagination v-model:current-page="page.current" v-model:page-size="page.size"
              :page-sizes="[10,20,30,50]" layout="total, sizes, prev, pager, next, jumper" :total="filteredLogs.length" />
          </div>
        </div>
      </div>
    `,
    data() {
      return { logs: [], filter: { target: '', type: '', keyword: '' }, page: { current: 1, size: 20 } };
    },
    computed: {
      totalCount() { return this.logs.length; },
      filteredLogs() {
        return this.logs.filter(l => {
          if (this.filter.target && l.target !== this.filter.target) return false;
          if (this.filter.type && l.type !== this.filter.type) return false;
          if (this.filter.keyword) {
            const kw = this.filter.keyword.trim();
            if (!l.detail.includes(kw) && !l.targetId.includes(kw) && !l.operator.includes(kw)) return false;
          }
          return true;
        });
      },
      pagedLogs() { const start = (this.page.current - 1) * this.page.size; return this.filteredLogs.slice(start, start + this.page.size); }
    },
    created() { this.load(); },
    methods: {
      async load() { this.logs = await UserService.getOpLogs(); },
      countByType(type) { return this.logs.filter(l => l.type === type).length; },
      logTypeTag(type) { return { '新增': 'success', '编辑': 'warning', '删除': 'danger', '状态变更': 'info', '批量新增': 'success', '批量状态变更': 'info' }[type] || 'info'; },
      async clearLogs() {
        try {
          await E.ElMessageBox.confirm('确定清空所有操作日志？此操作不可恢复', '清空确认', { type: 'warning' });
          await UserService.clearOpLogs();
          await this.load();
          Common.showMsg('日志已清空');
        } catch {}
      }
    }
  };

  global.UserPages = { PageUserStudent, PageUserStudentBatch, PageUserTeacher, PageUserTeacherBatch, PageOpLog };
})(window);
