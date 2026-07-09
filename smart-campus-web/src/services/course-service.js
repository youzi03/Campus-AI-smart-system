/* ============================================================
 * 课程服务 course-service — 对接后端 REST API
 * 包含：课程管理、教室管理、实验室管理、课表管理
 * ============================================================ */
(function (global) {

  var courseSample = [
    { id: 'CS101', name: '数据结构', teacher: '王明', teacherId: 'T001', credit: 4, hours: 64, college: '计算机学院', semester: '2025-2026春', capacity: 60 },
    { id: 'CS102', name: '操作系统', teacher: '张伟', teacherId: 'T003', credit: 4, hours: 64, college: '计算机学院', semester: '2025-2026春', capacity: 60 },
    { id: 'MA201', name: '高等数学', teacher: '李华', teacherId: 'T002', credit: 5, hours: 80, college: '数学学院', semester: '2025-2026春', capacity: 80 },
    { id: 'EN101', name: '大学英语', teacher: '陈雪', teacherId: 'T004', credit: 3, hours: 48, college: '外语学院', semester: '2025-2026春', capacity: 70 },
    { id: 'PH101', name: '大学物理', teacher: '刘强', teacherId: 'T005', credit: 4, hours: 64, college: '物理学院', semester: '2025-2026春', capacity: 70 },
    { id: 'EC201', name: '微观经济学', teacher: '黄丽', teacherId: 'T006', credit: 3, hours: 48, college: '经济学院', semester: '2025-2026春', capacity: 60 }
  ];
  var roomSample = [
    { id: 'A101', name: '教学楼A-101', building: 'A栋', floor: 1, capacity: 80, type: '多媒体教室', equipment: '投影仪,音响,空调', status: '可用' },
    { id: 'A201', name: '教学楼A-201', building: 'A栋', floor: 2, capacity: 60, type: '多媒体教室', equipment: '投影仪,音响,空调', status: '可用' },
    { id: 'B102', name: '教学楼B-102', building: 'B栋', floor: 1, capacity: 120, type: '阶梯教室', equipment: '投影仪,麦克风,空调', status: '可用' },
    { id: 'B205', name: '教学楼B-205', building: 'B栋', floor: 2, capacity: 60, type: '多媒体教室', equipment: '投影仪,电脑,空调', status: '维护中' }
  ];
  var labSample = [
    { id: 'LAB-C301', name: '计算机实验室 C-301', building: 'C栋实验楼', floor: 3, capacity: 40, type: '计算机实验室', pcCount: 40, manager: '张老师', phone: '13811112222', equipment: 'DELL台式机×40,投影仪,交换机', status: '可用' },
    { id: 'LAB-C302', name: '物理实验室 C-302', building: 'C栋实验楼', floor: 3, capacity: 30, type: '物理实验室', pcCount: 10, manager: '刘老师', phone: '13822223333', equipment: '力学实验台×10,光学实验设备,电脑', status: '可用' },
    { id: 'LAB-D401', name: '化学实验室 D-401', building: 'D栋实验楼', floor: 4, capacity: 30, type: '化学实验室', pcCount: 0, manager: '陈老师', phone: '13833334444', equipment: '实验台×12,通风橱,显微镜', status: '可用' },
    { id: 'LAB-E501', name: '电子实验室 E-501', building: 'E栋实验楼', floor: 5, capacity: 40, type: '电子实验室', pcCount: 20, manager: '黄老师', phone: '13844445555', equipment: '示波器×20,信号源,电脑', status: '维护中' }
  ];
  var scheduleSample = [
    { id: 'SCH001', courseId: 'CS101', courseName: '数据结构', teacherId: 'T001', teacherName: '王明', day: 1, period: 1, roomId: 'A101', roomName: '教学楼A-101', classGroup: '计科2025-1班', week: '1-16周', color: 'blue' },
    { id: 'SCH002', courseId: 'MA201', courseName: '高等数学', teacherId: 'T002', teacherName: '李华', day: 1, period: 2, roomId: 'B102', roomName: '教学楼B-102', classGroup: '计科2025-1班', week: '1-16周', color: 'green' },
    { id: 'SCH003', courseId: 'EN101', courseName: '大学英语', teacherId: 'T004', teacherName: '陈雪', day: 2, period: 1, roomId: 'A201', roomName: '教学楼A-201', classGroup: '计科2025-1班', week: '1-16周', color: 'orange' },
    { id: 'SCH004', courseId: 'CS102', courseName: '操作系统', teacherId: 'T003', teacherName: '张伟', day: 2, period: 3, roomId: 'LAB-C301', roomName: '计算机实验室 C-301', classGroup: '计科2025-1班', week: '1-16周', color: 'purple' },
    { id: 'SCH005', courseId: 'PH101', courseName: '大学物理', teacherId: 'T005', teacherName: '刘强', day: 3, period: 2, roomId: 'B102', roomName: '教学楼B-102', classGroup: '计科2025-1班', week: '1-16周', color: 'pink' },
    { id: 'SCH006', courseId: 'EC201', courseName: '微观经济学', teacherId: 'T006', teacherName: '黄丽', day: 3, period: 3, roomId: 'A201', roomName: '教学楼A-201', classGroup: '经管2025-1班', week: '1-16周', color: 'blue' },
    { id: 'SCH007', courseId: 'CS101', courseName: '数据结构', teacherId: 'T001', teacherName: '王明', day: 4, period: 1, roomId: 'A101', roomName: '教学楼A-101', classGroup: '计科2025-1班', week: '1-16周', color: 'blue' },
    { id: 'SCH008', courseId: 'MA201', courseName: '高等数学', teacherId: 'T002', teacherName: '李华', day: 4, period: 3, roomId: 'B102', roomName: '教学楼B-102', classGroup: '计科2025-1班', week: '1-16周', color: 'green' },
    { id: 'SCH009', courseId: 'PH101', courseName: '大学物理', teacherId: 'T005', teacherName: '刘强', day: 5, period: 2, roomId: 'LAB-C302', roomName: '物理实验室 C-302', classGroup: '计科2025-1班', week: '1-16周', color: 'pink' },
    { id: 'SCH010', courseId: 'EN101', courseName: '大学英语', teacherId: 'T004', teacherName: '陈雪', day: 5, period: 1, roomId: 'A201', roomName: '教学楼A-201', classGroup: '计科2025-1班', week: '1-16周', color: 'orange' }
  ];

  var dayNames = ['周一', '周二', '周三', '周四', '周五'];
  var periodNames = [
    { p: 1, name: '第1-2节', time: '08:00-09:40' },
    { p: 2, name: '第3-4节', time: '10:00-11:40' },
    { p: 3, name: '第5-6节', time: '14:00-15:40' },
    { p: 4, name: '第7-8节', time: '16:00-17:40' }
  ];
  var colorPalette = ['blue', 'green', 'orange', 'purple', 'pink'];

  var CourseService = {

    // ========== 课程 ==========
    async getCourses() {
      try { return await apiClient.get('/courses/all'); }
      catch { return JSON.parse(localStorage.getItem('courses') || 'null') || courseSample; }
    },
    async addCourse(c) {
      try { return await apiClient.post('/courses', c); }
      catch {
        var list = JSON.parse(localStorage.getItem('courses') || 'null') || courseSample;
        if (list.some(function(x){return x.id===c.id;})){Common.showMsg('编号已存在','error');return false;}
        list.unshift(c); localStorage.setItem('courses',JSON.stringify(list));
        Common.showMsg('添加课程成功：'+c.name); return true;
      }
    },
    async updateCourse(c) {
      try { return await apiClient.put('/courses/'+c.id, c); }
      catch {
        var list = JSON.parse(localStorage.getItem('courses')||'null')||courseSample;
        var idx=list.findIndex(function(x){return x.id===c.id;});
        if(idx<0){Common.showMsg('课程不存在','error');return false;}
        list[idx]=Object.assign({},list[idx],c); localStorage.setItem('courses',JSON.stringify(list));
        Common.showMsg('更新成功'); return true;
      }
    },
    async deleteCourse(id) {
      try { return await apiClient.del('/courses/'+id); }
      catch {
        var list = (JSON.parse(localStorage.getItem('courses')||'null')||courseSample).filter(function(x){return x.id!==id;});
        localStorage.setItem('courses',JSON.stringify(list)); Common.showMsg('删除成功');
      }
    },

    // ========== 教室 ==========
    async getRooms() {
      try { return await apiClient.get('/classrooms/all'); }
      catch { return JSON.parse(localStorage.getItem('rooms')||'null')||roomSample; }
    },
    async addRoom(r) {
      try { return await apiClient.post('/classrooms', r); }
      catch {
        var list=JSON.parse(localStorage.getItem('rooms')||'null')||roomSample;
        if(list.some(function(x){return x.id===r.id;})){Common.showMsg('编号已存在','error');return false;}
        list.unshift(r);localStorage.setItem('rooms',JSON.stringify(list));Common.showMsg('添加教室成功');return true;
      }
    },
    async updateRoom(r) {
      try { return await apiClient.put('/classrooms/'+r.id, r); }
      catch {
        var list=JSON.parse(localStorage.getItem('rooms')||'null')||roomSample;
        var idx=list.findIndex(function(x){return x.id===r.id;});
        if(idx<0){Common.showMsg('教室不存在','error');return false;}
        list[idx]=Object.assign({},list[idx],r);localStorage.setItem('rooms',JSON.stringify(list));Common.showMsg('更新成功');return true;
      }
    },
    async deleteRoom(id) {
      try { return await apiClient.del('/classrooms/'+id); }
      catch{var list=(JSON.parse(localStorage.getItem('rooms')||'null')||roomSample).filter(function(x){return x.id!==id;});localStorage.setItem('rooms',JSON.stringify(list));Common.showMsg('删除成功');}
    },

    // ========== 实验室 ==========
    async getLabs() {
      try { return await apiClient.get('/labs/all'); }
      catch { return JSON.parse(localStorage.getItem('labs')||'null')||labSample; }
    },
    async addLab(l) {
      try { return await apiClient.post('/labs', l); }
      catch {
        var list=JSON.parse(localStorage.getItem('labs')||'null')||labSample;
        if(list.some(function(x){return x.id===l.id;})){Common.showMsg('编号已存在','error');return false;}
        list.unshift(l);localStorage.setItem('labs',JSON.stringify(list));Common.showMsg('添加实验室成功');return true;
      }
    },
    async updateLab(l) {
      try { return await apiClient.put('/labs/'+l.id, l); }
      catch {
        var list=JSON.parse(localStorage.getItem('labs')||'null')||labSample;
        var idx=list.findIndex(function(x){return x.id===l.id;});
        if(idx<0){Common.showMsg('实验室不存在','error');return false;}
        list[idx]=Object.assign({},list[idx],l);localStorage.setItem('labs',JSON.stringify(list));Common.showMsg('更新成功');return true;
      }
    },
    async deleteLab(id) {
      try { return await apiClient.del('/labs/'+id); }
      catch{var list=(JSON.parse(localStorage.getItem('labs')||'null')||labSample).filter(function(x){return x.id!==id;});localStorage.setItem('labs',JSON.stringify(list));Common.showMsg('删除成功');}
    },

    // ========== 课表 ==========
    async getSchedule() {
      try { return await apiClient.get('/schedules/all'); }
      catch { return JSON.parse(localStorage.getItem('schedule')||'null')||scheduleSample; }
    },
    async addScheduleItem(item) {
      try { return await apiClient.post('/schedules', item); }
      catch {
        var list=JSON.parse(localStorage.getItem('schedule')||'null')||scheduleSample;
        var roomConflict=list.some(function(s){return s.day===item.day&&s.period===item.period&&s.roomId===item.roomId;});
        var teacherConflict=list.some(function(s){return s.day===item.day&&s.period===item.period&&s.teacherId===item.teacherId;});
        if(roomConflict){Common.showMsg('教室时段冲突','error');return false;}
        if(teacherConflict){Common.showMsg('教师时段冲突','error');return false;}
        item.id=Common.uid('SCH');list.push(item);localStorage.setItem('schedule',JSON.stringify(list));
        Common.showMsg('排课成功：'+item.courseName); return true;
      }
    },
    async updateScheduleItem(item) {
      try { return await apiClient.put('/schedules/'+item.id, item); }
      catch {
        var list=JSON.parse(localStorage.getItem('schedule')||'null')||scheduleSample;
        var idx=list.findIndex(function(s){return s.id===item.id;});
        if(idx<0){Common.showMsg('未找到该教学任务','error');return false;}
        var temp=list.filter(function(s){return s.id!==item.id;});
        if(temp.some(function(s){return s.day===item.day&&s.period===item.period&&s.roomId===item.roomId;})){Common.showMsg('教室时段冲突','error');return false;}
        if(temp.some(function(s){return s.day===item.day&&s.period===item.period&&s.teacherId===item.teacherId;})){Common.showMsg('教师时段冲突','error');return false;}
        list[idx]=Object.assign({},list[idx],item);localStorage.setItem('schedule',JSON.stringify(list));Common.showMsg('更新成功');return true;
      }
    },
    async deleteScheduleItem(id) {
      try { return await apiClient.del('/schedules/'+id); }
      catch{var list=(JSON.parse(localStorage.getItem('schedule')||'null')||scheduleSample).filter(function(s){return s.id!==id;});localStorage.setItem('schedule',JSON.stringify(list));Common.showMsg('已取消');}
    },

    // 辅助方法（纯前端逻辑）
    autoArrange() {
      var courses = JSON.parse(localStorage.getItem('courses')||'null')||courseSample;
      var rooms = [...(JSON.parse(localStorage.getItem('rooms')||'null')||roomSample), ...(JSON.parse(localStorage.getItem('labs')||'null')||labSample)];
      if (!courses.length || !rooms.length) { Common.showMsg('请先添加课程和教室/实验室', 'warning'); return 0; }
      var existing = JSON.parse(localStorage.getItem('schedule')||'null')||scheduleSample;
      var created = 0;
      var colors = ['blue','green','orange','purple','pink'];

      // 统计已有排课的各时间段占用
      function countSlot(day, period, week) {
        return existing.filter(function(s){return s.day===day && s.period===period && s.week===week;}).length;
      }
      function countWeeklyHours(week) {
        return existing.filter(function(s){return s.week===week;}).length * 2;
      }
      function teacherBusy(tid, day, period, week) {
        return existing.some(function(s){return s.teacherId===tid && s.day===day && s.period===period && s.week===week;});
      }
      function roomBusy(rid, day, period, week) {
        return existing.some(function(s){return s.roomId===rid && s.day===day && s.period===period && s.week===week;});
      }

      var totalWeekRanges = ['1-16周','1-17周','1-18周','1-19周','1-20周'];
      var weekIdx = 0;
      var week = totalWeekRanges[weekIdx];

      courses.forEach(function(course, idx) {
        // 每门课安排2个时间段
        for (var t = 0; t < 2; t++) {
          var placed = false;
          // 从第1周开始，依次尝试
          for (var wi = 0; wi < totalWeekRanges.length && !placed; wi++) {
            var wk = totalWeekRanges[wi];
            for (var day = 1; day <= 5 && !placed; day++) {
              for (var period = 1; period <= 4 && !placed; period++) {
                // 该时间段课程数不超过2
                if (countSlot(day, period, wk) >= 2) continue;
                // 教师不冲突
                if (teacherBusy(course.teacherId, day, period, wk)) continue;
                // 找空闲教室
                var room = null;
                for (var ri = 0; ri < rooms.length; ri++) {
                  if (!roomBusy(rooms[ri].id, day, period, wk)) {
                    room = rooms[ri];
                    break;
                  }
                }
                if (!room) continue;
                // 周学时不超过48
                if (countWeeklyHours(wk) >= 48) continue;

                existing.push({
                  id: Common.uid('SCH'),
                  courseId: course.id, courseName: course.name,
                  teacherId: course.teacherId, teacherName: course.teacher,
                  day: day, period: period,
                  roomId: room.id, roomName: room.name,
                  classGroup: '自动排课',
                  week: wk,
                  color: colors[idx % 5]
                });
                created++;
                placed = true;
              }
            }
          }
        }
      });

      localStorage.setItem('schedule', JSON.stringify(existing));
      Common.showMsg('智能排课完成，共生成 ' + created + ' 条', 'success');
      return created;
    },
    clearSchedule() { localStorage.setItem('schedule','[]'); Common.showMsg('课表已清空','warning'); },
    async getAllPlaces() {
      var rooms = await this.getRooms();
      var labs = await this.getLabs();
      return [...rooms, ...labs].map(function(p){return{id:p.id,name:p.name,type:p.type};});
    },

    // 统计
    async courseCount() {
      try { return await apiClient.get('/courses/count'); }
      catch { return (JSON.parse(localStorage.getItem('courses')||'null')||courseSample).length; }
    },

    get dayNames() { return dayNames; },
    get periodNames() { return periodNames; },
    get colorPalette() { return colorPalette; }
  };

  global.CourseService = CourseService;
})(window);
