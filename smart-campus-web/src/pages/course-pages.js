/* ============================================================
 * 课程服务 course-service - 页面组件
 * 页面：课程管理 / 教室管理 / 实验室管理 / 教学任务 / 课表查看
 * ============================================================ */
(function (global) {

  const E = ElementPlus;

  // ========== 1. 课程管理 ==========
  const PageCourseCourse = {
    template: `
      <div class="page-wrapper">
        <div class="page-header">
          <div>
            <div class="page-title">课程管理</div>
            <div class="page-desc">维护全校课程信息，包含任课教师、学分、学时、开课学院等</div>
          </div>
          <el-button type="primary" @click="openAdd">+ 新增课程</el-button>
        </div>
        <div class="panel">
          <div style="display:flex;gap:12px;margin-bottom:16px">
            <el-input v-model="filter.keyword" placeholder="课程名称/编号" clearable style="width:220px" />
            <el-select v-model="filter.college" placeholder="全部学院" clearable style="width:160px">
              <el-option v-for="c in collegeOptions" :key="c" :label="c" :value="c" />
            </el-select>
          </div>
          <el-table :data="filteredList" border stripe style="width:100%">
            <el-table-column prop="id" label="课程编号" width="110" />
            <el-table-column prop="name" label="课程名称" width="180" />
            <el-table-column prop="teacher" label="任课教师" width="100" />
            <el-table-column prop="college" label="开课学院" width="140" />
            <el-table-column prop="credit" label="学分" width="80" align="center" />
            <el-table-column prop="hours" label="学时" width="80" align="center" />
            <el-table-column prop="semester" label="学期" width="140" />
            <el-table-column prop="capacity" label="容量" width="80" align="center" />
            <el-table-column label="操作" width="180">
              <template #default="s">
                <el-button size="small" @click="openEdit(s.row)">编辑</el-button>
                <el-button size="small" type="danger" plain @click="confirmDelete(s.row)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </div>

        <el-dialog v-model="dialog.show" :title="dialog.mode==='add'?'新增课程':'编辑课程'" width="620px">
          <el-form label-width="110px">
            <el-row :gutter="16">
              <el-col :span="12"><el-form-item label="课程编号"><el-input v-model="form.id" :disabled="dialog.mode==='edit'" /></el-form-item></el-col>
              <el-col :span="12"><el-form-item label="课程名称"><el-input v-model="form.name" /></el-form-item></el-col>
              <el-col :span="12"><el-form-item label="任课教师">
                <el-select v-model="form.teacher" style="width:100%" filterable>
                  <el-option v-for="t in teachers" :key="t.id" :label="t.name" :value="t.name" />
                </el-select>
              </el-form-item></el-col>
              <el-col :span="12"><el-form-item label="开课学院">
                <el-select v-model="form.college" style="width:100%">
                  <el-option v-for="c in collegeOptions" :key="c" :label="c" :value="c" />
                </el-select>
              </el-form-item></el-col>
              <el-col :span="8"><el-form-item label="学分"><el-input-number v-model="form.credit" :min="1" :max="10" controls-position="right" style="width:100%" /></el-form-item></el-col>
              <el-col :span="8"><el-form-item label="学时"><el-input-number v-model="form.hours" :min="1" :max="200" controls-position="right" style="width:100%" /></el-form-item></el-col>
              <el-col :span="8"><el-form-item label="容量"><el-input-number v-model="form.capacity" :min="1" :max="500" controls-position="right" style="width:100%" /></el-form-item></el-col>
              <el-col :span="24"><el-form-item label="学期"><el-input v-model="form.semester" placeholder="如 2025-2026春" /></el-form-item></el-col>
            </el-row>
          </el-form>
          <template #footer>
            <el-button @click="dialog.show=false">取消</el-button>
            <el-button type="primary" @click="submit">确定</el-button>
          </template>
        </el-dialog>
      </div>
    `,
    data() {
      return {
        list: [],
        teachers: [],
        collegeOptions: UserService.collegeOptions,
        filter: { keyword: '', college: '' },
        dialog: { show: false, mode: 'add' },
        form: { id: '', name: '', teacher: '', college: '', credit: 3, hours: 48, capacity: 60, semester: '2025-2026春' }
      };
    },
    computed: {
      filteredList() {
        const kw = this.filter.keyword.trim();
        return this.list.filter(c => {
          if (kw && !c.name.includes(kw) && !c.id.includes(kw)) return false;
          if (this.filter.college && c.college !== this.filter.college) return false;
          return true;
        });
      }
    },
    created() { this.load(); },
    methods: {
      async load() {
        this.list = await CourseService.getCourses();
        this.teachers = await UserService.getTeachers();
      },
      openAdd() {
        this.dialog.mode = 'add';
        this.form = { id: '', name: '', teacher: '', college: '', credit: 3, hours: 48, capacity: 60, semester: '2025-2026春' };
        this.dialog.show = true;
      },
      openEdit(row) {
        this.dialog.mode = 'edit';
        this.form = Object.assign({}, row);
        // 根据 teacher 名称反查 teacherId
        const t = this.teachers.find(x => x.name === row.teacher);
        if (t) this.form.teacherId = t.id;
        this.dialog.show = true;
      },
      async submit() {
        if (!this.form.id || !this.form.name) { Common.showMsg('编号和名称必填', 'warning'); return; }
        const t = this.teachers.find(x => x.name === this.form.teacher);
        if (t) this.form.teacherId = t.id;
        if (this.dialog.mode === 'add') await CourseService.addCourse(this.form);
        else await CourseService.updateCourse(this.form);
        await this.load();
        this.dialog.show = false;
      },
      async confirmDelete(row) {
        try {
          await ElementPlus.ElMessageBox.confirm('确定删除【' + row.name + '】？', '删除确认', { type: 'warning' });
          await CourseService.deleteCourse(row.id);
          await this.load();
        } catch {}
      }
    }
  };

  // ========== 2. 教室管理 ==========
  const PageCourseRoom = {
    template: `
      <div class="page-wrapper">
        <div class="page-header">
          <div>
            <div class="page-title">教室管理</div>
            <div class="page-desc">管理教学楼内所有普通教室与多媒体教室</div>
          </div>
          <el-button type="primary" @click="openAdd">+ 新增教室</el-button>
        </div>
        <div class="panel">
          <div style="display:flex;gap:12px;margin-bottom:16px">
            <el-input v-model="filter.keyword" placeholder="教室名称/编号" clearable style="width:220px" />
            <el-select v-model="filter.type" placeholder="全部类型" clearable style="width:160px">
              <el-option label="多媒体教室" value="多媒体教室" />
              <el-option label="阶梯教室" value="阶梯教室" />
              <el-option label="普通教室" value="普通教室" />
            </el-select>
          </div>
          <el-table :data="filteredList" border stripe style="width:100%">
            <el-table-column prop="id" label="编号" width="110" />
            <el-table-column prop="name" label="教室名称" width="200" />
            <el-table-column prop="building" label="楼栋" width="100" align="center" />
            <el-table-column prop="floor" label="楼层" width="80" align="center" />
            <el-table-column prop="capacity" label="容量" width="80" align="center" />
            <el-table-column prop="type" label="类型" width="130" />
            <el-table-column prop="equipment" label="设备" min-width="240" />
            <el-table-column prop="status" label="状态" width="100" align="center">
              <template #default="s">
                <el-tag size="small" :type="s.row.status==='可用'?'success':'warning'">{{ s.row.status }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="180">
              <template #default="s">
                <el-button size="small" @click="openEdit(s.row)">编辑</el-button>
                <el-button size="small" type="danger" plain @click="confirmDelete(s.row)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </div>

        <el-dialog v-model="dialog.show" :title="dialog.mode==='add'?'新增教室':'编辑教室'" width="620px">
          <el-form label-width="110px">
            <el-row :gutter="16">
              <el-col :span="12"><el-form-item label="教室编号"><el-input v-model="form.id" :disabled="dialog.mode==='edit'" /></el-form-item></el-col>
              <el-col :span="12"><el-form-item label="教室名称"><el-input v-model="form.name" /></el-form-item></el-col>
              <el-col :span="8"><el-form-item label="楼栋"><el-input v-model="form.building" placeholder="如 A栋" /></el-form-item></el-col>
              <el-col :span="8"><el-form-item label="楼层"><el-input-number v-model="form.floor" :min="1" controls-position="right" style="width:100%" /></el-form-item></el-col>
              <el-col :span="8"><el-form-item label="容量"><el-input-number v-model="form.capacity" :min="1" :max="500" controls-position="right" style="width:100%" /></el-form-item></el-col>
              <el-col :span="12"><el-form-item label="类型">
                <el-select v-model="form.type" style="width:100%">
                  <el-option label="多媒体教室" value="多媒体教室" />
                  <el-option label="阶梯教室" value="阶梯教室" />
                  <el-option label="普通教室" value="普通教室" />
                </el-select>
              </el-form-item></el-col>
              <el-col :span="12"><el-form-item label="状态">
                <el-select v-model="form.status" style="width:100%">
                  <el-option label="可用" value="可用" />
                  <el-option label="维护中" value="维护中" />
                  <el-option label="停用" value="停用" />
                </el-select>
              </el-form-item></el-col>
              <el-col :span="24"><el-form-item label="设备清单"><el-input v-model="form.equipment" placeholder="多个设备用逗号分隔" /></el-form-item></el-col>
            </el-row>
          </el-form>
          <template #footer>
            <el-button @click="dialog.show=false">取消</el-button>
            <el-button type="primary" @click="submit">确定</el-button>
          </template>
        </el-dialog>
      </div>
    `,
    data() {
      return {
        list: [],
        filter: { keyword: '', type: '' },
        dialog: { show: false, mode: 'add' },
        form: { id: '', name: '', building: '', floor: 1, capacity: 60, type: '多媒体教室', equipment: '', status: '可用' }
      };
    },
    computed: {
      filteredList() {
        const kw = this.filter.keyword.trim();
        return this.list.filter(r => {
          if (kw && !r.name.includes(kw) && !r.id.includes(kw)) return false;
          if (this.filter.type && r.type !== this.filter.type) return false;
          return true;
        });
      }
    },
    created() { this.load(); },
    methods: {
      async load() { this.list = await CourseService.getRooms(); },
      openAdd() {
        this.dialog.mode = 'add';
        this.form = { id: '', name: '', building: '', floor: 1, capacity: 60, type: '多媒体教室', equipment: '', status: '可用' };
        this.dialog.show = true;
      },
      openEdit(row) { this.dialog.mode = 'edit'; this.form = Object.assign({}, row); this.dialog.show = true; },
      async submit() {
        if (!this.form.id || !this.form.name) { Common.showMsg('编号和名称必填', 'warning'); return; }
        if (this.dialog.mode === 'add') await CourseService.addRoom(this.form);
        else await CourseService.updateRoom(this.form);
        await this.load();
        this.dialog.show = false;
      },
      async confirmDelete(row) {
        try {
          await ElementPlus.ElMessageBox.confirm('确定删除【' + row.name + '】？', '删除确认', { type: 'warning' });
          await CourseService.deleteRoom(row.id);
          await this.load();
        } catch {}
      }
    }
  };

  // ========== 3. 实验室管理 ==========
  const PageCourseLab = {
    template: `
      <div class="page-wrapper">
        <div class="page-header">
          <div>
            <div class="page-title">实验室管理</div>
            <div class="page-desc">管理各学院实验楼实验室信息，包含管理员、设备、PC数量等</div>
          </div>
          <el-button type="primary" @click="openAdd">+ 新增实验室</el-button>
        </div>
        <div class="panel">
          <div style="display:flex;gap:12px;margin-bottom:16px">
            <el-input v-model="filter.keyword" placeholder="实验室名称/编号" clearable style="width:220px" />
            <el-select v-model="filter.type" placeholder="全部类型" clearable style="width:160px">
              <el-option label="计算机实验室" value="计算机实验室" />
              <el-option label="物理实验室" value="物理实验室" />
              <el-option label="化学实验室" value="化学实验室" />
              <el-option label="电子实验室" value="电子实验室" />
              <el-option label="生物实验室" value="生物实验室" />
            </el-select>
            <el-select v-model="filter.status" placeholder="全部状态" clearable style="width:140px">
              <el-option label="可用" value="可用" />
              <el-option label="维护中" value="维护中" />
              <el-option label="停用" value="停用" />
            </el-select>
          </div>
          <el-table :data="filteredList" border stripe style="width:100%">
            <el-table-column prop="id" label="实验室编号" width="130" />
            <el-table-column prop="name" label="实验室名称" width="220" />
            <el-table-column prop="building" label="所在楼栋" width="130" />
            <el-table-column prop="type" label="类型" width="130" />
            <el-table-column prop="capacity" label="容量" width="80" align="center" />
            <el-table-column prop="pcCount" label="PC数" width="80" align="center" />
            <el-table-column prop="manager" label="管理员" width="110" />
            <el-table-column prop="phone" label="联系电话" width="140" />
            <el-table-column prop="equipment" label="主要设备" min-width="240" />
            <el-table-column label="状态" width="100" align="center">
              <template #default="s">
                <el-tag size="small" :type="s.row.status==='可用'?'success':'warning'">{{ s.row.status }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="180" fixed="right">
              <template #default="s">
                <el-button size="small" @click="openEdit(s.row)">编辑</el-button>
                <el-button size="small" type="danger" plain @click="confirmDelete(s.row)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </div>

        <el-dialog v-model="dialog.show" :title="dialog.mode==='add'?'新增实验室':'编辑实验室'" width="680px">
          <el-form label-width="110px">
            <el-row :gutter="16">
              <el-col :span="12"><el-form-item label="编号"><el-input v-model="form.id" :disabled="dialog.mode==='edit'" /></el-form-item></el-col>
              <el-col :span="12"><el-form-item label="名称"><el-input v-model="form.name" /></el-form-item></el-col>
              <el-col :span="8"><el-form-item label="楼栋"><el-input v-model="form.building" /></el-form-item></el-col>
              <el-col :span="8"><el-form-item label="楼层"><el-input-number v-model="form.floor" :min="1" controls-position="right" style="width:100%" /></el-form-item></el-col>
              <el-col :span="8"><el-form-item label="容量"><el-input-number v-model="form.capacity" :min="1" :max="500" controls-position="right" style="width:100%" /></el-form-item></el-col>
              <el-col :span="12"><el-form-item label="类型">
                <el-select v-model="form.type" style="width:100%">
                  <el-option v-for="t in ['计算机实验室','物理实验室','化学实验室','电子实验室','生物实验室']" :key="t" :label="t" :value="t" />
                </el-select>
              </el-form-item></el-col>
              <el-col :span="12"><el-form-item label="PC数量"><el-input-number v-model="form.pcCount" :min="0" controls-position="right" style="width:100%" /></el-form-item></el-col>
              <el-col :span="12"><el-form-item label="管理员"><el-input v-model="form.manager" /></el-form-item></el-col>
              <el-col :span="12"><el-form-item label="联系电话"><el-input v-model="form.phone" /></el-form-item></el-col>
              <el-col :span="12"><el-form-item label="状态">
                <el-select v-model="form.status" style="width:100%">
                  <el-option label="可用" value="可用" /><el-option label="维护中" value="维护中" /><el-option label="停用" value="停用" />
                </el-select>
              </el-form-item></el-col>
              <el-col :span="24"><el-form-item label="主要设备"><el-input v-model="form.equipment" placeholder="用逗号分隔" type="textarea" :rows="2" /></el-form-item></el-col>
            </el-row>
          </el-form>
          <template #footer>
            <el-button @click="dialog.show=false">取消</el-button>
            <el-button type="primary" @click="submit">确定</el-button>
          </template>
        </el-dialog>
      </div>
    `,
    data() {
      return {
        list: [],
        filter: { keyword: '', type: '', status: '' },
        dialog: { show: false, mode: 'add' },
        form: { id: '', name: '', building: '', floor: 1, capacity: 40, type: '计算机实验室', pcCount: 40, manager: '', phone: '', equipment: '', status: '可用' }
      };
    },
    computed: {
      filteredList() {
        const kw = this.filter.keyword.trim();
        return this.list.filter(l => {
          if (kw && !l.name.includes(kw) && !l.id.includes(kw)) return false;
          if (this.filter.type && l.type !== this.filter.type) return false;
          if (this.filter.status && l.status !== this.filter.status) return false;
          return true;
        });
      }
    },
    created() { this.load(); },
    methods: {
      async load() { this.list = await CourseService.getLabs(); },
      openAdd() { this.dialog.mode = 'add'; this.form = { id: '', name: '', building: '', floor: 1, capacity: 40, type: '计算机实验室', pcCount: 40, manager: '', phone: '', equipment: '', status: '可用' }; this.dialog.show = true; },
      openEdit(row) { this.dialog.mode = 'edit'; this.form = Object.assign({}, row); this.dialog.show = true; },
      async submit() {
        if (!this.form.id || !this.form.name) { Common.showMsg('编号和名称必填', 'warning'); return; }
        if (this.dialog.mode === 'add') await CourseService.addLab(this.form);
        else await CourseService.updateLab(this.form);
        await this.load();
        this.dialog.show = false;
      },
      async confirmDelete(row) {
        try {
          await ElementPlus.ElMessageBox.confirm('确定删除【' + row.name + '】？', '删除确认', { type: 'warning' });
          await CourseService.deleteLab(row.id);
          await this.load();
        } catch {}
      }
    }
  };

  // ========== 4. 教学任务 ==========
  const PageCourseTask = {
    template: `
      <div class="page-wrapper">
        <div class="page-header">
          <div>
            <div class="page-title">教学任务</div>
            <div class="page-desc">维护所有课程的教学安排（课表）。支持手动新增、智能排课和取消任务</div>
          </div>
          <div style="display:flex;gap:10px">
            <el-button type="success" plain @click="autoArrange">🤖 一键智能排课</el-button>
            <el-button type="danger" plain @click="confirmClear">🗑 清空课表</el-button>
            <el-button type="primary" @click="openAdd">+ 新增教学任务</el-button>
          </div>
        </div>
        <div class="panel">
          <div style="display:flex;gap:12px;margin-bottom:16px">
            <el-input v-model="filter.keyword" placeholder="课程/教师/班级" clearable style="width:240px" />
            <el-select v-model="filter.day" placeholder="全部星期" clearable style="width:140px">
              <el-option v-for="(d,i) in dayNames" :key="d" :label="d" :value="i+1" />
            </el-select>
          </div>
          <el-table :data="filteredList" border stripe style="width:100%">
            <el-table-column prop="courseName" label="课程" width="160" />
            <el-table-column prop="teacherName" label="任课教师" width="110" />
            <el-table-column label="时间" width="180">
              <template #default="s">{{ dayNames[s.row.day-1] }} · {{ periodNames.find(p=>p.p===s.row.period).name }}</template>
            </el-table-column>
            <el-table-column prop="roomName" label="地点" width="220" />
            <el-table-column prop="classGroup" label="班级" width="150" />
            <el-table-column prop="week" label="周次" width="110" align="center" />
            <el-table-column label="操作" width="180">
              <template #default="s">
                <el-button size="small" @click="openEdit(s.row)">编辑</el-button>
                <el-button size="small" type="danger" plain @click="confirmDelete(s.row)">取消</el-button>
              </template>
            </el-table-column>
          </el-table>
        </div>

        <el-dialog v-model="dialog.show" :title="dialog.mode==='add'?'新增教学任务':'编辑教学任务'" width="680px">
          <el-form label-width="110px">
            <el-row :gutter="16">
              <el-col :span="24"><el-form-item label="选择课程">
                <el-select v-model="form.courseId" style="width:100%" @change="onCourseChange" filterable>
                  <el-option v-for="c in courses" :key="c.id" :label="c.id + ' - ' + c.name + ' (' + c.teacher + ')'" :value="c.id" />
                </el-select>
              </el-form-item></el-col>
              <el-col :span="8"><el-form-item label="星期">
                <el-select v-model="form.day" style="width:100%">
                  <el-option v-for="(d,i) in dayNames" :key="d" :label="d" :value="i+1" />
                </el-select>
              </el-form-item></el-col>
              <el-col :span="8"><el-form-item label="节次">
                <el-select v-model="form.period" style="width:100%">
                  <el-option v-for="p in periodNames" :key="p.p" :label="p.name + ' ' + p.time" :value="p.p" />
                </el-select>
              </el-form-item></el-col>
              <el-col :span="8"><el-form-item label="周次">
                <el-select v-model="form.week" style="width:100%" filterable allow-create>
                  <el-option v-for="w in weekOptions" :key="w" :label="w" :value="w" />
                </el-select>
              </el-form-item></el-col>
              <el-col :span="16"><el-form-item label="教室/实验室">
                <el-select v-model="form.roomId" style="width:100%" filterable>
                  <el-option-group label="普通教室">
                    <el-option v-for="r in rooms" :key="r.id" :label="r.name + ' (' + r.capacity + '人)'" :value="r.id" />
                  </el-option-group>
                  <el-option-group label="实验室">
                    <el-option v-for="l in labs" :key="l.id" :label="l.name + ' (' + l.capacity + '人)'" :value="l.id" />
                  </el-option-group>
                </el-select>
              </el-form-item></el-col>
              <el-col :span="8"><el-form-item label="班级"><el-input v-model="form.classGroup" placeholder="如 计科2025-1班" /></el-form-item></el-col>
              <el-col :span="12"><el-form-item label="颜色标签">
                <el-select v-model="form.color" style="width:100%">
                  <el-option v-for="c in colorPalette" :key="c" :label="c" :value="c">
                    <span style="display:inline-block;width:14px;height:14px;border-radius:3px;margin-right:8px;vertical-align:middle;background:var(--color-primary)" :style="{background:colorHex(c)}"></span>{{ c }}
                  </el-option>
                </el-select>
              </el-form-item></el-col>
            </el-row>
          </el-form>
          <template #footer>
            <el-button @click="dialog.show=false">取消</el-button>
            <el-button type="primary" @click="submit">确定</el-button>
          </template>
        </el-dialog>
      </div>
    `,
    data() {
      return {
        list: [], courses: [], rooms: [], labs: [],
        dayNames: CourseService.dayNames,
        periodNames: CourseService.periodNames,
        colorPalette: CourseService.colorPalette,
        filter: { keyword: '', day: '' },
        dialog: { show: false, mode: 'add' },
        weekOptions: ['1-8周','1-9周','1-10周','1-11周','1-12周','1-13周','1-14周','1-15周','1-16周','1-17周','1-18周','2-17周','3-18周','9-16周'],
        form: { id: '', courseId: '', courseName: '', teacherId: '', teacherName: '', day: 1, period: 1, roomId: '', roomName: '', classGroup: '', week: '1-16周', color: 'blue' }
      };
    },
    computed: {
      filteredList() {
        const kw = this.filter.keyword.trim();
        return this.list.filter(s => {
          if (kw && !s.courseName.includes(kw) && !s.teacherName.includes(kw) && !(s.classGroup || '').includes(kw)) return false;
          if (this.filter.day && s.day !== Number(this.filter.day)) return false;
          return true;
        });
      }
    },
    created() { this.load(); },
    methods: {
      colorHex(c) {
        return { blue: '#409eff', green: '#67c23a', orange: '#e6a23c', purple: '#8b5cf6', pink: '#ec4899' }[c] || '#409eff';
      },
      async load() {
        this.list = await CourseService.getSchedule();
        this.courses = await CourseService.getCourses();
        this.rooms = await CourseService.getRooms();
        this.labs = await CourseService.getLabs();
      },
      onCourseChange(id) {
        const course = this.courses.find(c => c.id === id);
        if (course) { this.form.courseName = course.name; this.form.teacherId = course.teacherId; this.form.teacherName = course.teacher; }
      },
      openAdd() {
        this.dialog.mode = 'add';
        this.form = { id: '', courseId: '', courseName: '', teacherId: '', teacherName: '', day: 1, period: 1, roomId: '', roomName: '', classGroup: '', week: '1-16周', color: 'blue' };
        this.dialog.show = true;
      },
      openEdit(row) {
        this.dialog.mode = 'edit';
        this.form = Object.assign({}, row);
        this.dialog.show = true;
      },
      async submit() {
        if (!this.form.courseId || !this.form.roomId) { Common.showMsg('请选择课程和地点', 'warning'); return; }
        const place = [...this.rooms, ...this.labs].find(p => p.id === this.form.roomId);
        if (place) this.form.roomName = place.name;
        if (this.dialog.mode === 'add') await CourseService.addScheduleItem(this.form);
        else await CourseService.updateScheduleItem(this.form);
        await this.load();
        this.dialog.show = false;
      },
      async confirmDelete(row) {
        try {
          await ElementPlus.ElMessageBox.confirm('确定取消【' + row.courseName + '】？', '确认', { type: 'warning' });
          await CourseService.deleteScheduleItem(row.id);
          await this.load();
        } catch {}
      },
      async autoArrange() { CourseService.autoArrange(); await this.load(); },
      async confirmClear() {
        try {
          await ElementPlus.ElMessageBox.confirm('将清空所有排课，确认继续？', '确认', { type: 'warning' });
          CourseService.clearSchedule();
          await this.load();
        } catch {}
      }
    }
  };

  // ========== 5. 课表查看 ==========
  const PageCourseSchedule = {
    template: `
      <div class="page-wrapper">
        <div class="page-header">
          <div>
            <div class="page-title">课表查看</div>
            <div class="page-desc">可视化查看一周所有时段的课程安排</div>
          </div>
          <div style="display:flex;gap:10px;align-items:center">
            <el-radio-group v-model="viewMode" size="small">
              <el-radio-button label="grid">表格视图</el-radio-button>
              <el-radio-button label="list">列表视图</el-radio-button>
            </el-radio-group>
            <el-tag effect="plain" type="info">共 {{ list.length }} 条排课</el-tag>
          </div>
        </div>

        <div v-if="viewMode==='grid'" class="panel">
          <table class="schedule-table" style="width:100%;border-collapse:separate;border-spacing:1px;background:#ebeef5;border-radius:8px;overflow:hidden">
            <thead>
              <tr>
                <th style="background:#f5f8fb;padding:14px 8px;width:140px;font-weight:600;color:#303133">时间</th>
                <th v-for="d in dayNames" :key="d" style="background:#f5f8fb;padding:14px 8px;font-weight:600;color:#303133">{{ d }}</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="p in periodNames" :key="p.p">
                <td style="background:#fff;padding:12px 8px;text-align:center">
                  <div style="font-weight:600;color:#3a7bd5">{{ p.name }}</div>
                  <div style="font-size:12px;color:#909399;margin-top:4px">{{ p.time }}</div>
                </td>
                <td v-for="(d,di) in dayNames" :key="d" style="background:#fff;padding:6px;vertical-align:top">
                  <div v-for="item in itemsAt(di+1, p.p)" :key="item.id"
                       @click="showDetail(item)"
                       style="padding:10px 12px;border-radius:8px;margin-bottom:6px;cursor:pointer;transition:all 0.2s"
                       :style="{background:colorBg(item.color), color:colorText(item.color), borderLeft: '3px solid ' + colorHex(item.color)}">
                    <div style="font-weight:600;font-size:13px">{{ item.courseName }}</div>
                    <div style="font-size:12px;opacity:.85;margin-top:4px">👨‍🏫 {{ item.teacherName }}</div>
                    <div style="font-size:12px;opacity:.85">📍 {{ item.roomName }}</div>
                    <div style="font-size:11px;opacity:.7;margin-top:3px">{{ item.classGroup }} · {{ item.week }}</div>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div v-else class="panel">
          <el-table :data="sortedList" border stripe style="width:100%">
            <el-table-column label="星期" width="100">
              <template #default="s"><el-tag size="small" type="primary" effect="plain">{{ dayNames[s.row.day-1] }}</el-tag></template>
            </el-table-column>
            <el-table-column label="节次" width="120">
              <template #default="s">{{ periodNames.find(p=>p.p===s.row.period).name }}</template>
            </el-table-column>
            <el-table-column prop="courseName" label="课程" width="160" />
            <el-table-column prop="teacherName" label="教师" width="100" />
            <el-table-column prop="roomName" label="地点" min-width="220" />
            <el-table-column prop="classGroup" label="班级" width="150" />
            <el-table-column prop="week" label="周次" width="110" align="center" />
          </el-table>
        </div>
      </div>
    `,
    data() {
      return {
        list: [],
        dayNames: CourseService.dayNames,
        periodNames: CourseService.periodNames,
        viewMode: 'grid'
      };
    },
    computed: {
      sortedList() { return [...this.list].sort((a, b) => a.day - b.day || a.period - b.period); }
    },
    created() { this.load(); },
    methods: {
      async load() { this.list = await CourseService.getSchedule(); },
      itemsAt(day, period) { return this.list.filter(s => s.day === day && s.period === period); },
      colorHex(c) { return { blue: '#409eff', green: '#67c23a', orange: '#e6a23c', purple: '#8b5cf6', pink: '#ec4899' }[c] || '#409eff'; },
      colorBg(c) {
        const map = { blue: '#ecf5ff', green: '#f0f9eb', orange: '#fdf6ec', purple: '#f5f0ff', pink: '#fef0f5' };
        return map[c] || '#ecf5ff';
      },
      colorText(c) {
        const map = { blue: '#2d69b3', green: '#4a8a2b', orange: '#b8821a', purple: '#6b4aa0', pink: '#b8447a' };
        return map[c] || '#303133';
      },
      showDetail(item) {
        ElementPlus.ElMessageBox.alert(
          '课程：' + item.courseName + '\n教师：' + item.teacherName + '\n地点：' + item.roomName + '\n时间：' + CourseService.dayNames[item.day-1] + ' ' + CourseService.periodNames.find(p=>p.p===item.period).name + '\n班级：' + item.classGroup + '\n周次：' + item.week,
          '课程详情', { type: 'info' }
        );
      }
    }
  };

  global.CoursePages = { PageCourseCourse, PageCourseRoom, PageCourseLab, PageCourseTask, PageCourseSchedule };
})(window);
