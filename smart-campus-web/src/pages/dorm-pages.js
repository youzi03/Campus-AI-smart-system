/* ============================================================
 * 宿舍服务 dorm-service - 页面组件
 * 页面：宿舍管理（宿舍楼/宿舍房间/住宿分配）
 * ============================================================ */
(function (global) {

  const PageDorm = {
    template: `
      <div class="page-wrapper">
        <div class="page-header">
          <div>
            <div class="page-title">宿舍管理</div>
            <div class="page-desc">宿舍楼信息、宿舍房间、学生住宿分配全流程管理</div>
          </div>
          <div style="display:flex;gap:10px">
            <el-button type="primary" @click="openAddRoom">+ 新增宿舍</el-button>
            <el-button type="success" @click="openAllocate">+ 办理入住</el-button>
          </div>
        </div>

        <el-tabs v-model="tab">
          <!-- 宿舍楼统计 -->
          <el-tab-pane label="🏢 宿舍楼统计" name="building">
            <el-row :gutter="16" style="margin-bottom:16px">
              <el-col :span="8" v-for="(b, idx) in buildingStats" :key="idx">
                <div style="background:linear-gradient(135deg,#e8f1fb,#dbe9fb);padding:20px;border-radius:12px">
                  <div style="font-size:16px;font-weight:700;color:#303133;margin-bottom:12px">🏢 {{ b.building }}</div>
                  <el-divider style="margin:8px 0" />
                  <div style="display:flex;justify-content:space-between;font-size:13px;color:#606266;margin:6px 0">
                    <span>房间数</span><span style="font-weight:600;color:#303133">{{ b.total }}</span>
                  </div>
                  <div style="display:flex;justify-content:space-between;font-size:13px;color:#606266;margin:6px 0">
                    <span>容量</span><span style="font-weight:600;color:#303133">{{ b.capacity }} 人</span>
                  </div>
                  <div style="display:flex;justify-content:space-between;font-size:13px;color:#606266;margin:6px 0">
                    <span>已入住</span><span style="font-weight:600;color:#f56c6c">{{ b.occupied }} 人</span>
                  </div>
                  <div style="display:flex;justify-content:space-between;font-size:13px;color:#606266;margin:6px 0">
                    <span>使用率</span><span style="font-weight:600;color:#3a7bd5">{{ b.usage }}</span>
                  </div>
                </div>
              </el-col>
            </el-row>
          </el-tab-pane>

          <!-- 宿舍列表 -->
          <el-tab-pane label="🛏 宿舍房间" name="room">
            <div class="panel">
              <div style="display:flex;gap:12px;margin-bottom:16px">
                <el-input v-model="filterRoom.keyword" placeholder="宿舍编号/楼栋" clearable style="width:240px" />
                <el-select v-model="filterRoom.gender" placeholder="性别" clearable style="width:120px">
                  <el-option label="男" value="男" /><el-option label="女" value="女" />
                </el-select>
                <el-select v-model="filterRoom.status" placeholder="状态" clearable style="width:120px">
                  <el-option label="使用中" value="使用中" /><el-option label="空闲" value="空闲" /><el-option label="维修中" value="维修中" />
                </el-select>
              </div>
              <el-table :data="filteredRooms" border stripe style="width:100%">
                <el-table-column prop="id" label="宿舍编号" width="130" />
                <el-table-column prop="building" label="楼栋" width="90" align="center" />
                <el-table-column prop="floor" label="楼层" width="80" align="center" />
                <el-table-column prop="roomNo" label="房间号" width="90" align="center" />
                <el-table-column prop="type" label="类型" width="90" align="center" />
                <el-table-column prop="capacity" label="容量" width="80" align="center" />
                <el-table-column prop="gender" label="性别" width="80" align="center" />
                <el-table-column prop="fee" label="费用(元)" width="100" align="center" />
                <el-table-column label="当前入住" width="120" align="center">
                  <template #default="s">
                    <el-tag size="small" :type="getOccupancy(s.row.id) >= s.row.capacity ? 'warning':'success'">
                      {{ getOccupancy(s.row.id) }}/{{ s.row.capacity }}
                    </el-tag>
                  </template>
                </el-table-column>
                <el-table-column prop="status" label="状态" width="90" align="center">
                  <template #default="s"><el-tag size="small" :type="s.row.status==='使用中'?'success':'info'">{{ s.row.status }}</el-tag></template>
                </el-table-column>
                <el-table-column label="操作" width="180" fixed="right">
                  <template #default="s">
                    <el-button size="small" @click="openEditRoom(s.row)">编辑</el-button>
                    <el-button size="small" type="danger" plain @click="confirmDeleteRoom(s.row)">删除</el-button>
                  </template>
                </el-table-column>
              </el-table>
            </div>
          </el-tab-pane>

          <!-- 住宿分配记录 -->
          <el-tab-pane label="👨‍🎓 住宿分配" name="alloc">
            <div class="panel">
              <div style="display:flex;gap:12px;margin-bottom:16px;align-items:center">
                <el-input v-model="filterAlloc.keyword" placeholder="学号/姓名/宿舍号" clearable style="width:280px" />
                <el-select v-model="filterAlloc.status" placeholder="全部状态" clearable style="width:140px">
                  <el-option label="在住" value="在住" /><el-option label="已退房" value="已退房" />
                </el-select>
                <el-tag effect="plain" type="info">在住 {{ livingCount }} 人</el-tag>
              </div>
              <el-table :data="filteredAllocs" border stripe style="width:100%">
                <el-table-column prop="studentId" label="学号" width="110" />
                <el-table-column prop="studentName" label="姓名" width="100" />
                <el-table-column prop="roomId" label="宿舍" width="140" />
                <el-table-column prop="checkIn" label="入住日期" width="120" align="center" />
                <el-table-column prop="checkOut" label="退房日期" width="120" align="center">
                  <template #default="s"><span v-if="s.row.checkOut">{{ s.row.checkOut }}</span><span v-else style="color:#c0c4cc">-</span></template>
                </el-table-column>
                <el-table-column prop="status" label="状态" width="100" align="center">
                  <template #default="s"><el-tag size="small" :type="s.row.status==='在住'?'success':'info'">{{ s.row.status }}</el-tag></template>
                </el-table-column>
                <el-table-column label="操作" width="180" fixed="right">
                  <template #default="s">
                    <el-button v-if="s.row.status==='在住'" size="small" type="warning" @click="checkOut(s.row)">退房</el-button>
                    <el-button size="small" type="danger" plain @click="confirmDeleteAlloc(s.row)">删除</el-button>
                  </template>
                </el-table-column>
              </el-table>
            </div>
          </el-tab-pane>
        </el-tabs>

        <!-- 宿舍新增/编辑对话框 -->
        <el-dialog v-model="roomDialog.show" :title="roomDialog.mode==='add'?'新增宿舍':'编辑宿舍'" width="620px">
          <el-form label-width="110px">
            <el-row :gutter="16">
              <el-col :span="12"><el-form-item label="宿舍编号"><el-input v-model="roomForm.id" :disabled="roomDialog.mode==='edit'" /></el-form-item></el-col>
              <el-col :span="12"><el-form-item label="楼栋"><el-input v-model="roomForm.building" placeholder="如 A栋" /></el-form-item></el-col>
              <el-col :span="8"><el-form-item label="楼层"><el-input-number v-model="roomForm.floor" :min="1" controls-position="right" style="width:100%" /></el-form-item></el-col>
              <el-col :span="8"><el-form-item label="房间号"><el-input v-model="roomForm.roomNo" /></el-form-item></el-col>
              <el-col :span="8"><el-form-item label="宿舍类型">
                <el-select v-model="roomForm.type" style="width:100%">
                  <el-option label="4人间" value="4人间" /><el-option label="6人间" value="6人间" /><el-option label="8人间" value="8人间" />
                </el-select>
              </el-form-item></el-col>
              <el-col :span="8"><el-form-item label="容量"><el-input-number v-model="roomForm.capacity" :min="1" :max="500" controls-position="right" style="width:100%" /></el-form-item></el-col>
              <el-col :span="8"><el-form-item label="性别">
                <el-radio-group v-model="roomForm.gender"><el-radio label="男">男</el-radio><el-radio label="女">女</el-radio></el-radio-group>
              </el-form-item></el-col>
              <el-col :span="8"><el-form-item label="住宿费"><el-input-number v-model="roomForm.fee" :min="0" controls-position="right" style="width:100%" /></el-form-item></el-col>
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

        <!-- 住宿分配对话框 -->
        <el-dialog v-model="allocDialog.show" title="办理入住" width="560px">
          <el-form label-width="110px">
            <el-form-item label="选择学生">
              <el-select v-model="allocForm.studentId" filterable style="width:100%" @change="onStudentChange">
                <el-option v-for="s in students" :key="s.id" :label="s.id + ' ' + s.name + ' (' + s.gender + ')' " :value="s.id" />
              </el-select>
            </el-form-item>
            <el-form-item label="选择宿舍">
              <el-select v-model="allocForm.roomId" filterable style="width:100%">
                <el-option v-for="r in availableRooms" :key="r.id" :label="r.id + ' ' + r.building + ' ' + r.roomNo + ' ' + r.gender + '生 ' + r.type + ' ' + getOccupancy(r.id) + '/' + r.capacity + '人'" :value="r.id" />
              </el-select>
            </el-form-item>
            <el-form-item label="入住日期">
              <el-input v-model="allocForm.checkIn" placeholder="如 2026-02-15" />
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
        tab: 'building',
        buildingStats: [],
        rooms: [], allocs: [], students: [],
        filterRoom: { keyword: '', gender: '', status: '' },
        filterAlloc: { keyword: '', status: '' },
        roomDialog: { show: false, mode: 'add' },
        roomForm: { id: '', building: '', floor: 1, roomNo: '', type: '4人间', capacity: 4, gender: '男', fee: 1200, status: '使用中' },
        allocDialog: { show: false },
        allocForm: { studentId: '', studentName: '', roomId: '', checkIn: Common.today() }
      };
    },
    computed: {
      filteredRooms() {
        const kw = this.filterRoom.keyword.trim();
        return this.rooms.filter(r => {
          if (kw && !r.id.includes(kw) && !r.building.includes(kw)) return false;
          if (this.filterRoom.gender && r.gender !== this.filterRoom.gender) return false;
          if (this.filterRoom.status && r.status !== this.filterRoom.status) return false;
          return true;
        });
      },
      filteredAllocs() {
        const kw = this.filterAlloc.keyword.trim();
        return this.allocs.filter(a => {
          if (kw && !a.studentName.includes(kw) && !(a.roomId || '').includes(kw) && !a.studentId.includes(kw)) return false;
          if (this.filterAlloc.status && a.status !== this.filterAlloc.status) return false;
          return true;
        });
      },
      availableRooms() {
        return this.rooms.filter(r => {
          if (r.capacity <= 0 || r.status !== '使用中') return false;
          if (getOccupancy(r.id) >= r.capacity) return false;
          return true;
        });
      },
      livingCount() {
        return this.allocs.filter(a => a.status === '在住').length;
      }
    },
    created() { this.load(); },
    methods: {
      getOccupancy(id) { return DormService.getRoomOccupancy(id); },
      async load() {
        this.rooms = await DormService.getRooms();
        this.allocs = await DormService.getAllocations();
        this.students = await UserService.getStudents();
        this.buildingStats = await DormService.getBuildingStats();
      },
      openAddRoom() {
        this.roomDialog.mode = 'add';
        this.roomForm = { id: 'D-' + Date.now().toString(36).toUpperCase(), building: '', floor: 1, roomNo: '', type: '4人间', capacity: 4, gender: '男', fee: 1200, status: '使用中' };
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
        ElementPlus.ElMessageBox.confirm('确定删除宿舍【' + row.id + '】？若有入住记录将无法删除', '删除确认', { type: 'warning' })
          .then(() => { DormService.deleteRoom(row.id); this.load(); }).catch(() => {});
      },
      openAllocate() {
        this.allocForm = { studentId: '', studentName: '', roomId: '', checkIn: Common.today() };
        this.allocDialog.show = true;
      },
      onStudentChange(id) {
        const s = this.students.find(x => x.id === id);
        if (s) this.allocForm.studentName = s.name;
      },
      async submitAlloc() {
        if (!this.allocForm.studentId || !this.allocForm.roomId) { Common.showMsg('请选择学生和宿舍', 'warning'); return; }
        // 性别匹配校验
        const student = this.students.find(s => s.id === this.allocForm.studentId);
        const room = this.rooms.find(r => r.id === this.allocForm.roomId);
        if (student && room && student.gender !== room.gender) {
          Common.showMsg('性别不匹配！该宿舍为' + room.gender + '生宿舍，无法分配给' + student.gender + '生', 'error');
          return;
        }
        await DormService.assignRoom(this.allocForm);
        await this.load(); this.allocDialog.show = false;
      },
      async checkOut(row) {
        try { await ElementPlus.ElMessageBox.confirm('确定为学生【' + row.studentName + '】办理退房？', '退房确认', { type: 'warning' }); await DormService.checkOut(row.id); await this.load(); } catch {}
      },
      confirmDeleteAlloc(row) {
        ElementPlus.ElMessageBox.confirm('确定删除分配记录？', '删除确认', { type: 'warning' })
          .then(() => { DormService.deleteAllocation(row.id); this.load(); }).catch(() => {});
      }
    }
  };

  // 暴露 getOccupancy 作为 helper
  const getOccupancy = (id) => DormService.getRoomOccupancy(id);

  global.DormPages = { PageDorm };
})(window);
