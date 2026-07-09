/* ============================================================
 * 宿舍服务 dorm-service — 对接后端 REST API
 * 功能：宿舍管理、住宿分配
 * ============================================================ */
(function (global) {
  var roomSample = [
    { id:'D-A1-302',building:'A栋',floor:3,roomNo:'302',type:'4人间',capacity:4,gender:'男',fee:1200,status:'使用中' },
    { id:'D-A1-305',building:'A栋',floor:3,roomNo:'305',type:'4人间',capacity:4,gender:'男',fee:1200,status:'使用中' },
    { id:'D-A1-201',building:'A栋',floor:2,roomNo:'201',type:'4人间',capacity:4,gender:'男',fee:1200,status:'使用中' },
    { id:'D-B2-205',building:'B栋',floor:2,roomNo:'205',type:'4人间',capacity:4,gender:'女',fee:1200,status:'使用中' },
    { id:'D-B2-401',building:'B栋',floor:4,roomNo:'401',type:'4人间',capacity:4,gender:'女',fee:1200,status:'使用中' },
    { id:'D-B2-502',building:'B栋',floor:5,roomNo:'502',type:'4人间',capacity:4,gender:'女',fee:1200,status:'使用中' },
    { id:'D-C3-102',building:'C栋',floor:1,roomNo:'102',type:'6人间',capacity:6,gender:'男',fee:900,status:'使用中' },
    { id:'D-C3-204',building:'C栋',floor:2,roomNo:'204',type:'6人间',capacity:6,gender:'男',fee:900,status:'使用中' },
    { id:'D-D4-303',building:'D栋',floor:3,roomNo:'303',type:'4人间',capacity:4,gender:'女',fee:1200,status:'使用中' },
    { id:'D-D4-501',building:'D栋',floor:5,roomNo:'501',type:'4人间',capacity:4,gender:'女',fee:1200,status:'空闲' }
  ];
  var allocSample = [
    { id:'AL001',roomId:'D-A1-302',studentId:'2025001',studentName:'张明',checkIn:'2025-09-01',status:'在住' },
    { id:'AL002',roomId:'D-A1-305',studentId:'2025003',studentName:'王浩然',checkIn:'2025-09-02',status:'在住' },
    { id:'AL003',roomId:'D-A1-201',studentId:'2025007',studentName:'孙博文',checkIn:'2025-09-06',status:'在住' },
    { id:'AL004',roomId:'D-B2-205',studentId:'2025002',studentName:'李思琪',checkIn:'2025-09-01',status:'在住' },
    { id:'AL005',roomId:'D-B2-401',studentId:'2025004',studentName:'赵雅婷',checkIn:'2025-09-03',status:'在住' },
    { id:'AL006',roomId:'D-B2-502',studentId:'2025006',studentName:'刘雨桐',checkIn:'2025-09-05',status:'在住' },
    { id:'AL007',roomId:'D-C3-102',studentId:'2025005',studentName:'陈俊杰',checkIn:'2025-09-01',status:'在住' },
    { id:'AL008',roomId:'D-C3-204',studentId:'2025009',studentName:'吴天宇',checkIn:'2025-09-08',status:'在住' },
    { id:'AL009',roomId:'D-D4-303',studentId:'2025008',studentName:'周嘉怡',checkIn:'2025-09-07',status:'在住' },
    { id:'AL010',roomId:'D-D4-501',studentId:'2025010',studentName:'郑欣怡',checkIn:'2025-09-09',status:'在住' }
  ];

  var DormService = {
    async getRooms() { try { return await apiClient.get('/dorm-rooms'); } catch { return JSON.parse(localStorage.getItem('dormRooms')||'null')||roomSample; } },
    async addRoom(r) {
      if (!r.id) r.id = 'D-' + Date.now().toString(36).toUpperCase();
      try{return await apiClient.post('/dorm-rooms',r);}
      catch{var list=JSON.parse(localStorage.getItem('dormRooms')||'null')||roomSample;if(list.some(function(x){return x.id===r.id;})){Common.showMsg('编号已存在','error');return false;}list.unshift(r);localStorage.setItem('dormRooms',JSON.stringify(list));Common.showMsg('添加成功');return true;}
    },
    async updateRoom(r) {
      try{return await apiClient.put('/dorm-rooms/'+r.id,r);}
      catch{var list=JSON.parse(localStorage.getItem('dormRooms')||'null')||roomSample;var idx=list.findIndex(function(x){return x.id===r.id;});if(idx<0){Common.showMsg('不存在','error');return false;}list[idx]=Object.assign({},list[idx],r);localStorage.setItem('dormRooms',JSON.stringify(list));Common.showMsg('更新成功');return true;}
    },
    async deleteRoom(id) { try{return await apiClient.del('/dorm-rooms/'+id);}catch{var list=(JSON.parse(localStorage.getItem('dormRooms')||'null')||roomSample).filter(function(x){return x.id!==id;});localStorage.setItem('dormRooms',JSON.stringify(list));Common.showMsg('删除成功');} },
    async getAllocations(roomId) { try{return await apiClient.get('/dorm-allocations',roomId?{roomId:roomId}:{});}catch{return JSON.parse(localStorage.getItem('dormAllocs')||'null')||allocSample;} },
    async assignRoom(body) {
      try{return await apiClient.post('/dorm-allocations',body);}
      catch{var list=JSON.parse(localStorage.getItem('dormAllocs')||'null')||allocSample;body.id='AL'+Date.now();body.checkIn=Common.today();body.status='在住';list.push(body);localStorage.setItem('dormAllocs',JSON.stringify(list));Common.showMsg('入住成功');return true;}
    },
    async checkOut(id) {
      try{return await apiClient.put('/dorm-allocations/'+id+'/checkout');}
      catch{var list=JSON.parse(localStorage.getItem('dormAllocs')||'null')||allocSample;var idx=list.findIndex(function(x){return x.id===id;});if(idx>=0){list[idx].status='已退宿';list[idx].checkOut=Common.today();localStorage.setItem('dormAllocs',JSON.stringify(list));}Common.showMsg('已退宿');}
    },
    async deleteAllocation(id) {
      if (!id) { Common.showMsg('记录ID无效', 'error'); return; }
      try{return await apiClient.del('/dorm-allocations/'+id);}
      catch{var list=JSON.parse(localStorage.getItem('dormAllocs')||'null')||allocSample;var idx=list.findIndex(function(x){return x.id===id;});if(idx>=0){list.splice(idx,1);localStorage.setItem('dormAllocs',JSON.stringify(list));}Common.showMsg('已删除');}
    },
    async getStats() { try{return await apiClient.get('/dorm-rooms/stats');}catch{var list=JSON.parse(localStorage.getItem('dormRooms')||'null')||roomSample;var used=list.filter(function(r){return r.status==='使用中';}).length;return{total:list.length,used:used,free:list.length-used};} },
    async roomCount() { try{var s=await this.getStats();return s.total;}catch{return(JSON.parse(localStorage.getItem('dormRooms')||'null')||roomSample).length;} },
    /** 按楼栋统计 */
    async getBuildingStats() {
      var rooms = await this.getRooms();
      var allocs = await this.getAllocations();
      var map = {};
      rooms.forEach(function(r) {
        if (!map[r.building]) map[r.building] = { building: r.building, total: 0, capacity: 0, occupied: 0 };
        map[r.building].total++;
        map[r.building].capacity += r.capacity || 0;
      });
      allocs.filter(function(a){return a.status === '在住';}).forEach(function(a) {
        var room = rooms.find(function(r){return r.id === a.roomId;});
        if (room && map[room.building]) map[room.building].occupied++;
      });
      return Object.values(map).map(function(b) {
        b.usage = b.capacity > 0 ? (b.occupied / b.capacity * 100).toFixed(1) + '%' : '0%';
        return b;
      });
    },
    /** 获取指定宿舍已入住人数 */
    getRoomOccupancy(roomId) {
      try {
        var allocs = JSON.parse(localStorage.getItem('dormAllocs')||'null')||allocSample;
        return allocs.filter(function(a){return a.roomId===roomId && a.status==='在住';}).length;
      } catch(e) { return 0; }
    }
  };
  global.DormService = DormService;
})(window);
