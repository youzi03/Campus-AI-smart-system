/* ============================================================
 * 公告服务 notice-service - 页面组件
 * 页面：公告列表 / 发布公告 / 预警消息
 * ============================================================ */
(function (global) {

  // ========== 1. 公告列表 ==========
  const PageNoticeList = {
    template: `
      <div class="page-wrapper">
        <div class="page-header">
          <div>
            <div class="page-title">公告管理</div>
            <div class="page-desc">查看、编辑、置顶和删除所有系统公告</div>
          </div>
          <div style="display:flex;gap:10px">
          </div>
        </div>
        <div class="panel">
          <div style="display:flex;gap:12px;margin-bottom:16px">
            <el-input v-model="filter.keyword" placeholder="搜索标题..." clearable style="width:240px" />
            <el-select v-model="filter.type" placeholder="全部类型" clearable style="width:140px">
              <el-option label="重要" value="重要" />
              <el-option label="通知" value="通知" />
              <el-option label="预警" value="预警" />
            </el-select>
            <el-tag effect="plain" type="info">共 {{ filteredList.length }} 条</el-tag>
          </div>
          <el-table :data="pagedList" border stripe style="width:100%">
            <el-table-column label="类型" width="90" align="center">
              <template #default="s"><el-tag size="small" :type="typeTag(s.row.type)">{{ s.row.type }}</el-tag></template>
            </el-table-column>
            <el-table-column label="置顶" width="70" align="center">
              <template #default="s">
                <el-tag v-if="s.row.pinned" type="warning" size="small">📌</el-tag>
                <span v-else style="color:#c0c4cc">-</span>
              </template>
            </el-table-column>
            <el-table-column prop="title" label="标题" min-width="260" />
            <el-table-column prop="target" label="接收对象" width="160" />
            <el-table-column prop="publisher" label="发布方" width="120" />
            <el-table-column prop="createAt" label="发布日期" width="120" align="center" />
            <el-table-column prop="views" label="浏览量" width="90" align="center" />
            <el-table-column label="操作" width="280" fixed="right">
              <template #default="s">
                <el-button size="small" @click="showDetail(s.row)">查看</el-button>
                <el-button size="small" type="warning" plain @click="togglePin(s.row)">{{ s.row.pinned ? '取消置顶' : '置顶' }}</el-button>
                <el-button size="small" @click="openEdit(s.row)">编辑</el-button>
                <el-button size="small" type="success" plain @click="pushNotice(s.row)">推送</el-button>
                <el-button size="small" type="danger" plain @click="confirmDelete(s.row)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
          <div style="display:flex;justify-content:flex-end;margin-top:16px">
            <el-pagination v-model:current-page="page.current" v-model:page-size="page.size"
              :page-sizes="[10,20,30,50]" layout="total, sizes, prev, pager, next, jumper" :total="filteredList.length" />
          </div>
        </div>

        <el-dialog v-model="detail.show" :title="detail.title" width="620px">
          <div style="line-height:1.9;font-size:14px;color:#606266">
            <div style="margin-bottom:12px;display:flex;gap:12px;align-items:center;flex-wrap:wrap">
              <el-tag :type="typeTag(detail.type)" size="small">{{ detail.type }}</el-tag>
              <span>📢 {{ detail.publisher }}</span>
              <span>👥 {{ detail.target }}</span>
              <span>📅 {{ detail.createAt }}</span>
              <span>👁 {{ detail.views }} 浏览</span>
              <el-tag v-if="detail.pinned" type="warning" size="small">📌 置顶</el-tag>
            </div>
            <el-divider />
            <div style="white-space:pre-wrap;color:#303133;line-height:2">{{ detail.content }}</div>
          </div>
          <template #footer>
            <el-button type="primary" @click="detail.show=false">关闭</el-button>
          </template>
        </el-dialog>

        <el-dialog v-model="dialog.show" title="编辑公告" width="620px">
          <el-form label-width="100px">
            <el-form-item label="类型">
              <el-radio-group v-model="form.type">
                <el-radio label="通知">通知</el-radio>
                <el-radio label="重要">重要</el-radio>
                <el-radio label="预警">预警</el-radio>
              </el-radio-group>
            </el-form-item>
            <el-form-item label="标题"><el-input v-model="form.title" placeholder="请输入公告标题" maxlength="80" /></el-form-item>
            <el-row :gutter="16">
              <el-col :span="12"><el-form-item label="接收对象"><el-input v-model="form.target" placeholder="如：全体师生/某学院" /></el-form-item></el-col>
              <el-col :span="12"><el-form-item label="发布方"><el-input v-model="form.publisher" placeholder="如：教务处" /></el-form-item></el-col>
            </el-row>
            <el-form-item label="正文">
              <el-input v-model="form.content" type="textarea" :rows="6" placeholder="请输入公告内容" />
            </el-form-item>
            <el-form-item label="置顶">
              <el-switch v-model="form.pinned" />
            </el-form-item>
          </el-form>
          <template #footer>
            <el-button @click="dialog.show=false">取消</el-button>
            <el-button type="primary" @click="submit">发布</el-button>
          </template>
        </el-dialog>
      </div>
    `,
    data() {
      return {
        list: [],
        filter: { keyword: '', type: '' },
        page: { current: 1, size: 10 },
        dialog: { show: false },
        form: { id: '', title: '', type: '通知', target: '全体师生', publisher: '教务处', content: '', pinned: false },
        detail: { show: false, title: '', type: '', target: '', publisher: '', createAt: '', views: 0, content: '', pinned: false }
      };
    },
    computed: {
      filteredList() {
        const kw = this.filter.keyword.trim();
        return this.list.slice().sort((a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0)).filter(n => {
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
      async load() { this.list = await NoticeService.getNotices(); },
      typeTag(t) { return t === '重要' ? 'danger' : (t === '预警' ? 'warning' : 'primary'); },
      showDetail(row) {
        row.views = (row.views || 0) + 1;
        localStorage.setItem('notices', JSON.stringify(this.list));
        this.detail = Object.assign({ show: true }, row);
      },
      openEdit(row) { this.form = Object.assign({}, row); this.dialog.show = true; },
      async submit() {
        if (!this.form.title || !this.form.content) { Common.showMsg('标题和内容不能为空', 'warning'); return; }
        await NoticeService.updateNotice(this.form);
        await this.load();
        this.dialog.show = false;
      },
      async togglePin(row) { await NoticeService.togglePin(row.id); await this.load(); },
      pushNotice(row) { Common.showMsg('推送成功'); },
      async confirmDelete(row) {
        try {
          await ElementPlus.ElMessageBox.confirm('确定删除【' + row.title + '】？', '确认', { type: 'warning' });
          await NoticeService.deleteNotice(row.id);
          await this.load();
        } catch {}
      }
    }
  };

  // ========== 2. 发布公告 ==========
  const PageNoticePublish = {
    template: `
      <div class="page-wrapper">
        <div class="page-header">
          <div>
            <div class="page-title">发布公告</div>
            <div class="page-desc">快速发布校园通知和公告</div>
          </div>
        </div>
        <div class="panel" style="max-width:800px">
          <el-form :model="form" label-width="100px">
            <el-form-item label="公告类型">
              <el-radio-group v-model="form.type">
                <el-radio label="通知">📢 通知</el-radio>
                <el-radio label="重要">❗ 重要</el-radio>
                <el-radio label="预警">⚠️ 预警</el-radio>
              </el-radio-group>
            </el-form-item>
            <el-form-item label="标题">
              <el-input v-model="form.title" placeholder="请输入公告标题" maxlength="80" />
            </el-form-item>
            <el-row :gutter="16">
              <el-col :span="12"><el-form-item label="接收对象"><el-input v-model="form.target" placeholder="如：全体师生" /></el-form-item></el-col>
              <el-col :span="12"><el-form-item label="发布方"><el-input v-model="form.publisher" placeholder="如：教务处" /></el-form-item></el-col>
            </el-row>
            <el-form-item label="正文">
              <el-input v-model="form.content" type="textarea" :rows="8" placeholder="请输入公告详细内容..." />
            </el-form-item>
            <el-form-item label="置顶">
              <el-switch v-model="form.pinned" active-text="置顶显示" inactive-text="普通显示" />
            </el-form-item>
            <el-form-item label="发布日期">
              <span style="color:#606266">📅 {{ form.createAt }}</span>
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="submit">📤 立即发布</el-button>
              <el-button @click="preview">👁 预览</el-button>
              <el-button plain @click="reset">🔄 重置</el-button>
            </el-form-item>
          </el-form>
        </div>

        <el-dialog v-model="preview.show" title="公告预览" width="620px">
          <div style="padding:8px">
            <div style="display:flex;gap:10px;margin-bottom:12px;align-items:center;flex-wrap:wrap">
              <el-tag :type="typeTag(form.type)" size="small">{{ form.type }}</el-tag>
              <span style="color:#606266;font-size:13px">📢 {{ form.publisher }}</span>
              <span style="color:#606266;font-size:13px">👥 {{ form.target }}</span>
              <span style="color:#606266;font-size:13px">📅 {{ form.createAt }}</span>
              <el-tag v-if="form.pinned" type="warning" size="small">📌 置顶</el-tag>
            </div>
            <h2 style="margin:0 0 16px 0;font-size:22px;color:#303133;line-height:1.6">{{ form.title || '(未填写标题)' }}</h2>
            <el-divider />
            <div style="line-height:2;color:#606266;white-space:pre-wrap">{{ form.content || '(未填写内容)' }}</div>
          </div>
        </el-dialog>
      </div>
    `,
    data() {
      return {
        form: { id: 'N' + Date.now(), title: '', type: '通知', target: '全体师生', publisher: '教务处', content: '', pinned: false, createAt: Common.today() },
        preview: { show: false }
      };
    },
    methods: {
      typeTag(t) { return t === '重要' ? 'danger' : (t === '预警' ? 'warning' : 'primary'); },
      submit() {
        if (!this.form.title || !this.form.content) { Common.showMsg('请填写标题和内容', 'warning'); return; }
        NoticeService.addNotice(Object.assign({}, this.form));
        Common.showMsg('公告发布成功');
        this.reset();
      },
      preview() { this.preview.show = true; },
      reset() {
        this.form = { id: 'N' + Date.now(), title: '', type: '通知', target: '全体师生', publisher: '教务处', content: '', pinned: false, createAt: Common.today() };
      }
    }
  };

  // ========== 3. 预警消息 ==========
  const PageNoticeWarning = {
    template: `
      <div class="page-wrapper">
        <div class="page-header">
          <div>
            <div class="page-title">预警消息</div>
            <div class="page-desc">管理和查看系统产生的各类预警消息（学业、安全、系统等）</div>
          </div>
          <div style="display:flex;gap:10px">
            <el-button type="warning" @click="generateFromScore">📊 根据成绩生成预警</el-button>
            <el-button type="danger" plain @click="sendAllWarnings">📨 推送所有未读预警</el-button>
          </div>
        </div>

        <el-row :gutter="16" style="margin-bottom:20px">
          <el-col :span="8"><div style="background:linear-gradient(135deg,#fef0f0,#fde2e2);padding:20px;border-radius:12px">
            <div style="font-size:13px;color:#606266">总预警数</div>
            <div style="font-size:28px;font-weight:700;color:#f56c6c">{{ warnings.length }}</div>
          </div></el-col>
          <el-col :span="8"><div style="background:linear-gradient(135deg,#fef4e6,#fde8cd);padding:20px;border-radius:12px">
            <div style="font-size:13px;color:#606266">未读预警</div>
            <div style="font-size:28px;font-weight:700;color:#e6a23c">{{ unreadCount }}</div>
          </div></el-col>
          <el-col :span="8"><div style="background:linear-gradient(135deg,#e8f1fb,#dbe9fb);padding:20px;border-radius:12px">
            <div style="font-size:13px;color:#606266">已推送</div>
            <div style="font-size:28px;font-weight:700;color:#3a7bd5">{{ pushedCount }}</div>
          </div></el-col>
        </el-row>

        <div class="panel">
          <el-table :data="warnings" border stripe style="width:100%">
            <el-table-column label="类型" width="100" align="center">
              <template #default="s"><el-tag size="small" type="warning">⚠️ 预警</el-tag></template>
            </el-table-column>
            <el-table-column prop="title" label="标题" min-width="240" />
            <el-table-column prop="target" label="接收对象" width="160" />
            <el-table-column prop="publisher" label="发布方" width="120" />
            <el-table-column prop="createAt" label="日期" width="120" align="center" />
            <el-table-column label="状态" width="110" align="center">
              <template #default="s">
                <el-tag size="small" :type="s.row.pushed ? 'success' : 'warning'">{{ s.row.pushed ? '已推送' : '未推送' }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="220">
              <template #default="s">
                <el-button size="small" @click="showDetail(s.row)">查看</el-button>
                <el-button size="small" type="success" plain v-if="!s.row.pushed" @click="pushOne(s.row)">推送</el-button>
                <el-button size="small" type="danger" plain @click="confirmDelete(s.row)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </div>

        <el-dialog v-model="detail.show" :title="detail.title" width="620px">
          <div style="line-height:2">
            <div style="margin-bottom:12px;display:flex;gap:12px;align-items:center;color:#606266;font-size:13px;flex-wrap:wrap">
              <el-tag size="small" type="warning">⚠️ 预警</el-tag>
              <span>📢 {{ detail.publisher }}</span>
              <span>👥 {{ detail.target }}</span>
              <span>📅 {{ detail.createAt }}</span>
            </div>
            <el-divider />
            <div style="white-space:pre-wrap;color:#303133">{{ detail.content }}</div>
          </div>
        </el-dialog>
      </div>
    `,
    data() {
      return { list: [], detail: { show: false, title: '', type: '', target: '', publisher: '', createAt: '', content: '' } };
    },
    computed: {
      warnings() { return this.list.filter(n => n.type === '预警'); },
      unreadCount() { return this.warnings.filter(n => !n.pushed).length; },
      pushedCount() { return this.warnings.filter(n => n.pushed).length; }
    },
    created() { this.load(); },
    methods: {
      async load() { this.list = await NoticeService.getNotices(); },
      showDetail(row) {
        row.views = (row.views || 0) + 1;
        localStorage.setItem('notices', JSON.stringify(this.list));
        this.detail = Object.assign({ show: true }, row);
      },
      pushOne(row) {
        NoticeService.pushNotice(row.id);
        this.load();
      },
      sendAllWarnings() {
        const pending = this.warnings.filter(n => !n.pushed);
        if (!pending.length) { Common.showMsg('没有未推送的预警消息', 'info'); return; }
        ElementPlus.ElMessageBox.confirm('将推送 ' + pending.length + ' 条预警消息，确认继续？', '推送预警', { type: 'warning' })
          .then(() => {
            pending.forEach(n => NoticeService.pushNotice(n.id));
            this.load();
            Common.showMsg('已推送所有预警消息');
          }).catch(() => {});
      },
      generateFromScore() { NoticeService.generateWarning(); this.load(); },
      confirmDelete(row) {
        ElementPlus.ElMessageBox.confirm('确定删除预警【' + row.title + '】？', '删除确认', { type: 'warning' })
          .then(() => { NoticeService.deleteNotice(row.id); this.load(); }).catch(() => {});
      }
    }
  };

  global.NoticePages = { PageNoticeList, PageNoticePublish, PageNoticeWarning };
})(window);
