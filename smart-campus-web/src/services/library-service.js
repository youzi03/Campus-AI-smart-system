/* ============================================================
 * 图书馆服务 library-service
 * 功能：书籍管理、借阅管理、馆藏统计
 * ============================================================ */
(function (global) {

  const bookSample = [
    { id: 'B001', isbn: '978-7-121-36541-1', title: '数据结构与算法分析', author: 'Mark Allen Weiss', publisher: '电子工业出版社', category: '计算机', pubYear: 2020, total: 10, available: 6, price: 59.00, location: 'A区-3架-5层' },
    { id: 'B002', isbn: '978-7-111-54541-2', title: '深入理解计算机系统', author: 'Randal E. Bryant', publisher: '机械工业出版社', category: '计算机', pubYear: 2019, total: 8, available: 3, price: 139.00, location: 'A区-3架-3层' },
    { id: 'B003', isbn: '978-7-04-039541-3', title: '高等数学（第七版）', author: '同济大学数学系', publisher: '高等教育出版社', category: '数学', pubYear: 2014, total: 30, available: 18, price: 45.50, location: 'B区-1架-2层' },
    { id: 'B004', isbn: '978-7-5135-32541-4', title: '新概念英语（新版）', author: 'L.G. Alexander', publisher: '外语教学与研究出版社', category: '外语', pubYear: 2018, total: 20, available: 12, price: 38.00, location: 'C区-1架-1层' },
    { id: 'B005', isbn: '978-7-04-025841-5', title: '大学物理', author: '程守洙', publisher: '高等教育出版社', category: '物理', pubYear: 2016, total: 25, available: 14, price: 52.00, location: 'B区-2架-4层' },
    { id: 'B006', isbn: '978-7-302-24541-6', title: '经济学原理', author: '曼昆', publisher: '清华大学出版社', category: '经济', pubYear: 2020, total: 15, available: 8, price: 88.00, location: 'D区-2架-2层' },
    { id: 'B007', isbn: '978-7-115-51541-7', title: '人工智能：一种现代方法', author: 'Stuart Russell', publisher: '人民邮电出版社', category: '计算机', pubYear: 2021, total: 6, available: 2, price: 168.00, location: 'A区-5架-1层' },
    { id: 'B008', isbn: '978-7-5086-42541-8', title: '红楼梦', author: '曹雪芹', publisher: '人民文学出版社', category: '文学', pubYear: 2008, total: 20, available: 15, price: 59.80, location: 'E区-1架-3层' }
  ];

  const borrowSample = [
    { id: 'BR001', bookId: 'B001', bookTitle: '数据结构与算法分析', studentId: '2025001', studentName: '张明', borrowDate: '2026-01-10', dueDate: '2026-03-10', status: '借阅中' },
    { id: 'BR002', bookId: 'B002', bookTitle: '深入理解计算机系统', studentId: '2025003', studentName: '王浩然', borrowDate: '2026-01-08', dueDate: '2026-03-08', status: '借阅中' },
    { id: 'BR003', bookId: 'B003', bookTitle: '高等数学（第七版）', studentId: '2025002', studentName: '李思琪', borrowDate: '2025-12-15', dueDate: '2026-02-15', status: '已逾期' },
    { id: 'BR004', bookId: 'B004', bookTitle: '新概念英语（新版）', studentId: '2025004', studentName: '赵雅婷', borrowDate: '2026-01-12', dueDate: '2026-03-12', status: '借阅中' },
    { id: 'BR005', bookId: 'B007', bookTitle: '人工智能：一种现代方法', studentId: '2025007', studentName: '孙博文', borrowDate: '2026-01-05', dueDate: '2026-03-05', status: '借阅中' },
    { id: 'BR006', bookId: 'B008', bookTitle: '红楼梦', studentId: '2025010', studentName: '郑欣怡', borrowDate: '2025-11-20', dueDate: '2026-01-20', status: '已归还', returnDate: '2026-01-18' },
    { id: 'BR007', bookId: 'B005', bookTitle: '大学物理', studentId: '2025005', studentName: '陈俊杰', borrowDate: '2026-01-15', dueDate: '2026-03-15', status: '借阅中' }
  ];

  const categoryOptions = ['计算机', '数学', '物理', '外语', '经济', '文学', '艺术', '历史', '哲学'];

  const LibraryService = {
    getBooks() {
      const cached = localStorage.getItem('books');
      if (cached) return JSON.parse(cached);
      localStorage.setItem('books', JSON.stringify(bookSample));
      return bookSample;
    },
    saveBooks(list) { localStorage.setItem('books', JSON.stringify(list)); },
    addBook(b) {
      const list = this.getBooks();
      if (list.some(x => x.id === b.id)) { Common.showMsg('图书编号已存在', 'error'); return false; }
      if (b.available === undefined || b.available === null) b.available = b.total;
      list.unshift(b);
      this.saveBooks(list);
      Common.showMsg('新增图书成功：《' + b.title + '》');
      return true;
    },
    updateBook(b) {
      const list = this.getBooks();
      const idx = list.findIndex(x => x.id === b.id);
      if (idx < 0) { Common.showMsg('未找到该图书', 'error'); return false; }
      list[idx] = Object.assign({}, list[idx], b);
      this.saveBooks(list);
      Common.showMsg('图书信息更新成功');
      return true;
    },
    deleteBook(id) {
      const list = this.getBooks().filter(x => x.id !== id);
      this.saveBooks(list);
      Common.showMsg('删除图书成功');
    },

    // 借阅管理
    getBorrows() {
      const cached = localStorage.getItem('borrows');
      if (cached) return JSON.parse(cached);
      localStorage.setItem('borrows', JSON.stringify(borrowSample));
      return borrowSample;
    },
    saveBorrows(list) { localStorage.setItem('borrows', JSON.stringify(list)); },
    borrowBook(borrow) {
      const books = this.getBooks();
      const book = books.find(b => b.id === borrow.bookId);
      if (!book) { Common.showMsg('未找到该图书', 'error'); return false; }
      if (book.available <= 0) { Common.showMsg('该书暂无馆藏，无法借阅', 'warning'); return false; }
      const borrows = this.getBorrows();
      borrow.id = Common.uid('BR');
      borrow.borrowDate = Common.today();
      // 默认60天借阅期
      const due = new Date();
      due.setDate(due.getDate() + 60);
      borrow.dueDate = Common.formatDate(due);
      borrow.status = '借阅中';
      borrows.unshift(borrow);
      this.saveBorrows(borrows);
      // 更新馆藏
      book.available -= 1;
      this.saveBooks(books);
      Common.showMsg('借阅成功：' + borrow.studentName + ' 借阅《' + book.title + '》');
      return true;
    },
    returnBook(id) {
      const borrows = this.getBorrows();
      const item = borrows.find(b => b.id === id);
      if (!item) return;
      if (item.status === '已归还') { Common.showMsg('该书已归还', 'warning'); return; }
      item.status = '已归还';
      item.returnDate = Common.today();
      this.saveBorrows(borrows);
      // 恢复馆藏
      const books = this.getBooks();
      const book = books.find(b => b.id === item.bookId);
      if (book) { book.available += 1; this.saveBooks(books); }
      Common.showMsg(item.studentName + ' 已归还《' + item.bookTitle + '》');
    },
    renewBook(id) {
      const borrows = this.getBorrows();
      const item = borrows.find(b => b.id === id);
      if (!item || item.status !== '借阅中') { Common.showMsg('当前状态不可续借', 'warning'); return; }
      const due = new Date(item.dueDate);
      due.setDate(due.getDate() + 30);
      item.dueDate = Common.formatDate(due);
      this.saveBorrows(borrows);
      Common.showMsg('续借成功，新到期日：' + item.dueDate);
    },
    deleteBorrow(id) {
      const list = this.getBorrows().filter(b => b.id !== id);
      this.saveBorrows(list);
      Common.showMsg('已删除借阅记录');
    },

    /**
     * 馆藏统计：按分类统计图书数量
     */
    statByCategory() {
      const books = this.getBooks();
      const map = {};
      books.forEach(b => {
        if (!map[b.category]) map[b.category] = { category: b.category, total: 0, available: 0, kinds: 0 };
        map[b.category].total += Number(b.total || 0);
        map[b.category].available += Number(b.available || 0);
        map[b.category].kinds += 1;
      });
      return Object.values(map);
    },

    get categoryOptions() { return categoryOptions; }
  };

  global.LibraryService = LibraryService;
})(window);
