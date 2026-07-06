/* ============================================================
 * 页面组件集合 Part2：公告 / 宿舍 / 图书馆
 * ============================================================ */
(function (global) {

  // ========== 公告管理 ==========
  const PageNotice = {
    template: `
      <div class="page-wrapper">
        <div class="page-header">
          <div>
            <div class="page-title">校园公告发布与维护</div>
            <div class="page-desc">发布校园公告、预警消息，并进行推送管理</div>
          </div>
          <div class="page-actions">
            <el-button type="primary" @click="openAdd">+ 发布新公告</el-button>
            <el-button type="warning" @click="generateWarning">⚠ 生成学业预警</el-button>
          </div>
        </div>

        <div class="filter-bar">
          <div class="filter-form">
            <el-input v-model="filter.keyword" placeholder="搜索标题..." clearable style="width:240px" />
            <el-select v-model="filter.type" placeholder="全部类型" clearable style="width:140px">
              <el-option label="重要" value="重要" />
              <el-option label="通知" value="通知" />
              <el-option label="预警" value="预警" />
            </el-select>
          </div>
        </div>

        <div class="table-card">
          <el-table :data="pagedList" border stripe style="width:100%">
            <el-table-column label="置顶/类型" width="130" align="center">
              <template #default="s">
                <div style="display:flex;flex-direction:column;gap:4px;align-items:center">
                  <el-tag :type="typeTag(s.row.type)" size="small">{{ s.row.type }}</el-tag>
                  <el-tag v-if="s.row.pinned" type="warning" size="small" effect="dark">📌 置顶</el-tag>
                </div>
              </template>
            </el-table-column>
            <el-table-column prop="title" label="标题" min-width="280">
              <template #default="s">
                <div style="cursor:pointer;color:#303133" @click="showDetail(s.row)">
                  <strong>{{ s.row.title }}</strong>
                  <div style="font-size:12px;color:#909399;font-weight:normal;margin-top:4px">{{ (s.row.content||'').substring(0, 60) }}...</div>
                </div>
              </template>
            </el-table-column>
            <el-table-column prop="target" label="目标" width="130" align="center" />
            <el-table-column prop="publisher" label="发布方" width="120" align="center" />
            <el-table-column prop="createAt" label="发布日期" width="120" align="center" />
            <el-table-column prop="views" label="浏览" width="80" align="center" />
            <el-table-column label="操作" width="260" fixed="right">
              <template #default="s">
                <el-button size="small" @click="pushNotice(s.row)">推送</el-button>
                <el-button size="small" type="warning" plain @click="togglePin(s.row)">{{ s.row.pinned ? '取消置顶' : '置顶' }}</el-button>
                <el-button size="small" @click="openEdit(s.row)">编辑</el-button>
                <el-button size="small" type="danger" plain @click="confirmDelete(s.row)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
          <div class="pagination-area">
            <el-pagination v-model:current-page="page.current" v-model:page-size="page.size"
              :page-sizes="[10, 20, 30]" layout="total, sizes, prev, pager, next, jumper" :total="filteredList.length" />
          </div>
        </div>

        <el-dialog v-model="dialog.show" :title="dialog.mode==='add'?'发布新公告':'编辑公告'" width="620px">
          <el-form :model="form" label-width="100px">
            <el-form-item label="公告类型">
              <el-radio-group v-model="form.type">
                <el-radio value="通知">通知</el-radio>
                <el-radio value="重要">重要</el-radio>
                <el-radio value="预警">预警</el-radio>
              </el-radio-group>
            </el-form-item>
            <el-form-item label="标题"><el-input v-model="form.title" placeholder="请输入公告标题" /></el-form-item>
            <el-row :gutter="16">
              <el-col :span="12"><el-form-item label="目标用户"><el-input v-model="form.target" placeholder="如：全体师生 / 某学院" /></el-form-item></el-col>
              <el-col :span="12"><el-form-item label="发布方"><el-input v-model="form.publisher" placeholder="如：教务处" /></el-form-item></el-col>
            </el-row>
            <el-form-item label="正文内容"><el-input v-model="form.content" type="textarea" :rows="6" placeholder="请输入公告正文" /></el-form-item>
            <el-form-item label="置顶">
              <el-switch v-model="form.pinned" />
            </el-form-item>
          </el-form>
          <template #footer>
            <el-button @click="dialog.show=false">取消</el-button>
            <el-button type="primary" @click="submitForm">发布</el-button>
          </template>
        </el-dialog>

        <el-dialog v-model="detail.show" :title="detail.title" width="620px">
          <div style="line-height:2;font-size:14px;color:#606266">
            <div><strong>类型：</strong>{{ detail.type }} · <strong>目标：</strong>{{ detail.target }} · <strong>发布方：</strong>{{ detail.publisher }} · <strong>日期：</strong>{{ detail.createAt }}</div>
            <el-divider />
            <div style="white-space:pre-wrap">{{ detail.content }}</div>
          </div>
          <template #footer>
            <el-button type="primary" @click="detail.show=false">关闭</el-button>
          </template>
        </el-dialog>
      </div>
    `,
    data() {
      return {
        filter: { keyword: '', type: '' },
        page: { current: 1, size: 10 },
        list: [],
        dialog: { show: false, mode: 'add' },
        form: { id: '', title: '', type: '通知', target: '全体师生', publisher: '教务处', content: '', pinned: false },
        detail: { show: false, title: '', type: '', target: '', publisher: '', createAt: '', content: '' }
      };
    },
    computed: {
      filteredList() {
        const kw = this.filter.keyword.trim();
        const list = this.list.slice().sort((a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0));
        return list.filter(n => {
          if (kw && !n.title.includes(kw)) return false;
          if (this.filter.type && n.type !== this.filter.type) return false;
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
      load() { this.list = NoticeService.getNotices(); },
      typeTag(t) { return t === '重要' ? 'danger' : (t === '预警' ? 'warning' : 'primary'); },
      openAdd() {
        this.dialog.mode = 'add';
        this.form = { id: '', title: '', type: '通知', target: '全体师生', publisher: '教务处', content: '', pinned: false };
        this.dialog.show = true;
      },
      openEdit(row) { this.dialog.mode = 'edit'; this.form = Object.assign({}, row); this.dialog.show = true; },
      showDetail(row) { this.detail = Object.assign({ show: true }, row); },
      submitForm() {
        if (!this.form.title || !this.form.content) { Common.showMsg('标题和内容不能为空', 'warning'); return; }
        if (this.dialog.mode === 'add') NoticeService.addNotice(this.form);
        else NoticeService.updateNotice(this.form);
        this.load(); this.dialog.show = false;
      },
      confirmDelete(row) {
        ElementPlus.ElMessageBox.confirm('确定删除公告【' + row.title + '】吗？', '确认', { type: 'warning' })
          .then(() => { NoticeService.deleteNotice(row.id); this.load(); }).catch(() => {});
      },
      togglePin(row) { NoticeService.togglePin(row.id); this.load(); },
      pushNotice(row) { NoticeService.pushNotice(row.id); },
      generateWarning() { NoticeService.generateWarning(); this.load(); }
    }
  };

  // ========== 宿舍管理 ==========
  const PageDorm = {
    template: `
      <div class="page-wrapper">
        <div class="page-header">
          <div>
            <div class="page-title">宿舍与住宿管理</div>
            <div class="page-desc">维护宿舍房间信息并管理学生住宿分配</div>
          </div>
          <div class="page-actions">
            <el-button type="primary" @click="openAddRoom">+ 新增宿舍</el-button>
            <el-button type="success" plain @click="openAllocate">+ 办理入住</el-button>
          </div>
        </div>

        <el-tabs v-model="activeTab">
          <el-tab-pane label="宿舍楼统计" name="building">
            <el-row :gutter="16" style="margin-bottom:20px">
              <el-col :span="8" v-for="(s, idx) in buildingStats" :key="idx">
                <div class="stat-card" :style="{background: ['#e8f1fb','#e6f9f7','#fef0e6','#f3ebfb','#fce4ec'][idx%5]}">
                  <div style="font-size:13px;color:#606266;margin-bottom:6px">{{ s.building }}</div>
                  <div style="font-size:20px;font-weight:700;color:#303133">在住 {{ s.occupied }} 人</div>
                  <div style="font-size:12px;color:#909399;margin-top:6px">
                    共 {{ s.total }} 间房 · 容量 {{ s.capacity }} · 使用率 {{ s.usage }}
                  </div>
                </div>
              </el-col>
            </el-row>
          </el-tab-pane>

          <el-tab-pane label="宿舍列表" name="rooms">
            <div class="table-card">
              <el-table :data="roomList" border stripe style="width:100%">
                <el-table-column prop="id" label="宿舍编号" width="130" />
                <el-table-column prop="building" label="楼栋" width="90" align="center" />
                <el-table-column prop="floor" label="楼层" width="80" align="center" />
                <el-table-column prop="roomNo" label="房号" width="90" align="center" />
                <el-table-column prop="type" label="类型" width="110" align="center" />
                <el-table-column prop="capacity" label="容量" width="80" align="center" />
                <el-table-column prop="gender" label="性别" width="80" align="center" />
                <el-table-column prop="fee" label="住宿费(元)" width="110" align="center" />
                <el-table-column label="当前入住" width="110" align="center">
                  <template #default="s">
                    <el-tag size="small" :type="getOccupancy(s.row.id) >= s.row.capacity ? 'danger':'success'">
                      {{ getOccupancy(s.row.id) }}/{{ s.row.capacity }}
                    </el-tag>
                  </template>
                </el-table-column>
                <el-table-column prop="status" label="状态" width="90" align="center">
                  <template #default="s"><el-tag size="small" :type="s.row.status==='使用中'?'success':'info'">{{ s.row.status }}</el-tag></template>
                </el-table-column>
                <el-table-column label="操作" width="180">
                  <template #default="s">
                    <el-button size="small" @click="openEditRoom(s.row)">编辑</el-button>
                    <el-button size="small" type="danger" plain @click="confirmDeleteRoom(s.row)">删除</el-button>
                  </template>
                </el-table-column>
              </el-table>
            </div>
          </el-tab-pane>

          <el-tab-pane label="住宿分配记录" name="alloc">
            <div class="filter-bar">
              <div class="filter-form">
                <el-input v-model="allocKeyword" placeholder="学生姓名/宿舍号" clearable style="width:220px" />
                <el-select v-model="allocStatusFilter" placeholder="全部状态" clearable style="width:140px">
                  <el-option label="在住" value="在住" />
                  <el-option label="已退房" value="已退房" />
                </el-select>
              </div>
            </div>
            <div class="table-card">
              <el-table :data="filteredAllocs" border stripe style="width:100%">
                <el-table-column prop="studentId" label="学号" width="110" />
                <el-table-column prop="studentName" label="姓名" width="110" />
                <el-table-column prop="roomId" label="宿舍" width="140" />
                <el-table-column prop="checkIn" label="入住日期" width="120" align="center" />
                <el-table-column prop="checkOut" label="退房日期" width="120" align="center" />
                <el-table-column prop="status" label="状态" width="100" align="center">
                  <template #default="s">
                    <el-tag size="small" :type="s.row.status==='在住'?'success':'info'">{{ s.row.status }}</el-tag>
                  </template>
                </el-table-column>
                <el-table-column label="操作" width="180">
                  <template #default="s">
                    <el-button size="small" v-if="s.row.status==='在住'" @click="checkOut(s.row)">退房</el-button>
                    <el-button size="small" type="danger" plain @click="confirmDeleteAlloc(s.row)">删除</el-button>
                  </template>
                </el-table-column>
              </el-table>
            </div>
          </el-tab-pane>
        </el-tabs>

        <el-dialog v-model="roomDialog.show" :title="roomDialog.mode==='add'?'新增宿舍':'编辑宿舍'" width="560px">
          <el-form :model="roomForm" label-width="110px">
            <el-row :gutter="16">
              <el-col :span="12"><el-form-item label="宿舍编号"><el-input v-model="roomForm.id" :disabled="roomDialog.mode==='edit'" /></el-form-item></el-col>
              <el-col :span="12"><el-form-item label="楼栋"><el-input v-model="roomForm.building" placeholder="如 A栋" /></el-form-item></el-col>
              <el-col :span="12"><el-form-item label="楼层"><el-input-number v-model.number="roomForm.floor" :min="1" style="width:100%" /></el-form-item></el-col>
              <el-col :span="12"><el-form-item label="房号"><el-input v-model="roomForm.roomNo" /></el-form-item></el-col>
              <el-col :span="12"><el-form-item label="类型">
                <el-select v-model="roomForm.type" style="width:100%">
                  <el-option label="4人间" value="4人间" /><el-option label="6人间" value="6人间" /><el-option label="8人间" value="8人间" />
                </el-select>
              </el-form-item></el-col>
              <el-col :span="12"><el-form-item label="容量"><el-input-number v-model.number="roomForm.capacity" :min="1" style="width:100%" /></el-form-item></el-col>
              <el-col :span="12"><el-form-item label="性别">
                <el-radio-group v-model="roomForm.gender"><el-radio value="男">男</el-radio><el-radio value="女">女</el-radio></el-radio-group>
              </el-form-item></el-col>
              <el-col :span="12"><el-form-item label="住宿费"><el-input-number v-model.number="roomForm.fee" :min="0" style="width:100%" /></el-form-item></el-col>
              <el-col :span="12"><el-form-item label="状态">
                <el-select v-model="roomForm.status" style="width:100%">
                  <el-option label="使用中" value="使用中" /><el-option label="空闲" value="空闲" /><el-option label="维修中" value="维修中" />
                </el-select>
              </el-form-item></el-col>
            </el-row>
          </el-form>
          <template #footer>
            <el-button @click="roomDialog.show=false">取消</el-button>
            <el-button type="primary" @click="submitRoom">确定</el-button>
          </template>
        </el-dialog>

        <el-dialog v-model="allocDialog.show" title="办理入住" width="560px">
          <el-form :model="allocForm" label-width="110px">
            <el-form-item label="选择学生">
              <el-select v-model="allocForm.studentId" style="width:100%" filterable @change="onAllocStudentChange">
                <el-option v-for="s in studentOptions" :key="s.id" :label="s.id + ' ' + s.name" :value="s.id" />
              </el-select>
            </el-form-item>
            <el-form-item label="选择宿舍">
              <el-select v-model="allocForm.roomId" style="width:100%">
                <el-option v-for="r in availableRooms" :key="r.id"
                  :label="r.id + ' ' + r.type + ' ' + r.gender + '生宿舍 (' + getOccupancy(r.id) + '/' + r.capacity + '已住)'"
                  :value="r.id" />
              </el-select>
            </el-form-item>
            <el-form-item label="入住日期">
              <el-date-picker v-model="allocForm.checkIn" value-format="YYYY-MM-DD" type="date" style="width:100%" />
            </el-form-item>
          </el-form>
          <template #footer>
            <el-button @click="allocDialog.show=false">取消</el-button>
            <el-button type="primary" @click="submitAlloc">确认入住</el-button>
          </template>
        </el-dialog>
      </div>
    `,
    data() {
      return {
        activeTab: 'building',
        roomList: [],
        allocList: [],
        studentOptions: [],
        allocKeyword: '',
        allocStatusFilter: '',
        roomDialog: { show: false, mode: 'add' },
        roomForm: { id: '', building: '', floor: 3, roomNo: '', type: '4人间', capacity: 4, gender: '男', fee: 1200, status: '使用中' },
        allocDialog: { show: false },
        allocForm: { studentId: '', studentName: '', roomId: '', checkIn: Common.today() }
      };
    },
    computed: {
      buildingStats() { return DormService.getBuildingStats(); },
      availableRooms() {
        return this.roomList.filter(r => this.getOccupancy(r.id) < r.capacity);
      },
      filteredAllocs() {
        const kw = this.allocKeyword.trim();
        return this.allocList.filter(a => {
          if (kw && !a.studentName.includes(kw) && !(a.roomId || '').includes(kw)) return false;
          if (this.allocStatusFilter && a.status !== this.allocStatusFilter) return false;
          return true;
        });
      }
    },
    created() { this.load(); },
    methods: {
      load() {
        this.roomList = DormService.getRooms();
        this.allocList = DormService.getAllocations();
        this.studentOptions = UserService.getStudents();
      },
      getOccupancy(id) { return DormService.getRoomOccupancy(id); },
      openAddRoom() {
        this.roomDialog.mode = 'add';
        this.roomForm = { id: '', building: '', floor: 3, roomNo: '', type: '4人间', capacity: 4, gender: '男', fee: 1200, status: '使用中' };
        this.roomDialog.show = true;
      },
      openEditRoom(row) { this.roomDialog.mode = 'edit'; this.roomForm = Object.assign({}, row); this.roomDialog.show = true; },
      submitRoom() {
        if (!this.roomForm.id || !this.roomForm.building) { Common.showMsg('编号和楼栋必填', 'warning'); return; }
        if (this.roomDialog.mode === 'add') DormService.addRoom(this.roomForm);
        else DormService.updateRoom(this.roomForm);
        this.load(); this.roomDialog.show = false;
      },
      confirmDeleteRoom(row) {
        ElementPlus.ElMessageBox.confirm('确定删除宿舍【' + row.id + '】吗？如有人入住会拒绝删除。', '确认', { type: 'warning' })
          .then(() => { DormService.deleteRoom(row.id); this.load(); }).catch(() => {});
      },
      openAllocate() {
        this.allocForm = { studentId: '', studentName: '', roomId: '', checkIn: Common.today() };
        this.allocDialog.show = true;
      },
      onAllocStudentChange(id) {
        const s = this.studentOptions.find(x => x.id === id);
        if (s) this.allocForm.studentName = s.name;
      },
      submitAlloc() {
        if (!this.allocForm.studentId || !this.allocForm.roomId) { Common.showMsg('请选择学生和宿舍', 'warning'); return; }
        if (DormService.allocateStudent(this.allocForm)) { this.load(); this.allocDialog.show = false; }
      },
      checkOut(row) {
        ElementPlus.ElMessageBox.confirm('确定为【' + row.studentName + '】办理退房吗？', '确认', { type: 'warning' })
          .then(() => { DormService.checkOut(row.id); this.load(); }).catch(() => {});
      },
      confirmDeleteAlloc(row) {
        ElementPlus.ElMessageBox.confirm('确定删除该分配记录吗？', '确认', { type: 'warning' })
          .then(() => { DormService.deleteAllocation(row.id); this.load(); }).catch(() => {});
      }
    }
  };

  // ========== 图书馆管理 ==========
  const PageLibrary = {
    template: `
      <div class="page-wrapper">
        <div class="page-header">
          <div>
            <div class="page-title">图书馆书籍借阅与馆藏管理</div>
            <div class="page-desc">管理图书馆藏资源及读者借阅记录</div>
          </div>
          <div class="page-actions">
            <el-button type="primary" @click="openAddBook">+ 新增书籍</el-button>
            <el-button type="success" plain @click="openBorrow">+ 办理借阅</el-button>
          </div>
        </div>

        <el-tabs v-model="activeTab">
          <el-tab-pane label="馆藏统计" name="stat">
            <el-row :gutter="16" style="margin-bottom:20px">
              <el-col :span="8" v-for="(s, idx) in categoryStats" :key="idx">
                <div class="stat-card" :style="{background:['#e8f1fb','#e6f9f7','#fef0e6','#f3ebfb','#fce4ec'][idx%5]}">
                  <div style="font-size:13px;color:#606266;margin-bottom:6px">{{ s.category }}（{{ s.kinds }} 个品类）</div>
                  <div style="font-size:20px;font-weight:700;color:#303133">{{ s.total }} 册</div>
                  <div style="font-size:12px;color:#909399;margin-top:6px">可借 {{ s.available }} 册 · 借出 {{ s.total - s.available }} 册</div>
                </div>
              </el-col>
            </el-row>
          </el-tab-pane>

          <el-tab-pane label="书籍馆藏" name="books">
            <div class="filter-bar">
              <div class="filter-form">
                <el-input v-model="bookKeyword" placeholder="书名/作者/ISBN" clearable style="width:240px" />
                <el-select v-model="bookCategory" placeholder="全部分类" clearable style="width:140px">
                  <el-option v-for="c in categoryOptions" :key="c" :label="c" :value="c" />
                </el-select>
              </div>
            </div>
            <div class="table-card">
              <el-table :data="filteredBooks" border stripe style="width:100%">
                <el-table-column prop="id" label="编号" width="90" />
                <el-table-column prop="title" label="书名" width="240" />
                <el-table-column prop="author" label="作者" width="120" />
                <el-table-column prop="publisher" label="出版社" width="160" />
                <el-table-column prop="category" label="分类" width="100" />
                <el-table-column prop="pubYear" label="出版年份" width="100" align="center" />
                <el-table-column prop="isbn" label="ISBN" width="180" />
                <el-table-column label="库存/可借" width="120" align="center">
                  <template #default="s">
                    <el-tag size="small" :type="s.row.available>0?'success':'warning'">{{ s.row.available }}/{{ s.row.total }}</el-tag>
                  </template>
                </el-table-column>
                <el-table-column prop="price" label="单价" width="90" align="center" />
                <el-table-column prop="location" label="馆藏位置" width="140" />
                <el-table-column label="操作" width="180">
                  <template #default="s">
                    <el-button size="small" @click="openEditBook(s.row)">编辑</el-button>
                    <el-button size="small" type="success" plain @click="quickBorrow(s.row)" :disabled="s.row.available<=0">借阅</el-button>
                    <el-button size="small" type="danger" plain @click="confirmDeleteBook(s.row)">删除</el-button>
                  </template>
                </el-table-column>
              </el-table>
            </div>
          </el-tab-pane>

          <el-tab-pane label="借阅记录" name="borrows">
            <div class="filter-bar">
              <div class="filter-form">
                <el-input v-model="borrowKeyword" placeholder="学生姓名/书名" clearable style="width:240px" />
                <el-select v-model="borrowStatus" placeholder="全部状态" clearable style="width:140px">
                  <el-option label="借阅中" value="借阅中" />
                  <el-option label="已逾期" value="已逾期" />
                  <el-option label="已归还" value="已归还" />
                </el-select>
              </div>
            </div>
            <div class="table-card">
              <el-table :data="filteredBorrows" border stripe style="width:100%">
                <el-table-column prop="studentId" label="学号" width="110" />
                <el-table-column prop="studentName" label="姓名" width="100" />
                <el-table-column prop="bookTitle" label="书名" width="240" />
                <el-table-column prop="borrowDate" label="借阅日期" width="120" align="center" />
                <el-table-column prop="dueDate" label="应还日期" width="120" align="center" />
                <el-table-column prop="returnDate" label="归还日期" width="120" align="center" />
                <el-table-column label="状态" width="100" align="center">
                  <template #default="s">
                    <el-tag size="small" :type="s.row.status==='已归还'?'success':(s.row.status==='已逾期'?'danger':'primary')">{{ s.row.status }}</el-tag>
                  </template>
                </el-table-column>
                <el-table-column label="操作" width="220">
                  <template #default="s">
                    <el-button v-if="s.row.status!=='已归还'" size="small" type="success" @click="returnBook(s.row)">归还</el-button>
                    <el-button v-if="s.row.status==='借阅中'" size="small" type="warning" @click="renewBook(s.row)">续借</el-button>
                    <el-button size="small" type="danger" plain @click="confirmDeleteBorrow(s.row)">删除</el-button>
                  </template>
                </el-table-column>
              </el-table>
            </div>
          </el-tab-pane>
        </el-tabs>

        <el-dialog v-model="bookDialog.show" :title="bookDialog.mode==='add'?'新增书籍':'编辑书籍'" width="640px">
          <el-form :model="bookForm" label-width="110px">
            <el-row :gutter="16">
              <el-col :span="12"><el-form-item label="图书编号"><el-input v-model="bookForm.id" :disabled="bookDialog.mode==='edit'" /></el-form-item></el-col>
              <el-col :span="12"><el-form-item label="ISBN"><el-input v-model="bookForm.isbn" /></el-form-item></el-col>
            </el-row>
            <el-form-item label="书名"><el-input v-model="bookForm.title" /></el-form-item>
            <el-row :gutter="16">
              <el-col :span="12"><el-form-item label="作者"><el-input v-model="bookForm.author" /></el-form-item></el-col>
              <el-col :span="12"><el-form-item label="出版社"><el-input v-model="bookForm.publisher" /></el-form-item></el-col>
            </el-row>
            <el-row :gutter="16">
              <el-col :span="12"><el-form-item label="分类">
                <el-select v-model="bookForm.category" style="width:100%"><el-option v-for="c in categoryOptions" :key="c" :label="c" :value="c" /></el-select>
              </el-form-item></el-col>
              <el-col :span="12"><el-form-item label="出版年份"><el-input-number v-model.number="bookForm.pubYear" :min="1900" style="width:100%" /></el-form-item></el-col>
            </el-row>
            <el-row :gutter="16">
              <el-col :span="8"><el-form-item label="总册数"><el-input-number v-model.number="bookForm.total" :min="1" style="width:100%" /></el-form-item></el-col>
              <el-col :span="8"><el-form-item label="可借册数"><el-input-number v-model.number="bookForm.available" :min="0" style="width:100%" /></el-form-item></el-col>
              <el-col :span="8"><el-form-item label="单价"><el-input-number v-model.number="bookForm.price" :min="0" :precision="2" style="width:100%" /></el-form-item></el-col>
            </el-row>
            <el-form-item label="馆藏位置"><el-input v-model="bookForm.location" placeholder="如 A区-3架-5层" /></el-form-item>
          </el-form>
          <template #footer>
            <el-button @click="bookDialog.show=false">取消</el-button>
            <el-button type="primary" @click="submitBook">确定</el-button>
          </template>
        </el-dialog>

        <el-dialog v-model="borrowDialog.show" title="办理借阅" width="560px">
          <el-form :model="borrowForm" label-width="110px">
            <el-form-item label="选择学生">
              <el-select v-model="borrowForm.studentId" filterable style="width:100%" @change="onBorrowStudentChange">
                <el-option v-for="s in studentOptions" :key="s.id" :label="s.id + ' ' + s.name" :value="s.id" />
              </el-select>
            </el-form-item>
            <el-form-item label="选择书籍">
              <el-select v-model="borrowForm.bookId" filterable style="width:100%" @change="onBorrowBookChange">
                <el-option v-for="b in bookList.filter(x => x.available > 0)" :key="b.id"
                  :label="b.id + ' ' + b.title + ' (' + b.available + '/' + b.total + ')'" :value="b.id" />
              </el-select>
            </el-form-item>
          </el-form>
          <template #footer>
            <el-button @click="borrowDialog.show=false">取消</el-button>
            <el-button type="primary" @click="submitBorrow">确认借阅 (60天)</el-button>
          </template>
        </el-dialog>
      </div>
    `,
    data() {
      return {
        activeTab: 'books',
        bookList: [],
        borrowList: [],
        studentOptions: [],
        bookKeyword: '',
        bookCategory: '',
        borrowKeyword: '',
        borrowStatus: '',
        bookDialog: { show: false, mode: 'add' },
        bookForm: { id: '', isbn: '', title: '', author: '', publisher: '', category: '计算机', pubYear: 2023, total: 5, available: 5, price: 0, location: '' },
        borrowDialog: { show: false },
        borrowForm: { studentId: '', studentName: '', bookId: '', bookTitle: '' }
      };
    },
    computed: {
      categoryOptions() { return LibraryService.categoryOptions; },
      categoryStats() { return LibraryService.statByCategory(); },
      filteredBooks() {
        const kw = this.bookKeyword.trim();
        return this.bookList.filter(b => {
          if (kw && !b.title.includes(kw) && !(b.author || '').includes(kw) && !(b.isbn || '').includes(kw)) return false;
          if (this.bookCategory && b.category !== this.bookCategory) return false;
          return true;
        });
      },
      filteredBorrows() {
        const kw = this.borrowKeyword.trim();
        return this.borrowList.filter(b => {
          if (kw && !b.studentName.includes(kw) && !b.bookTitle.includes(kw)) return false;
          if (this.borrowStatus && b.status !== this.borrowStatus) return false;
          return true;
        });
      }
    },
    created() { this.load(); },
    methods: {
      load() {
        this.bookList = LibraryService.getBooks();
        this.borrowList = LibraryService.getBorrows();
        this.studentOptions = UserService.getStudents();
      },
      openAddBook() {
        this.bookDialog.mode = 'add';
        this.bookForm = { id: '', isbn: '', title: '', author: '', publisher: '', category: '计算机', pubYear: 2023, total: 5, available: 5, price: 49, location: '' };
        this.bookDialog.show = true;
      },
      openEditBook(row) { this.bookDialog.mode = 'edit'; this.bookForm = Object.assign({}, row); this.bookDialog.show = true; },
      submitBook() {
        if (!this.bookForm.id || !this.bookForm.title) { Common.showMsg('编号和书名必填', 'warning'); return; }
        if (this.bookDialog.mode === 'add') LibraryService.addBook(this.bookForm);
        else LibraryService.updateBook(this.bookForm);
        this.load(); this.bookDialog.show = false;
      },
      confirmDeleteBook(row) {
        ElementPlus.ElMessageBox.confirm('确定删除《' + row.title + '》的馆藏记录吗？', '确认', { type: 'warning' })
          .then(() => { LibraryService.deleteBook(row.id); this.load(); }).catch(() => {});
      },
      openBorrow() {
        this.borrowForm = { studentId: '', studentName: '', bookId: '', bookTitle: '' };
        this.borrowDialog.show = true;
      },
      quickBorrow(row) {
        this.borrowForm = { studentId: '', studentName: '', bookId: row.id, bookTitle: row.title };
        this.borrowDialog.show = true;
      },
      onBorrowStudentChange(id) {
        const s = this.studentOptions.find(x => x.id === id);
        if (s) this.borrowForm.studentName = s.name;
      },
      onBorrowBookChange(id) {
        const b = this.bookList.find(x => x.id === id);
        if (b) this.borrowForm.bookTitle = b.title;
      },
      submitBorrow() {
        if (!this.borrowForm.studentId || !this.borrowForm.bookId) { Common.showMsg('请选择学生和书籍', 'warning'); return; }
        if (LibraryService.borrowBook(this.borrowForm)) { this.load(); this.borrowDialog.show = false; }
      },
      returnBook(row) { LibraryService.returnBook(row.id); this.load(); },
      renewBook(row) { LibraryService.renewBook(row.id); this.load(); },
      confirmDeleteBorrow(row) {
        ElementPlus.ElMessageBox.confirm('确定删除该借阅记录吗？（不影响馆藏，仅删除记录）', '确认', { type: 'warning' })
          .then(() => { LibraryService.deleteBorrow(row.id); this.load(); }).catch(() => {});
      }
    }
  };

  global.PageComponents2 = { PageNotice, PageDorm, PageLibrary };
})(window);
