/* ============================================================
 * 页面组件集合（学生管理 / 教师管理 / 课程排课 / 成绩管理）
 * 每个导出项是 Vue 选项式组件，由 app.js 调用 app.component() 注册
 * ============================================================ */
(function (global) {
  const { ElMessage, ElMessageBox } = ElementPlus;

  // ========== 学生管理页 ==========
  const PageStudent = {
    template: `
      <div class="page-wrapper">
        <div class="page-header">
          <div>
            <div class="page-title">学生信息管理</div>
            <div class="page-desc">管理在校学生的基础信息，支持新增、修改、删除与批量录入</div>
          </div>
          <div class="page-actions">
            <el-button type="primary" @click="openAdd">+ 新增学生</el-button>
            <el-button type="success" plain @click="goBatch">批量录入</el-button>
            <el-button plain @click="resetData">重置为示例数据</el-button>
          </div>
        </div>

        <div class="filter-bar">
          <div class="filter-form">
            <el-input v-model="filter.keyword" placeholder="学号 / 姓名 / 电话" clearable style="width: 220px" :prefix-icon="SearchIcon" />
            <el-select v-model="filter.college" placeholder="全部学院" clearable style="width: 160px">
              <el-option v-for="c in collegeOptions" :key="c" :label="c" :value="c" />
            </el-select>
            <el-select v-model="filter.grade" placeholder="全部年级" clearable style="width: 140px">
              <el-option v-for="g in gradeOptions" :key="g" :label="g" :value="g" />
            </el-select>
            <el-select v-model="filter.gender" placeholder="性别" clearable style="width: 120px">
              <el-option label="男" value="男" />
              <el-option label="女" value="女" />
            </el-select>
            <el-button type="primary" @click="() => {}">筛选</el-button>
          </div>
        </div>

        <div class="table-card">
          <el-table :data="pagedList" border stripe style="width: 100%">
            <el-table-column prop="id" label="学号" width="110" />
            <el-table-column prop="name" label="姓名" width="100" />
            <el-table-column prop="gender" label="性别" width="70" align="center">
              <template #default="s">
                <el-tag :type="s.row.gender === '男' ? 'primary' : 'danger'" size="small" effect="plain">{{ s.row.gender }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="birth" label="出生日期" width="120" />
            <el-table-column prop="college" label="学院" width="130" />
            <el-table-column prop="major" label="专业" width="170" />
            <el-table-column prop="grade" label="年级" width="80" align="center" />
            <el-table-column prop="dorm" label="宿舍" width="120" />
            <el-table-column prop="phone" label="联系电话" width="140" />
            <el-table-column prop="createAt" label="建档日期" width="120" />
            <el-table-column label="操作" width="180" fixed="right">
              <template #default="s">
                <el-button size="small" @click="openEdit(s.row)">编辑</el-button>
                <el-button size="small" type="danger" plain @click="confirmDelete(s.row)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>

          <div class="pagination-area">
            <el-pagination
              v-model:current-page="page.current"
              v-model:page-size="page.size"
              :page-sizes="[10, 20, 30, 50]"
              layout="total, sizes, prev, pager, next, jumper"
              :total="filteredList.length" />
          </div>
        </div>

        <!-- 新增/编辑 对话框 -->
        <el-dialog v-model="dialog.show" :title="dialog.mode === 'add' ? '新增学生' : '编辑学生'" width="620px">
          <el-form :model="form" label-width="100px">
            <el-row :gutter="16">
              <el-col :span="12"><el-form-item label="学号"><el-input v-model="form.id" :disabled="dialog.mode==='edit'" placeholder="如 2025011" /></el-form-item></el-col>
              <el-col :span="12"><el-form-item label="姓名"><el-input v-model="form.name" placeholder="请输入姓名" /></el-form-item></el-col>
              <el-col :span="12"><el-form-item label="性别">
                <el-radio-group v-model="form.gender">
                  <el-radio value="男">男</el-radio><el-radio value="女">女</el-radio>
                </el-radio-group>
              </el-form-item></el-col>
              <el-col :span="12"><el-form-item label="出生日期"><el-date-picker v-model="form.birth" value-format="YYYY-MM-DD" type="date" style="width: 100%" /></el-form-item></el-col>
              <el-col :span="12"><el-form-item label="学院">
                <el-select v-model="form.college" style="width:100%"><el-option v-for="c in collegeOptions" :key="c" :label="c" :value="c" /></el-select>
              </el-form-item></el-col>
              <el-col :span="12"><el-form-item label="专业"><el-input v-model="form.major" /></el-form-item></el-col>
              <el-col :span="12"><el-form-item label="年级">
                <el-select v-model="form.grade" style="width:100%"><el-option v-for="g in gradeOptions" :key="g" :label="g" :value="g" /></el-select>
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
        SearchIcon: ElementPlusIconsVue.Search,
        filter: { keyword: '', college: '', grade: '', gender: '' },
        page: { current: 1, size: 10 },
        list: [],
        dialog: { show: false, mode: 'add' },
        form: this.emptyForm()
      };
    },
    computed: {
      collegeOptions() { return UserService.collegeOptions; },
      gradeOptions() { return UserService.gradeOptions; },
      filteredList() {
        const kw = this.filter.keyword.trim();
        return this.list.filter(s => {
          if (kw && !s.id.includes(kw) && !s.name.includes(kw) && !(s.phone || '').includes(kw)) return false;
          if (this.filter.college && s.college !== this.filter.college) return false;
          if (this.filter.grade && s.grade !== this.filter.grade) return false;
          if (this.filter.gender && s.gender !== this.filter.gender) return false;
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
      load() { this.list = UserService.getStudents(); },
      emptyForm() { return { id: '', name: '', gender: '男', birth: '', college: '', major: '', grade: '大一', dorm: '', phone: '' }; },
      openAdd() {
        this.dialog.mode = 'add';
        this.form = this.emptyForm();
        this.dialog.show = true;
      },
      openEdit(row) {
        this.dialog.mode = 'edit';
        this.form = Object.assign({}, row);
        this.dialog.show = true;
      },
      submitForm() {
        if (!this.form.id || !this.form.name) {
          Common.showMsg('学号和姓名不能为空', 'warning'); return;
        }
        if (this.dialog.mode === 'add') UserService.addStudent(this.form);
        else UserService.updateStudent(this.form);
        this.load();
        this.dialog.show = false;
      },
      confirmDelete(row) {
        ElementPlus.ElMessageBox.confirm('确定要删除学生【' + row.name + '】吗？', '删除确认', { type: 'warning' })
          .then(() => { UserService.deleteStudent(row.id); this.load(); })
          .catch(() => {});
      },
      goBatch() {
        // 通过事件总线切换菜单到 student-batch
        global.$app && global.$app.switchMenu && global.$app.switchMenu('student-batch');
      },
      resetData() {
        ElementPlus.ElMessageBox.confirm('将清空当前学生数据并恢复为示例数据，确定吗？', '重置确认', { type: 'warning' })
          .then(() => {
            localStorage.removeItem('students');
            this.load();
            Common.showMsg('学生数据已重置');
          }).catch(() => {});
      }
    }
  };

  // ========== 教师管理页 ==========
  const PageTeacher = {
    template: `
      <div class="page-wrapper">
        <div class="page-header">
          <div>
            <div class="page-title">教师信息管理</div>
            <div class="page-desc">管理教职工基础信息、职称与学院归属</div>
          </div>
          <div class="page-actions">
            <el-button type="primary" @click="openAdd">+ 新增教师</el-button>
            <el-button type="success" plain @click="goBatch">批量录入</el-button>
            <el-button plain @click="resetData">重置为示例数据</el-button>
          </div>
        </div>

        <div class="filter-bar">
          <div class="filter-form">
            <el-input v-model="filter.keyword" placeholder="工号 / 姓名 / 电话" clearable style="width: 220px" />
            <el-select v-model="filter.college" placeholder="全部学院" clearable style="width: 160px">
              <el-option v-for="c in collegeOptions" :key="c" :label="c" :value="c" />
            </el-select>
            <el-select v-model="filter.title" placeholder="全部职称" clearable style="width: 140px">
              <el-option v-for="t in titleOptions" :key="t" :label="t" :value="t" />
            </el-select>
          </div>
        </div>

        <div class="table-card">
          <el-table :data="pagedList" border stripe style="width: 100%">
            <el-table-column prop="id" label="工号" width="110" />
            <el-table-column prop="name" label="姓名" width="100" />
            <el-table-column prop="gender" label="性别" width="70" align="center" />
            <el-table-column prop="college" label="学院" width="140" />
            <el-table-column prop="title" label="职称" width="110" />
            <el-table-column prop="major" label="专业方向" width="160" />
            <el-table-column prop="phone" label="电话" width="140" />
            <el-table-column prop="email" label="邮箱" width="180" />
            <el-table-column prop="joinYear" label="入职年份" width="100" align="center" />
            <el-table-column label="操作" width="170" fixed="right">
              <template #default="s">
                <el-button size="small" @click="openEdit(s.row)">编辑</el-button>
                <el-button size="small" type="danger" plain @click="confirmDelete(s.row)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>

          <div class="pagination-area">
            <el-pagination
              v-model:current-page="page.current"
              v-model:page-size="page.size"
              :page-sizes="[10, 20, 30, 50]"
              layout="total, sizes, prev, pager, next, jumper"
              :total="filteredList.length" />
          </div>
        </div>

        <el-dialog v-model="dialog.show" :title="dialog.mode === 'add' ? '新增教师' : '编辑教师'" width="620px">
          <el-form :model="form" label-width="100px">
            <el-row :gutter="16">
              <el-col :span="12"><el-form-item label="工号"><el-input v-model="form.id" :disabled="dialog.mode==='edit'" /></el-form-item></el-col>
              <el-col :span="12"><el-form-item label="姓名"><el-input v-model="form.name" /></el-form-item></el-col>
              <el-col :span="12"><el-form-item label="性别">
                <el-radio-group v-model="form.gender"><el-radio value="男">男</el-radio><el-radio value="女">女</el-radio></el-radio-group>
              </el-form-item></el-col>
              <el-col :span="12"><el-form-item label="职称">
                <el-select v-model="form.title" style="width:100%"><el-option v-for="t in titleOptions" :key="t" :label="t" :value="t" /></el-select>
              </el-form-item></el-col>
              <el-col :span="12"><el-form-item label="学院">
                <el-select v-model="form.college" style="width:100%"><el-option v-for="c in collegeOptions" :key="c" :label="c" :value="c" /></el-select>
              </el-form-item></el-col>
              <el-col :span="12"><el-form-item label="专业方向"><el-input v-model="form.major" /></el-form-item></el-col>
              <el-col :span="12"><el-form-item label="电话"><el-input v-model="form.phone" /></el-form-item></el-col>
              <el-col :span="12"><el-form-item label="邮箱"><el-input v-model="form.email" /></el-form-item></el-col>
              <el-col :span="12"><el-form-item label="入职年份"><el-input v-model.number="form.joinYear" placeholder="如 2020" /></el-form-item></el-col>
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
        filter: { keyword: '', college: '', title: '' },
        page: { current: 1, size: 10 },
        list: [],
        dialog: { show: false, mode: 'add' },
        form: this.emptyForm()
      };
    },
    computed: {
      collegeOptions() { return UserService.collegeOptions; },
      titleOptions() { return UserService.titleOptions; },
      filteredList() {
        const kw = this.filter.keyword.trim();
        return this.list.filter(t => {
          if (kw && !t.id.includes(kw) && !t.name.includes(kw) && !(t.phone || '').includes(kw)) return false;
          if (this.filter.college && t.college !== this.filter.college) return false;
          if (this.filter.title && t.title !== this.filter.title) return false;
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
      load() { this.list = UserService.getTeachers(); },
      emptyForm() { return { id: '', name: '', gender: '男', college: '', title: '讲师', major: '', phone: '', email: '', joinYear: 2025 }; },
      openAdd() { this.dialog.mode = 'add'; this.form = this.emptyForm(); this.dialog.show = true; },
      openEdit(row) { this.dialog.mode = 'edit'; this.form = Object.assign({}, row); this.dialog.show = true; },
      submitForm() {
        if (!this.form.id || !this.form.name) { Common.showMsg('工号和姓名不能为空', 'warning'); return; }
        if (this.dialog.mode === 'add') UserService.addTeacher(this.form);
        else UserService.updateTeacher(this.form);
        this.load(); this.dialog.show = false;
      },
      confirmDelete(row) {
        ElementPlus.ElMessageBox.confirm('确定要删除教师【' + row.name + '】吗？', '删除确认', { type: 'warning' })
          .then(() => { UserService.deleteTeacher(row.id); this.load(); }).catch(() => {});
      },
      goBatch() { global.$app && global.$app.switchMenu && global.$app.switchMenu('teacher-batch'); },
      resetData() {
        ElementPlus.ElMessageBox.confirm('将清空当前教师数据并恢复为示例数据，确定吗？', '重置确认', { type: 'warning' })
          .then(() => { localStorage.removeItem('teachers'); this.load(); Common.showMsg('教师数据已重置'); }).catch(() => {});
      }
    }
  };

  // ========== 课程排课页（核心） ==========
  const PageCourse = {
    template: `
      <div class="page-wrapper">
        <div class="page-header">
          <div>
            <div class="page-title">智能课程排课</div>
            <div class="page-desc">管理课程、教室资源，并完成教学任务安排</div>
          </div>
          <div class="page-actions">
            <el-button type="primary" @click="activeTab='schedule'">📅 查看课表</el-button>
            <el-button type="success" plain @click="activeTab='courses'">📚 课程库</el-button>
            <el-button type="warning" plain @click="activeTab='rooms'">🏢 教室库</el-button>
          </div>
        </div>

        <el-tabs v-model="activeTab">
          <!-- 课表视图 -->
          <el-tab-pane label="课表视图" name="schedule">
            <div class="filter-bar">
              <div class="filter-form">
                <el-button type="primary" @click="openArrangeDialog">+ 手动排课</el-button>
                <el-button type="success" @click="autoArrange">🤖 一键智能排课</el-button>
                <el-button type="danger" plain @click="confirmClear">🗑 清空全部课表</el-button>
                <el-button plain @click="loadSchedule">🔄 刷新</el-button>
                <el-tag type="info" effect="plain">当前共 {{ scheduleList.length }} 条排课</el-tag>
              </div>
            </div>

            <div class="table-card">
              <table class="schedule-table">
                <thead>
                  <tr>
                    <th style="width: 110px">时间</th>
                    <th v-for="d in dayNames" :key="d">{{ d }}</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="p in periodNames" :key="p.p">
                    <td style="background:#f5f8fb;font-weight:600">
                      <div>{{ p.name }}</div>
                      <div style="font-size:11px;color:#909399;font-weight:normal">{{ p.time }}</div>
                    </td>
                    <td v-for="(d, di) in dayNames" :key="d" style="vertical-align: top">
                      <div v-for="item in itemsAt(di + 1, p.p)" :key="item.id"
                           :class="'schedule-cell course-' + item.color"
                           @click="showItemDetail(item)"
                           style="margin:4px 0;padding:8px 10px;border-radius:6px;cursor:pointer;font-size:12px;line-height:1.5">
                        <div style="font-weight:600;font-size:13px">{{ item.courseName }}</div>
                        <div style="opacity:0.85">👨‍🏫 {{ item.teacherName }}</div>
                        <div style="opacity:0.85">📍 {{ item.roomName }}</div>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <el-divider content-position="left">已安排的教学任务列表</el-divider>

            <div class="table-card">
              <el-table :data="scheduleList" border stripe style="width:100%">
                <el-table-column prop="courseName" label="课程" width="160" />
                <el-table-column prop="teacherName" label="任课教师" width="120" />
                <el-table-column label="时间" width="160">
                  <template #default="s">{{ dayNames[s.row.day - 1] }} · {{ periodNames.find(p=>p.p===s.row.period).name }}</template>
                </el-table-column>
                <el-table-column prop="roomName" label="教室" width="160" />
                <el-table-column label="操作" width="110">
                  <template #default="s">
                    <el-button size="small" type="danger" plain @click="deleteItem(s.row)">取消</el-button>
                  </template>
                </el-table-column>
              </el-table>
            </div>
          </el-tab-pane>

          <!-- 课程库 -->
          <el-tab-pane label="课程库" name="courses">
            <div class="filter-bar">
              <div class="filter-form">
                <el-input v-model="courseKeyword" placeholder="课程名称 / 编号" clearable style="width:220px" />
                <el-button type="primary" @click="openCourseDialog">+ 新增课程</el-button>
              </div>
            </div>
            <div class="table-card">
              <el-table :data="filteredCourses" border stripe style="width:100%">
                <el-table-column prop="id" label="课程编号" width="120" />
                <el-table-column prop="name" label="课程名称" width="180" />
                <el-table-column prop="teacher" label="任课教师" width="120" />
                <el-table-column prop="credit" label="学分" width="80" align="center" />
                <el-table-column prop="hours" label="学时" width="80" align="center" />
                <el-table-column prop="college" label="开课学院" width="140" />
                <el-table-column prop="semester" label="学期" width="140" />
                <el-table-column label="操作" width="170">
                  <template #default="s">
                    <el-button size="small" @click="openCourseDialog(s.row)">编辑</el-button>
                    <el-button size="small" type="danger" plain @click="deleteCourse(s.row)">删除</el-button>
                  </template>
                </el-table-column>
              </el-table>
            </div>
          </el-tab-pane>

          <!-- 教室库 -->
          <el-tab-pane label="教室库" name="rooms">
            <div class="filter-bar">
              <div class="filter-form">
                <el-button type="primary" @click="openRoomDialog">+ 新增教室</el-button>
              </div>
            </div>
            <div class="table-card">
              <el-table :data="roomList" border stripe style="width:100%">
                <el-table-column prop="id" label="教室编号" width="120" />
                <el-table-column prop="name" label="教室名称" width="180" />
                <el-table-column prop="building" label="楼栋" width="100" />
                <el-table-column prop="capacity" label="容量" width="80" align="center" />
                <el-table-column prop="type" label="类型" width="140" />
                <el-table-column label="操作" width="120">
                  <template #default="s">
                    <el-button size="small" type="danger" plain @click="deleteRoom(s.row)">删除</el-button>
                  </template>
                </el-table-column>
              </el-table>
            </div>
          </el-tab-pane>
        </el-tabs>

        <!-- 手动排课对话框 -->
        <el-dialog v-model="arrangeDialog.show" title="手动排课" width="560px">
          <el-form :model="arrangeForm" label-width="100px">
            <el-form-item label="选择课程">
              <el-select v-model="arrangeForm.courseId" style="width:100%" @change="onCourseChange">
                <el-option v-for="c in courseList" :key="c.id" :label="c.name + ' - ' + c.teacher" :value="c.id" />
              </el-select>
            </el-form-item>
            <el-row :gutter="16">
              <el-col :span="12">
                <el-form-item label="星期">
                  <el-select v-model="arrangeForm.day" style="width:100%">
                    <el-option v-for="(d, i) in dayNames" :key="d" :label="d" :value="i+1" />
                  </el-select>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="时段">
                  <el-select v-model="arrangeForm.period" style="width:100%">
                    <el-option v-for="p in periodNames" :key="p.p" :label="p.name" :value="p.p" />
                  </el-select>
                </el-form-item>
              </el-col>
            </el-row>
            <el-form-item label="选择教室">
              <el-select v-model="arrangeForm.roomId" style="width:100%">
                <el-option v-for="r in roomList" :key="r.id" :label="r.name + '(' + r.capacity + '人)'" :value="r.id" />
              </el-select>
            </el-form-item>
          </el-form>
          <template #footer>
            <el-button @click="arrangeDialog.show=false">取消</el-button>
            <el-button type="primary" @click="submitArrange">确定排课</el-button>
          </template>
        </el-dialog>

        <!-- 课程对话框 -->
        <el-dialog v-model="courseDialog.show" :title="courseDialog.mode==='add'?'新增课程':'编辑课程'" width="600px">
          <el-form :model="courseForm" label-width="100px">
            <el-row :gutter="16">
              <el-col :span="12"><el-form-item label="课程编号"><el-input v-model="courseForm.id" :disabled="courseDialog.mode==='edit'" /></el-form-item></el-col>
              <el-col :span="12"><el-form-item label="课程名称"><el-input v-model="courseForm.name" /></el-form-item></el-col>
              <el-col :span="12"><el-form-item label="任课教师">
                <el-select v-model="courseForm.teacherId" style="width:100%" @change="onTeacherChange">
                  <el-option v-for="t in teacherList" :key="t.id" :label="t.name" :value="t.id" />
                </el-select>
              </el-form-item></el-col>
              <el-col :span="6"><el-form-item label="学分"><el-input-number v-model.number="courseForm.credit" :min="1" :max="10" style="width:100%" /></el-form-item></el-col>
              <el-col :span="6"><el-form-item label="学时"><el-input-number v-model.number="courseForm.hours" :min="1" :max="200" style="width:100%" /></el-form-item></el-col>
              <el-col :span="12"><el-form-item label="开课学院">
                <el-select v-model="courseForm.college" style="width:100%">
                  <el-option v-for="c in collegeOptions" :key="c" :label="c" :value="c" />
                </el-select>
              </el-form-item></el-col>
              <el-col :span="12"><el-form-item label="学期"><el-input v-model="courseForm.semester" placeholder="如 2025-2026春" /></el-form-item></el-col>
            </el-row>
          </el-form>
          <template #footer>
            <el-button @click="courseDialog.show=false">取消</el-button>
            <el-button type="primary" @click="submitCourse">确定</el-button>
          </template>
        </el-dialog>

        <!-- 教室对话框 -->
        <el-dialog v-model="roomDialog.show" title="新增教室" width="520px">
          <el-form :model="roomForm" label-width="100px">
            <el-row :gutter="16">
              <el-col :span="12"><el-form-item label="教室编号"><el-input v-model="roomForm.id" /></el-form-item></el-col>
              <el-col :span="12"><el-form-item label="教室名称"><el-input v-model="roomForm.name" /></el-form-item></el-col>
              <el-col :span="12"><el-form-item label="楼栋"><el-input v-model="roomForm.building" /></el-form-item></el-col>
              <el-col :span="12"><el-form-item label="容量"><el-input-number v-model.number="roomForm.capacity" :min="1" style="width:100%" /></el-form-item></el-col>
              <el-col :span="12"><el-form-item label="类型">
                <el-select v-model="roomForm.type" style="width:100%">
                  <el-option label="多媒体教室" value="多媒体教室" />
                  <el-option label="阶梯教室" value="阶梯教室" />
                  <el-option label="计算机实验室" value="计算机实验室" />
                  <el-option label="物理实验室" value="物理实验室" />
                  <el-option label="普通教室" value="普通教室" />
                </el-select>
              </el-form-item></el-col>
            </el-row>
          </el-form>
          <template #footer>
            <el-button @click="roomDialog.show=false">取消</el-button>
            <el-button type="primary" @click="submitRoom">确定</el-button>
          </template>
        </el-dialog>
      </div>
    `,
    data() {
      return {
        activeTab: 'schedule',
        scheduleList: [],
        courseList: [],
        teacherList: [],
        roomList: [],
        courseKeyword: '',
        arrangeDialog: { show: false },
        arrangeForm: { courseId: '', day: 1, period: 1, roomId: '' },
        courseDialog: { show: false, mode: 'add' },
        courseForm: { id: '', name: '', teacherId: '', teacher: '', credit: 3, hours: 48, college: '', semester: '2025-2026春', capacity: 60 },
        roomDialog: { show: false },
        roomForm: { id: '', name: '', building: '', capacity: 60, type: '多媒体教室' }
      };
    },
    computed: {
      dayNames() { return CourseService.dayNames; },
      periodNames() { return CourseService.periodNames; },
      collegeOptions() { return UserService.collegeOptions; },
      filteredCourses() {
        const kw = this.courseKeyword.trim();
        if (!kw) return this.courseList;
        return this.courseList.filter(c => c.name.includes(kw) || c.id.includes(kw));
      }
    },
    created() { this.loadAll(); },
    methods: {
      loadAll() {
        this.teacherList = UserService.getTeachers();
        this.courseList = CourseService.getCourses();
        this.roomList = CourseService.getRooms();
        this.loadSchedule();
      },
      loadSchedule() { this.scheduleList = CourseService.getSchedule(); },
      itemsAt(day, period) { return this.scheduleList.filter(s => s.day === day && s.period === period); },
      showItemDetail(item) {
        ElementPlus.ElMessageBox.alert(
          '课程：' + item.courseName + '\n教师：' + item.teacherName + '\n教室：' + item.roomName + '\n时间：' + this.dayNames[item.day - 1] + ' 第' + item.period + '大节',
          '课程详情', { type: 'info' }
        );
      },
      openArrangeDialog() {
        this.arrangeForm = { courseId: this.courseList[0]?.id || '', day: 1, period: 1, roomId: this.roomList[0]?.id || '' };
        this.arrangeDialog.show = true;
      },
      onCourseChange(courseId) {
        const c = this.courseList.find(x => x.id === courseId);
        if (c) this.arrangeForm.courseName = c.name;
      },
      submitArrange() {
        if (!this.arrangeForm.courseId || !this.arrangeForm.roomId) {
          Common.showMsg('请选择课程和教室', 'warning'); return;
        }
        const course = this.courseList.find(c => c.id === this.arrangeForm.courseId);
        const room = this.roomList.find(r => r.id === this.arrangeForm.roomId);
        const item = {
          courseId: course.id, courseName: course.name,
          day: this.arrangeForm.day, period: this.arrangeForm.period,
          roomId: room.id, roomName: room.name,
          teacherId: course.teacherId, teacherName: course.teacher,
          color: CourseService.colorPalette[Math.floor(Math.random() * CourseService.colorPalette.length)]
        };
        if (CourseService.addScheduleItem(item)) {
          this.loadSchedule();
          this.arrangeDialog.show = false;
        }
      },
      deleteItem(row) {
        ElementPlus.ElMessageBox.confirm('确定取消该排课吗？', '确认', { type: 'warning' })
          .then(() => { CourseService.deleteScheduleItem(row.id); this.loadSchedule(); }).catch(() => {});
      },
      autoArrange() {
        ElementPlus.ElMessageBox.confirm('将根据当前课程与教师信息自动生成课表，可能覆盖部分时段，确定继续？', '智能排课', { type: 'info' })
          .then(() => { CourseService.autoArrange(); this.loadSchedule(); }).catch(() => {});
      },
      confirmClear() {
        ElementPlus.ElMessageBox.confirm('将清空所有已排课程，确定吗？', '确认', { type: 'warning' })
          .then(() => { CourseService.clearSchedule(); this.loadSchedule(); }).catch(() => {});
      },

      // 课程 CRUD
      openCourseDialog(row) {
        if (row) {
          this.courseDialog.mode = 'edit';
          this.courseForm = Object.assign({}, row);
        } else {
          this.courseDialog.mode = 'add';
          this.courseForm = { id: '', name: '', teacherId: (this.teacherList[0] || {}).id || '', teacher: (this.teacherList[0] || {}).name || '', credit: 3, hours: 48, college: '', semester: '2025-2026春', capacity: 60 };
        }
        this.courseDialog.show = true;
      },
      onTeacherChange(id) {
        const t = this.teacherList.find(x => x.id === id);
        if (t) this.courseForm.teacher = t.name;
      },
      submitCourse() {
        if (!this.courseForm.id || !this.courseForm.name) { Common.showMsg('课程编号和名称不能为空', 'warning'); return; }
        if (this.courseDialog.mode === 'add') CourseService.addCourse(this.courseForm);
        else CourseService.updateCourse(this.courseForm);
        this.courseList = CourseService.getCourses();
        this.courseDialog.show = false;
      },
      deleteCourse(row) {
        ElementPlus.ElMessageBox.confirm('删除课程将同时移除相关排课，确定吗？', '确认', { type: 'warning' })
          .then(() => { CourseService.deleteCourse(row.id); this.loadAll(); }).catch(() => {});
      },

      // 教室 CRUD
      openRoomDialog() {
        this.roomForm = { id: '', name: '', building: '', capacity: 60, type: '多媒体教室' };
        this.roomDialog.show = true;
      },
      submitRoom() {
        if (!this.roomForm.id || !this.roomForm.name) { Common.showMsg('请填写教室编号和名称', 'warning'); return; }
        CourseService.addRoom(this.roomForm);
        this.roomList = CourseService.getRooms();
        this.roomDialog.show = false;
      },
      deleteRoom(row) {
        ElementPlus.ElMessageBox.confirm('确定删除教室【' + row.name + '】吗？', '确认', { type: 'warning' })
          .then(() => { CourseService.deleteRoom(row.id); this.roomList = CourseService.getRooms(); }).catch(() => {});
      }
    }
  };

  // ========== 成绩管理页 ==========
  const PageScore = {
    template: `
      <div class="page-wrapper">
        <div class="page-header">
          <div>
            <div class="page-title">学生成绩管理</div>
            <div class="page-desc">录入、查询与统计分析学生学业成绩</div>
          </div>
          <div class="page-actions">
            <el-button type="primary" @click="openAdd">+ 录入成绩</el-button>
          </div>
        </div>

        <el-tabs v-model="activeTab">
          <el-tab-pane label="成绩查询" name="list">
            <div class="filter-bar">
              <div class="filter-form">
                <el-input v-model="filter.keyword" placeholder="学号 / 姓名" clearable style="width:200px" />
                <el-select v-model="filter.course" placeholder="全部课程" clearable style="width:180px">
                  <el-option v-for="c in courseOptions" :key="c" :label="c" :value="c" />
                </el-select>
                <el-select v-model="filter.range" placeholder="分数段" clearable style="width:140px">
                  <el-option label="优秀 (90-100)" value="excellent" />
                  <el-option label="良好 (80-89)" value="good" />
                  <el-option label="中等 (70-79)" value="medium" />
                  <el-option label="及格 (60-69)" value="pass" />
                  <el-option label="不及格 (0-59)" value="fail" />
                </el-select>
                <el-button type="primary" @click="()=>{}">筛选</el-button>
              </div>
            </div>

            <div class="table-card">
              <el-table :data="pagedList" border stripe style="width:100%">
                <el-table-column prop="studentId" label="学号" width="110" />
                <el-table-column prop="studentName" label="姓名" width="100" />
                <el-table-column prop="courseName" label="课程" width="200" />
                <el-table-column prop="score" label="成绩" width="100" align="center">
                  <template #default="s">
                    <el-tag :type="scoreTagType(s.row.score)" size="small">{{ s.row.score }}</el-tag>
                  </template>
                </el-table-column>
                <el-table-column prop="semester" label="学期" width="140" />
                <el-table-column prop="inputAt" label="录入日期" width="120" />
                <el-table-column label="操作" width="170">
                  <template #default="s">
                    <el-button size="small" @click="openEdit(s.row)">修改</el-button>
                    <el-button size="small" type="danger" plain @click="confirmDelete(s.row)">删除</el-button>
                  </template>
                </el-table-column>
              </el-table>
              <div class="pagination-area">
                <el-pagination v-model:current-page="page.current" v-model:page-size="page.size"
                  :page-sizes="[10, 20, 30, 50]" layout="total, sizes, prev, pager, next, jumper" :total="filteredList.length" />
              </div>
            </div>
          </el-tab-pane>

          <el-tab-pane label="课程统计" name="stat">
            <el-row :gutter="20">
              <el-col :span="8" v-for="(item, idx) in courseStats" :key="idx" style="margin-bottom:16px">
                <div class="stat-card" :style="{background:['#e8f1fb','#e6f9f7','#fef0e6','#f3ebfb','#e6f9f7'][idx%5]}">
                  <div style="font-size:13px;color:#606266;margin-bottom:6px">{{ item.courseName }}</div>
                  <div style="font-size:22px;font-weight:700;color:#303133">平均分 {{ item.avg }}</div>
                  <div style="font-size:12px;color:#909399;margin-top:8px">
                    参考：{{ item.count }} 人 · 最高：{{ item.max }} · 最低：{{ item.min }} · 及格率：{{ item.passRate }}
                  </div>
                </div>
              </el-col>
            </el-row>

            <el-divider content-position="left">学生成绩分布</el-divider>
            <div class="table-card">
              <div class="stat-chart" style="height: 260px; padding-top: 40px">
                <div v-for="(b, idx) in scoreRanges" :key="idx" class="chart-bar"
                     :style="{
                       flex: 1, background: 'linear-gradient(to top, ' + b.color + ', ' + b.color + '88)',
                       height: Math.max((b.value / (maxBucketValue || 1)) * 200, 10) + 'px',
                       margin: '0 8px', borderRadius: '8px 8px 0 0',
                       position: 'relative', display: 'flex', alignItems: 'flex-start', justifyContent: 'center'
                     }"
                     :data-value="b.value"
                     :data-label="b.label">
                  <div style="position:absolute;top:-22px;font-weight:600;color:#303133">{{ b.value }}</div>
                  <div style="position:absolute;bottom:-24px;font-size:12px;color:#909399;white-space:nowrap">{{ b.label }}</div>
                </div>
              </div>
              <div style="height: 30px"></div>
            </div>

            <el-divider content-position="left">学生平均分排行榜</el-divider>
            <div class="table-card">
              <el-table :data="studentRank" border stripe style="width:100%">
                <el-table-column type="index" label="排名" width="70" align="center" />
                <el-table-column prop="studentId" label="学号" width="110" />
                <el-table-column prop="studentName" label="姓名" width="110" />
                <el-table-column prop="count" label="课程数" width="90" align="center" />
                <el-table-column prop="avg" label="平均分" width="110" align="center">
                  <template #default="s"><el-tag type="info" effect="plain" size="small">{{ s.row.avg }}</el-tag></template>
                </el-table-column>
                <el-table-column prop="max" label="最高" width="90" align="center" />
                <el-table-column prop="min" label="最低" width="90" align="center" />
              </el-table>
            </div>
          </el-tab-pane>
        </el-tabs>

        <el-dialog v-model="dialog.show" :title="dialog.mode==='add'?'录入成绩':'修改成绩'" width="520px">
          <el-form :model="form" label-width="100px">
            <el-form-item label="学生">
              <el-select v-model="form.studentId" style="width:100%" @change="onStudentChange" :disabled="dialog.mode==='edit'">
                <el-option v-for="s in studentOptions" :key="s.id" :label="s.id + ' ' + s.name" :value="s.id" />
              </el-select>
            </el-form-item>
            <el-form-item label="课程">
              <el-select v-model="form.courseId" style="width:100%" @change="onCourseChange" :disabled="dialog.mode==='edit'">
                <el-option v-for="c in courseList" :key="c.id" :label="c.name" :value="c.id" />
              </el-select>
            </el-form-item>
            <el-row :gutter="16">
              <el-col :span="12"><el-form-item label="成绩">
                <el-input-number v-model.number="form.score" :min="0" :max="100" style="width:100%" />
              </el-form-item></el-col>
              <el-col :span="12"><el-form-item label="学期"><el-input v-model="form.semester" /></el-form-item></el-col>
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
        activeTab: 'list',
        filter: { keyword: '', course: '', range: '' },
        page: { current: 1, size: 10 },
        list: [],
        courseList: [],
        studentOptions: [],
        dialog: { show: false, mode: 'add' },
        form: { id: '', studentId: '', studentName: '', courseId: '', courseName: '', score: 0, semester: '2025-2026春' }
      };
    },
    computed: {
      courseOptions() { return this.courseList.map(c => c.name); },
      filteredList() {
        const kw = this.filter.keyword.trim();
        return this.list.filter(s => {
          if (kw && !s.studentId.includes(kw) && !s.studentName.includes(kw)) return false;
          if (this.filter.course && s.courseName !== this.filter.course) return false;
          if (this.filter.range) {
            const score = Number(s.score);
            if (this.filter.range === 'excellent' && score < 90) return false;
            if (this.filter.range === 'good' && (score < 80 || score >= 90)) return false;
            if (this.filter.range === 'medium' && (score < 70 || score >= 80)) return false;
            if (this.filter.range === 'pass' && (score < 60 || score >= 70)) return false;
            if (this.filter.range === 'fail' && score >= 60) return false;
          }
          return true;
        });
      },
      pagedList() {
        const start = (this.page.current - 1) * this.page.size;
        return this.filteredList.slice(start, start + this.page.size);
      },
      courseStats() { return ScoreService.statByCourse(); },
      scoreRanges() { return ScoreService.statByScoreRange(); },
      maxBucketValue() { return Math.max.apply(null, this.scoreRanges.map(r => r.value).concat([1])); },
      studentRank() { return ScoreService.statByStudent().slice(0, 10); }
    },
    created() { this.load(); },
    methods: {
      load() {
        this.list = ScoreService.getScores();
        this.courseList = CourseService.getCourses();
        this.studentOptions = UserService.getStudents();
      },
      scoreTagType(score) {
        const s = Number(score);
        if (s >= 90) return 'success';
        if (s >= 80) return 'primary';
        if (s >= 60) return 'warning';
        return 'danger';
      },
      openAdd() {
        this.dialog.mode = 'add';
        this.form = { id: '', studentId: '', studentName: '', courseId: '', courseName: '', score: 80, semester: '2025-2026春' };
        this.dialog.show = true;
      },
      openEdit(row) {
        this.dialog.mode = 'edit';
        this.form = Object.assign({}, row);
        this.dialog.show = true;
      },
      onStudentChange(id) {
        const s = this.studentOptions.find(x => x.id === id);
        if (s) this.form.studentName = s.name;
      },
      onCourseChange(id) {
        const c = this.courseList.find(x => x.id === id);
        if (c) this.form.courseName = c.name;
      },
      submitForm() {
        if (!this.form.studentId || !this.form.courseId) { Common.showMsg('请选择学生和课程', 'warning'); return; }
        if (this.dialog.mode === 'add') ScoreService.addScore(this.form);
        else ScoreService.updateScore(this.form);
        this.load();
        this.dialog.show = false;
      },
      confirmDelete(row) {
        ElementPlus.ElMessageBox.confirm('确定删除该成绩记录吗？', '确认', { type: 'warning' })
          .then(() => { ScoreService.deleteScore(row.id); this.load(); }).catch(() => {});
      }
    }
  };

  // 注册到全局
  global.PageComponents = { PageStudent, PageTeacher, PageCourse, PageScore };
})(window);
