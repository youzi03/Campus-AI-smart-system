/* ============================================================
 * 宿舍服务 dorm-service
 * 功能：宿舍录入、查询、住宿分配管理
 * ============================================================ */
(function (global) {

  // 宿舍基本信息
  const dormRoomSample = [
    { id: 'D-A1-302', building: 'A栋', floor: 3, roomNo: '302', type: '4人间', capacity: 4, gender: '男', fee: 1200, status: '使用中' },
    { id: 'D-A1-305', building: 'A栋', floor: 3, roomNo: '305', type: '4人间', capacity: 4, gender: '男', fee: 1200, status: '使用中' },
    { id: 'D-A1-201', building: 'A栋', floor: 2, roomNo: '201', type: '4人间', capacity: 4, gender: '男', fee: 1200, status: '使用中' },
    { id: 'D-B2-205', building: 'B栋', floor: 2, roomNo: '205', type: '4人间', capacity: 4, gender: '女', fee: 1200, status: '使用中' },
    { id: 'D-B2-401', building: 'B栋', floor: 4, roomNo: '401', type: '4人间', capacity: 4, gender: '女', fee: 1200, status: '使用中' },
    { id: 'D-B2-502', building: 'B栋', floor: 5, roomNo: '502', type: '4人间', capacity: 4, gender: '女', fee: 1200, status: '使用中' },
    { id: 'D-C3-102', building: 'C栋', floor: 1, roomNo: '102', type: '6人间', capacity: 6, gender: '男', fee: 900, status: '使用中' },
    { id: 'D-C3-204', building: 'C栋', floor: 2, roomNo: '204', type: '6人间', capacity: 6, gender: '男', fee: 900, status: '使用中' },
    { id: 'D-D4-303', building: 'D栋', floor: 3, roomNo: '303', type: '4人间', capacity: 4, gender: '女', fee: 1200, status: '使用中' },
    { id: 'D-D4-501', building: 'D栋', floor: 5, roomNo: '501', type: '4人间', capacity: 4, gender: '女', fee: 1200, status: '空闲' }
  ];

  // 住宿分配
  const allocationSample = [
    { id: 'AL001', roomId: 'D-A1-302', studentId: '2025001', studentName: '张明', checkIn: '2025-09-01', status: '在住' },
    { id: 'AL002', roomId: 'D-A1-305', studentId: '2025003', studentName: '王浩然', checkIn: '2025-09-02', status: '在住' },
    { id: 'AL003', roomId: 'D-A1-201', studentId: '2025007', studentName: '孙博文', checkIn: '2025-09-06', status: '在住' },
    { id: 'AL004', roomId: 'D-B2-205', studentId: '2025002', studentName: '李思琪', checkIn: '2025-09-01', status: '在住' },
    { id: 'AL005', roomId: 'D-B2-401', studentId: '2025004', studentName: '赵雅婷', checkIn: '2025-09-03', status: '在住' },
    { id: 'AL006', roomId: 'D-B2-502', studentId: '2025006', studentName: '刘雨桐', checkIn: '2025-09-05', status: '在住' },
    { id: 'AL007', roomId: 'D-C3-102', studentId: '2025005', studentName: '陈俊杰', checkIn: '2025-09-01', status: '在住' },
    { id: 'AL008', roomId: 'D-C3-204', studentId: '2025009', studentName: '吴天宇', checkIn: '2025-09-08', status: '在住' },
    { id: 'AL009', roomId: 'D-D4-303', studentId: '2025008', studentName: '周嘉怡', checkIn: '2025-09-07', status: '在住' },
    { id: 'AL010', roomId: 'D-D4-501', studentId: '2025010', studentName: '郑欣怡', checkIn: '2025-09-09', status: '在住' }
  ];

  const DormService = {
    // 宿舍房间
    getRooms() {
      const cached = localStorage.getItem('dormRooms');
      if (cached) return JSON.parse(cached);
      localStorage.setItem('dormRooms', JSON.stringify(dormRoomSample));
      return dormRoomSample;
    },
    saveRooms(list) { localStorage.setItem('dormRooms', JSON.stringify(list)); },
    addRoom(r) {
      const list = this.getRooms();
      if (list.some(x => x.id === r.id)) { Common.showMsg('宿舍编号已存在', 'error'); return false; }
      list.unshift(r);
      this.saveRooms(list);
      Common.showMsg('添加宿舍成功');
      return true;
    },
    updateRoom(r) {
      const list = this.getRooms();
      const idx = list.findIndex(x => x.id === r.id);
      if (idx < 0) { Common.showMsg('未找到该宿舍', 'error'); return false; }
      list[idx] = Object.assign({}, list[idx], r);
      this.saveRooms(list);
      Common.showMsg('宿舍信息更新成功');
      return true;
    },
    deleteRoom(id) {
      const allocs = this.getAllocations().filter(a => a.roomId === id);
      if (allocs.length > 0) { Common.showMsg('该宿舍还有学生在住，无法删除', 'warning'); return; }
      const list = this.getRooms().filter(x => x.id !== id);
      this.saveRooms(list);
      Common.showMsg('删除宿舍成功');
    },

    // 住宿分配
    getAllocations() {
      const cached = localStorage.getItem('dormAllocs');
      if (cached) return JSON.parse(cached);
      localStorage.setItem('dormAllocs', JSON.stringify(allocationSample));
      return allocationSample;
    },
    saveAllocations(list) { localStorage.setItem('dormAllocs', JSON.stringify(list)); },
    allocateStudent(alloc) {
      const list = this.getAllocations();
      const rooms = this.getRooms();
      const room = rooms.find(r => r.id === alloc.roomId);
      if (!room) { Common.showMsg('未找到宿舍', 'error'); return false; }
      if (list.some(a => a.studentId === alloc.studentId && a.status === '在住')) {
        Common.showMsg('该学生已有住宿记录', 'warning'); return false;
      }
      const currentInRoom = list.filter(a => a.roomId === alloc.roomId && a.status === '在住').length;
      if (currentInRoom >= room.capacity) { Common.showMsg('该宿舍已满员', 'warning'); return false; }
      alloc.id = Common.uid('AL');
      alloc.checkIn = alloc.checkIn || Common.today();
      alloc.status = '在住';
      list.unshift(alloc);
      this.saveAllocations(list);
      Common.showMsg('分配成功：' + alloc.studentName + ' → ' + alloc.roomId);
      return true;
    },
    checkOut(id) {
      const list = this.getAllocations();
      const item = list.find(a => a.id === id);
      if (!item) return;
      item.status = '已退房';
      item.checkOut = Common.today();
      this.saveAllocations(list);
      Common.showMsg(item.studentName + ' 已办理退房');
    },
    deleteAllocation(id) {
      const list = this.getAllocations().filter(a => a.id !== id);
      this.saveAllocations(list);
      Common.showMsg('已删除分配记录');
    },
    /**
     * 查询某宿舍当前在住人数
     */
    getRoomOccupancy(roomId) {
      return this.getAllocations().filter(a => a.roomId === roomId && a.status === '在住').length;
    },
    /**
     * 宿舍使用情况统计（按楼栋）
     */
    getBuildingStats() {
      const rooms = this.getRooms();
      const allocs = this.getAllocations();
      const buildingMap = {};
      rooms.forEach(r => {
        if (!buildingMap[r.building]) buildingMap[r.building] = { building: r.building, total: 0, capacity: 0, occupied: 0 };
        buildingMap[r.building].total++;
        buildingMap[r.building].capacity += r.capacity;
      });
      allocs.filter(a => a.status === '在住').forEach(a => {
        const r = rooms.find(x => x.id === a.roomId);
        if (r && buildingMap[r.building]) buildingMap[r.building].occupied++;
      });
      return Object.values(buildingMap).map(b => ({
        ...b,
        usage: b.capacity > 0 ? ((b.occupied / b.capacity) * 100).toFixed(1) + '%' : '0%'
      }));
    },

    roomCount() { return this.getRooms().length; }
  };

  global.DormService = DormService;
})(window);
