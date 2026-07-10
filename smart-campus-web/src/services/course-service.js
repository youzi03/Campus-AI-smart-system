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
      try {
        var data = await apiClient.get('/schedules/all');
        if (data && data.length > 0) return data;
        return JSON.parse(localStorage.getItem('schedule')||'null')||scheduleSample;
      }
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

    // 智能排课：每门课64学时，2学时/节=32节，每周2节(4学时)，均匀分布16周
    async autoArrange() {
      var courses = [];
      try { courses = await apiClient.get('/courses/all'); } catch(e) {}
      if (!courses || !courses.length) {
        courses = JSON.parse(localStorage.getItem('courses')||'null')||courseSample;
      }
      var rooms = [...(JSON.parse(localStorage.getItem('rooms')||'null')||roomSample), ...(JSON.parse(localStorage.getItem('labs')||'null')||labSample)];
      if (!courses.length || !rooms.length) { Common.showMsg('请先添加课程和教室/实验室', 'warning'); return 0; }

      // 过滤可用教室
      var availRooms = rooms.filter(function(r){return r.status==='可用';});
      if (!availRooms.length) availRooms = rooms;

      // 为每门课分配2个固定的周时段(day+period)，确保同教师不冲突且均匀分布
      var weeklyPattern = [];
      var teacherSlots = {};    // teacherId -> {"day-period": true}
      var daySlotCount = {};    // "day-period" -> count，用于均衡分布
      var colors = ['blue','green','orange','purple','pink'];

      courses.forEach(function(course, idx) {
        var courseColor = colors[idx % 5];
        for (var t = 0; t < 2; t++) {
          // 第一轮：严格遵守最多2门/时段 + 教室不冲突
          var candidates = [];
          for (var day = 1; day <= 5; day++) {
            for (var period = 1; period <= 4; period++) {
              var key = day + '-' + period;
              var tc = teacherSlots[course.teacherId] || {};
              if (tc[key]) continue;
              if ((daySlotCount[key]||0) >= 2) continue;
              var room = null;
              for (var ri = 0; ri < availRooms.length; ri++) {
                var busy = weeklyPattern.some(function(p){
                  return p.day===day && p.period===period && p.roomId===availRooms[ri].id;
                });
                if (!busy) { room = availRooms[ri]; break; }
              }
              if (!room) continue;
              candidates.push({day:day, period:period, key:key, room:room, count: daySlotCount[key]||0});
            }
          }
          // 第二轮：放宽教室限制（允许教室冲突，但仍遵守2门上限）
          if (!candidates.length) {
            for (var day = 1; day <= 5; day++) {
              for (var period = 1; period <= 4; period++) {
                var key = day + '-' + period;
                var tc = teacherSlots[course.teacherId] || {};
                if (tc[key]) continue;
                if ((daySlotCount[key]||0) >= 2) continue;
                candidates.push({day:day, period:period, key:key, room:availRooms[0], count: daySlotCount[key]||0});
              }
            }
          }
          // 第三轮：完全放宽（教师空闲即可）
          if (!candidates.length) {
            for (var day = 1; day <= 5; day++) {
              for (var period = 1; period <= 4; period++) {
                var key = day + '-' + period;
                var tc = teacherSlots[course.teacherId] || {};
                if (tc[key]) continue;
                candidates.push({day:day, period:period, key:key, room:availRooms[0], count: daySlotCount[key]||0});
              }
            }
          }
          if (!candidates.length) continue;
          candidates.sort(function(a,b){return a.count - b.count;});
          var best = candidates[0];

          if (!teacherSlots[course.teacherId]) teacherSlots[course.teacherId] = {};
          teacherSlots[course.teacherId][best.key] = true;
          daySlotCount[best.key] = (daySlotCount[best.key]||0) + 1;
          weeklyPattern.push({
            courseId: course.id, courseName: course.name,
            teacherId: course.teacherId, teacherName: course.teacher,
            day: best.day, period: best.period,
            roomId: best.room.id, roomName: best.room.name,
            color: courseColor
          });
        }
      });

      // 课程前缀 → 班级名映射
      var classMap = {CS:'计科2025-1班', MA:'数学2025-1班', EN:'英语2025-1班', PH:'物理2025-1班', EC:'经济2025-1班'};
      function getClassGroup(courseId) {
        var prefix = courseId.substring(0,2);
        return classMap[prefix] || (prefix + '2025-1班');
      }

      // 生成16周的排课数据
      var newItems = [];
      var weekLabels = Array.from({length:16},function(_,i){return '第'+(i+1)+'周';});
      weeklyPattern.forEach(function(p) {
        weekLabels.forEach(function(wk) {
          newItems.push({
            id: Common.uid('SCH'),
            courseId: p.courseId, courseName: p.courseName,
            teacherId: p.teacherId, teacherName: p.teacherName,
            day: p.day, period: p.period,
            roomId: p.roomId, roomName: p.roomName,
            classGroup: getClassGroup(p.courseId),
            week: wk,
            color: p.color
          });
        });
      });

      // 写入后端
      var apiOk = 0;
      for (var i = 0; i < newItems.length; i++) {
        try { await apiClient.post('/schedules', newItems[i]); apiOk++; } catch(e) {}
      }

      // localStorage 兜底
      var allLocal = JSON.parse(localStorage.getItem('schedule')||'null')||scheduleSample;
      newItems.forEach(function(item) { allLocal.push(item); });
      localStorage.setItem('schedule', JSON.stringify(allLocal));

      var msg = '智能排课完成，共生成 ' + newItems.length + ' 条（' + courses.length + '门课×16周）';
      if (apiOk > 0 && apiOk === newItems.length) msg += ' - 已同步后端';
      else if (apiOk > 0) msg += ' - 后端同步 ' + apiOk + '/' + newItems.length;
      Common.showMsg(msg, 'success');
      return newItems.length;
    },
    async clearSchedule() {
      localStorage.setItem('schedule','[]');
      try {
        var list = await apiClient.get('/schedules/all');
        if (list && list.length) {
          for (var i = 0; i < list.length; i++) {
            try { await apiClient.del('/schedules/' + list[i].id); } catch(e) {}
          }
        }
      } catch(e) {}
      Common.showMsg('课表已清空','warning');
    },
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
