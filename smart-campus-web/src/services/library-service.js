/* ============================================================
 * 图书馆服务 library-service — 对接后端 REST API
 * 功能：书籍管理、借阅管理
 * ============================================================ */
(function (global) {
  var bookSample = [
    { id:'B001',isbn:'978-7-121-36541-1',title:'数据结构与算法分析',author:'Mark Allen Weiss',publisher:'电子工业出版社',category:'计算机',pubYear:2020,total:10,available:6,price:59.00,location:'A区-3架-5层' },
    { id:'B002',isbn:'978-7-111-54541-2',title:'深入理解计算机系统',author:'Randal E. Bryant',publisher:'机械工业出版社',category:'计算机',pubYear:2019,total:8,available:3,price:139.00,location:'A区-3架-3层' },
    { id:'B003',isbn:'978-7-04-039541-3',title:'高等数学（第七版）',author:'同济大学数学系',publisher:'高等教育出版社',category:'数学',pubYear:2014,total:30,available:18,price:45.50,location:'B区-1架-2层' },
    { id:'B004',isbn:'978-7-5135-32541-4',title:'新概念英语（新版）',author:'L.G. Alexander',publisher:'外语教学与研究出版社',category:'外语',pubYear:2018,total:20,available:12,price:38.00,location:'C区-1架-1层' },
    { id:'B005',isbn:'978-7-04-025841-5',title:'大学物理',author:'程守洙',publisher:'高等教育出版社',category:'物理',pubYear:2016,total:25,available:14,price:52.00,location:'B区-2架-4层' },
    { id:'B006',isbn:'978-7-302-24541-6',title:'经济学原理',author:'曼昆',publisher:'清华大学出版社',category:'经济',pubYear:2020,total:15,available:8,price:88.00,location:'D区-2架-2层' },
    { id:'B007',isbn:'978-7-115-51541-7',title:'人工智能：一种现代方法',author:'Stuart Russell',publisher:'人民邮电出版社',category:'计算机',pubYear:2021,total:6,available:2,price:168.00,location:'A区-5架-1层' },
    { id:'B008',isbn:'978-7-5086-42541-8',title:'红楼梦',author:'曹雪芹',publisher:'人民文学出版社',category:'文学',pubYear:2008,total:20,available:15,price:59.80,location:'E区-1架-3层' }
  ];
  var borrowSample = [
    { id:'BR001',bookId:'B001',bookTitle:'数据结构与算法分析',studentId:'2025001',studentName:'张明',borrowDate:'2026-01-10',dueDate:'2026-03-10',status:'借阅中' },
    { id:'BR002',bookId:'B002',bookTitle:'深入理解计算机系统',studentId:'2025003',studentName:'王浩然',borrowDate:'2026-01-08',dueDate:'2026-03-08',status:'借阅中' },
    { id:'BR003',bookId:'B003',bookTitle:'高等数学（第七版）',studentId:'2025002',studentName:'李思琪',borrowDate:'2025-12-15',dueDate:'2026-02-15',status:'已逾期' },
    { id:'BR004',bookId:'B004',bookTitle:'新概念英语（新版）',studentId:'2025004',studentName:'赵雅婷',borrowDate:'2026-01-12',dueDate:'2026-03-12',status:'借阅中' },
    { id:'BR005',bookId:'B007',bookTitle:'人工智能：一种现代方法',studentId:'2025007',studentName:'孙博文',borrowDate:'2026-01-05',dueDate:'2026-03-05',status:'借阅中' },
    { id:'BR006',bookId:'B008',bookTitle:'红楼梦',studentId:'2025010',studentName:'郑欣怡',borrowDate:'2025-11-20',dueDate:'2026-01-20',status:'已归还',returnDate:'2026-01-18' },
    { id:'BR007',bookId:'B005',bookTitle:'大学物理',studentId:'2025005',studentName:'陈俊杰',borrowDate:'2026-01-15',dueDate:'2026-03-15',status:'借阅中' }
  ];

  var LibraryService = {
    async getBooks() { try{return await apiClient.get('/books');}catch{return JSON.parse(localStorage.getItem('books')||'null')||bookSample;} },
    async addBook(b) {
      try{return await apiClient.post('/books',b);}
      catch{var list=JSON.parse(localStorage.getItem('books')||'null')||bookSample;if(list.some(function(x){return x.id===b.id;})){Common.showMsg('编号已存在','error');return false;}list.unshift(b);localStorage.setItem('books',JSON.stringify(list));Common.showMsg('添加成功');return true;}
    },
    async updateBook(b) {
      try{return await apiClient.put('/books/'+b.id,b);}
      catch{var list=JSON.parse(localStorage.getItem('books')||'null')||bookSample;var idx=list.findIndex(function(x){return x.id===b.id;});if(idx<0){Common.showMsg('不存在','error');return false;}list[idx]=Object.assign({},list[idx],b);localStorage.setItem('books',JSON.stringify(list));Common.showMsg('更新成功');return true;}
    },
    async deleteBook(id) { try{return await apiClient.del('/books/'+id);}catch{var list=(JSON.parse(localStorage.getItem('books')||'null')||bookSample).filter(function(x){return x.id!==id;});localStorage.setItem('books',JSON.stringify(list));Common.showMsg('删除成功');} },
    async getBorrows(par) { try{return await apiClient.get('/borrow-records',par||{});}catch{return JSON.parse(localStorage.getItem('borrows')||'null')||borrowSample;} },
    async borrowBook(body) {
      try{return await apiClient.post('/borrow-records',body);}
      catch{var list=JSON.parse(localStorage.getItem('borrows')||'null')||borrowSample;body.id='BR'+Date.now();body.borrowDate=Common.today();body.status='借阅中';list.unshift(body);localStorage.setItem('borrows',JSON.stringify(list));Common.showMsg('借阅成功');return true;}
    },
    async returnBook(id) {
      try{return await apiClient.put('/borrow-records/'+id+'/return');}
      catch{var list=JSON.parse(localStorage.getItem('borrows')||'null')||borrowSample;var idx=list.findIndex(function(x){return x.id===id;});if(idx>=0){list[idx].status='已归还';list[idx].returnDate=Common.today();localStorage.setItem('borrows',JSON.stringify(list));}Common.showMsg('归还成功');}
    },
    get categoryOptions() { return ['计算机','数学','物理','外语','经济','文学','艺术','历史','哲学']; }
  };
  global.LibraryService = LibraryService;
})(window);
