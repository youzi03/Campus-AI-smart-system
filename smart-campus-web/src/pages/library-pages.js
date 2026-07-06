/* ============================================================
 * 图书馆服务 library-service - 页面组件
 * 页面：书籍管理 / 借阅管理
 * ============================================================ */
(function (global) {

  // ========== 1. 书籍管理 ==========
  const PageLibraryBook = {
    template: `
      <div class="page-wrapper">
        <div class="page-header">
          <div>
            <div class="page-title">📚 书籍管理</div>
            <div class="page-desc">图书馆馆藏书籍信息维护</div>
          </div>
          <el-button type="primary" @click="openAdd">+ 新增书籍</el-button>
        </div>

        <el-row :gutter="16" style="margin-bottom:20px">
          <el-col :span="6"><div style="background:linear-gradient(135deg,#e8f1fb,#dbe9fb);padding:20px;border-radius:12px">
            <div style="font-size:13px;color:#606266">馆藏总数</div>
            <div style="font-size:28px;font-weight:700;color:#303133">{{ totalCount }}</div>
          </div></el-col>
          <el-col :span="6"><div style="background:linear-gradient(135deg,#e6f9f7,#d9f2e6);padding:20px;border-radius:12px">
            <div style="font-size:13px;color:#606266">可借册数</div>
            <div style="font-size:28px;font-weight:700;color:#67c23a">{{ availableCount }}</div>
          </div></el-col>
          <el-col :span="6"><div style="background:linear-gradient(135deg,#fef4e6,#fde8cd);padding:20px;border-radius:12px">
            <div style="font-size:13px;color:#606266">书种类别</div>
            <div style="font-size:28px;font-weight:700;color:#e6a23c">{{ books.length }}</div>
          </div></el-col>
          <el-col :span="6"><div style="background:linear-gradient(135deg,#f5f0ff,#e8dbf5);padding:20px;border-radius:12px">
            <div style="font-size:13px;color:#606266">借阅中</div>
            <div style="font-size:28px;font-weight:700;color:#8b5cf6">{{ borrowedCount }}</div>
          </div></el-col>
        </el-row>

        <div class="panel">
          <div style="display:flex;gap:12px;margin-bottom:16px;align-items:center">
            <el-input v-model="filter.keyword" placeholder="书名/作者/ISBN/编号" clearable style="width:280px" />
            <el-select v-model="filter.category" placeholder="全部分类" clearable style="width:160px">
              <el-option v-for="c in categories" :key="c" :label="c" :value="c" />
            </el-select>
          </div>
          <el-table :data="filteredBooks" border stripe style="width:100%">
            <el-table-column prop="id" label="编号" width="90" />
            <el-table-column prop="title" label="书名" min-width="220" />
            <el-table-column prop="author" label="作者" width="120" />
            <el-table-column prop="publisher" label="出版社" width="160" />
            <el-table-column prop="category" label="分类" width="100" />
            <el-table-column prop="pubYear" label="出版年份" width="110" align="center" />
            <el-table-column prop="isbn" label="ISBN" width="180" />
            <el-table-column label="库存/可借" width="120" align="center">
              <template #default="s">
                <el-tag size="small" :type="s.row.available > 0 ? 'success':'danger'">{{ s.row.available }}/{{ s.row.total }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="price" label="单价" width="100" align="center" />
            <el-table-column prop="location" label="馆藏位置" width="140" />
            <el-table-column label="操作" width="220" fixed="right">
              <template #default="s">
                <el-button size="small" type="success" plain @click="quickBorrow(s.row)" :disabled="s.row.available <= 0">借阅</el-button>
                <el-button size="small" @click="openEdit(s.row)">编辑</el-button>
                <el-button size="small" type="danger" plain @click="confirmDelete(s.row)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </div>

        <el-dialog v-model="dialog.show" :title="dialog.mode==='add'?'新增书籍':'编辑书籍'" width="720px">
          <el-form label-width="110px">
            <el-row :gutter="16">
              <el-col :span="12"><el-form-item label="书籍编号"><el-input v-model="form.id" :disabled="dialog.mode==='edit'" /></el-form-item></el-col>
              <el-col :span="12"><el-form-item label="ISBN"><el-input v-model="form.isbn" /></el-form-item></el-col>
            </el-row>
            <el-form-item label="书名"><el-input v-model="form.title" /></el-form-item>
            <el-row :gutter="16">
              <el-col :span="12"><el-form-item label="作者"><el-input v-model="form.author" /></el-form-item></el-col>
              <el-col :span="12"><el-form-item label="出版社"><el-input v-model="form.publisher" /></el-form-item></el-col>
            </el-row>
            <el-row :gutter="16">
              <el-col :span="8"><el-form-item label="分类">
                <el-select v-model="form.category" style="width:100%">
                  <el-option v-for="c in categories" :key="c" :label="c" :value="c" />
                </el-select>
              </el-form-item></el-col>
              <el-col :span="8"><el-form-item label="出版年份"><el-input-number v-model.number="form.pubYear" :min="1900" :max="2100" style="width:100%" /></el-form-item></el-col>
              <el-col :span="8"><el-form-item label="单价(元)"><el-input-number v-model.number="form.price" :min="0" :precision="2" style="width:100%" /></el-form-item></el-col>
            </el-row>
            <el-row :gutter="16">
              <el-col :span="8"><el-form-item label="总册数"><el-input-number v-model.number="form.total" :min="1" style="width:100%" /></el-form-item></el-col>
              <el-col :span="8"><el-form-item label="可借册数"><el-input-number v-model.number="form.available" :min="0" style="width:100%" /></el-form-item></el-col>
              <el-col :span="8"><el-form-item label="馆藏位置"><el-input v-model="form.location" placeholder="如 A区-3架-5层" /></el-form-item></el-col>
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
        books: [], borrows: [],
        categories: LibraryService.categoryOptions,
        filter: { keyword: '', category: '' },
        dialog: { show: false, mode: 'add' },
        form: { id: '', isbn: '', title: '', author: '', publisher: '', category: '计算机', pubYear: 2023, total: 5, available: 5, price: 49.0, location: '' }
      };
    },
    computed: {
      totalCount() { return this.books.reduce((sum, b) => sum + Number(b.total || 0), 0); },
      availableCount() { return this.books.reduce((sum, b) => sum + Number(b.available || 0), 0); },
      borrowedCount() { return this.borrows.filter(b => b.status === '借阅中').length; },
      filteredBooks() {
        const kw = this.filter.keyword.trim();
        return this.books.filter(b => {
          if (kw && !b.title.includes(kw) && !(b.author || '').includes(kw) && !(b.isbn || '').includes(kw) && !b.id.includes(kw)) return false;
          if (this.filter.category && b.category !== this.filter.category) return false;
          return true;
        });
      }
    },
    created() { this.load(); },
    methods: {
      load() {
        this.books = LibraryService.getBooks();
        this.borrows = LibraryService.getBorrows();
      },
      openAdd() {
        this.dialog.mode = 'add';
        this.form = { id: '', isbn: '', title: '', author: '', publisher: '', category: '计算机', pubYear: 2023, total: 5, available: 5, price: 49.0, location: '' };
        this.dialog.show = true;
      },
      openEdit(row) { this.dialog.mode = 'edit'; this.form = Object.assign({}, row); this.dialog.show = true; },
      submit() {
        if (!this.form.id || !this.form.title) { Common.showMsg('编号和书名必填', 'warning'); return; }
        if (this.dialog.mode === 'add') LibraryService.addBook(this.form);
        else LibraryService.updateBook(this.form);
        this.load(); this.dialog.show = false;
      },
      confirmDelete(row) {
        ElementPlus.ElMessageBox.confirm('确定删除《' + row.title + '》？', '删除确认', { type: 'warning' })
          .then(() => { LibraryService.deleteBook(row.id); this.load(); }).catch(() => {});
      },
      quickBorrow(book) {
        const students = UserService.getStudents();
        const student = students[0] || {};
        // 弹出选择学生的小表单
        ElementPlus.ElMessageBox.prompt(
          '请输入借阅学生姓名（默认：' + student.name + '）',
          '办理借阅《' + book.title + '》',
          { confirmButtonText: '确认借阅', cancelButtonText: '取消', inputValue: student.name }
        ).then(({ value }) => {
          const s = students.find(x => x.name === value) || students[0];
          if (!s) { Common.showMsg('未找到学生', 'error'); return; }
          LibraryService.borrowBook({ studentId: s.id, studentName: s.name, bookId: book.id, bookTitle: book.title });
          this.load();
        }).catch(() => {});
      }
    }
  };

  // ========== 2. 借阅管理 ==========
  const PageLibraryBorrow = {
    template: `
      <div class="page-wrapper">
        <div class="page-header">
          <div>
            <div class="page-title">📖 借阅管理</div>
            <div class="page-desc">管理图书馆图书的借阅、续借与归还</div>
          </div>
          <el-button type="primary" @click="openBorrow">+ 办理借阅</el-button>
        </div>

        <el-row :gutter="16" style="margin-bottom:20px">
          <el-col :span="6"><div style="background:linear-gradient(135deg,#e8f1fb,#dbe9fb);padding:20px;border-radius:12px">
            <div style="font-size:13px;color:#606266">总借阅记录</div>
            <div style="font-size:28px;font-weight:700;color:#303133">{{ borrows.length }}</div>
          </div></el-col>
          <el-col :span="6"><div style="background:linear-gradient(135deg,#e6f9f7,#d9f2e6);padding:20px;border-radius:12px">
            <div style="font-size:13px;color:#606266">借阅中</div>
            <div style="font-size:28px;font-weight:700;color:#67c23a">{{ livingCount }}</div>
          </div></el-col>
          <el-col :span="6"><div style="background:linear-gradient(135deg,#fef0f0,#fde2e2);padding:20px;border-radius:12px">
            <div style="font-size:13px;color:#606266">逾期未还</div>
            <div style="font-size:28px;font-weight:700;color:#f56c6c">{{ overdueCount }}</div>
          </div></el-col>
          <el-col :span="6"><div style="background:linear-gradient(135deg,#f5f0ff,#e8dbf5);padding:20px;border-radius:12px">
            <div style="font-size:13px;color:#606266">已归还</div>
            <div style="font-size:28px;font-weight:700;color:#8b5cf6">{{ returnedCount }}</div>
          </div></el-col>
        </el-row>

        <div class="panel">
          <div style="display:flex;gap:12px;margin-bottom:16px;align-items:center">
            <el-input v-model="filter.keyword" placeholder="学生姓名/书名" clearable style="width:260px" />
            <el-select v-model="filter.status" placeholder="全部状态" clearable style="width:140px">
              <el-option label="借阅中" value="借阅中" />
              <el-option label="已逾期" value="已逾期" />
              <el-option label="已归还" value="已归还" />
            </el-select>
          </div>
          <el-table :data="filteredBorrows" border stripe style="width:100%">
            <el-table-column prop="studentId" label="学号" width="110" />
            <el-table-column prop="studentName" label="姓名" width="100" />
            <el-table-column prop="bookTitle" label="书名" min-width="220" />
            <el-table-column prop="borrowDate" label="借阅日期" width="120" align="center" />
            <el-table-column prop="dueDate" label="应还日期" width="120" align="center" />
            <el-table-column prop="returnDate" label="归还日期" width="120" align="center">
              <template #default="s"><span v-if="s.row.returnDate">{{ s.row.returnDate }}</span><span v-else style="color:#c0c4cc">-</span></template>
            </el-table-column>
            <el-table-column label="状态" width="110" align="center">
              <template #default="s">
                <el-tag size="small" :type="s.row.status==='已归还'?'success':(s.row.status==='已逾期'?'danger':'warning')">{{ s.row.status }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="220" fixed="right">
              <template #default="s">
                <el-button v-if="s.row.status !== '已归还'" size="small" type="success" @click="returnBook(s.row)">归还</el-button>
                <el-button v-if="s.row.status === '借阅中'" size="small" type="warning" @click="renewBook(s.row)">续借</el-button>
                <el-button size="small" type="danger" plain @click="confirmDelete(s.row)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </div>

        <el-dialog v-model="dialog.show" title="办理借阅" width="560px">
          <el-form label-width="110px">
            <el-form-item label="选择学生">
              <el-select v-model="form.studentId" filterable style="width:100%" @change="onStudentChange">
                <el-option v-for="s in students" :key="s.id" :label="s.id + ' ' + s.name" :value="s.id" />
              </el-select>
            </el-form-item>
            <el-form-item label="选择书籍">
              <el-select v-model="form.bookId" filterable style="width:100%" @change="onBookChange">
                <el-option v-for="b in availableBooks" :key="b.id" :label="b.id + ' 《' + b.title + '》 (' + b.available + '/' + b.total + '可借)" :value="b.id" />
              </el-select>
            </el-form-item>
            <el-form-item label="借阅日期">
              <el-input v-model="form.borrowDate" placeholder="如 2026-02-15" />
            </el-form-item>
            <el-form-item label="借阅说明">
              <el-input v-model="form.remark" type="textarea" :rows="3" placeholder="备注信息（可选）" />
            </el-form-item>
          </el-form>
          <template #footer>
            <el-button @click="dialog.show=false">取消</el-button>
            <el-button type="primary" @click="submitBorrow">确认借阅 (60天)</el-button>
          </template>
        </el-dialog>
      </div>
    `,
    data() {
      return {
        borrows: [], books: [], students: [],
        filter: { keyword: '', status: '' },
        dialog: { show: false },
        form: { studentId: '', studentName: '', bookId: '', bookTitle: '', borrowDate: Common.today(), remark: '' }
      };
    },
    computed: {
      livingCount() { return this.borrows.filter(b => b.status === '借阅中').length; },
      overdueCount() { return this.borrows.filter(b => b.status === '已逾期').length; },
      returnedCount() { return this.borrows.filter(b => b.status === '已归还').length; },
      availableBooks() { return this.books.filter(b => b.available > 0); },
      filteredBorrows() {
        const kw = this.filter.keyword.trim();
        return this.borrows.filter(b => {
          if (kw && !b.studentName.includes(kw) && !b.bookTitle.includes(kw) && !b.studentId.includes(kw)) return false;
          if (this.filter.status && b.status !== this.filter.status) return false;
          return true;
        });
      }
    },
    created() { this.load(); },
    methods: {
      load() {
        this.borrows = LibraryService.getBorrows();
        this.books = LibraryService.getBooks();
        this.students = UserService.getStudents();
      },
      openBorrow() {
        this.form = { studentId: '', studentName: '', bookId: '', bookTitle: '', borrowDate: Common.today(), remark: '' };
        this.dialog.show = true;
      },
      onStudentChange(id) { const s = this.students.find(x => x.id === id); if (s) this.form.studentName = s.name; },
      onBookChange(id) { const b = this.books.find(x => x.id === id); if (b) this.form.bookTitle = b.title; },
      submitBorrow() {
        if (!this.form.studentId || !this.form.bookId) { Common.showMsg('请选择学生和书籍', 'warning'); return; }
        LibraryService.borrowBook(this.form);
        this.load(); this.dialog.show = false;
      },
      returnBook(row) {
        ElementPlus.ElMessageBox.confirm('确定：' + row.studentName + ' 归还《' + row.bookTitle + '》？', '确认归还', { type: 'info' })
          .then(() => { LibraryService.returnBook(row.id); this.load(); }).catch(() => {});
      },
      renewBook(row) { LibraryService.renewBook(row.id); this.load(); },
      confirmDelete(row) {
        ElementPlus.ElMessageBox.confirm('确定删除该借阅记录？注意：此操作不会影响书籍库存数量', '删除确认', { type: 'warning' })
          .then(() => { LibraryService.deleteBorrow(row.id); this.load(); }).catch(() => {});
      }
    }
  };

  global.LibraryPages = { PageLibraryBook, PageLibraryBorrow };
})(window);
