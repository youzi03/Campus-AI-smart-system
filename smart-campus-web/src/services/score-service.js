/* ============================================================
 * 成绩服务 score-service — 对接后端 REST API
 * 功能：成绩录入、查询、统计分析、预警
 * ============================================================ */
(function (global) {

  const sample = [
    { id:'SC001',studentId:'2025001',studentName:'张明',courseId:'CS101',courseName:'数据结构',score:88,semester:'2025-2026春',type:'期末',inputAt:'2026-01-10' },
    { id:'SC002',studentId:'2025001',studentName:'张明',courseId:'MA201',courseName:'高等数学',score:92,semester:'2025-2026春',type:'期末',inputAt:'2026-01-10' },
    { id:'SC003',studentId:'2025002',studentName:'李思琪',courseId:'MA201',courseName:'高等数学',score:95,semester:'2025-2026春',type:'期末',inputAt:'2026-01-10' },
    { id:'SC004',studentId:'2025002',studentName:'李思琪',courseId:'EN101',courseName:'大学英语',score:86,semester:'2025-2026春',type:'期末',inputAt:'2026-01-11' },
    { id:'SC005',studentId:'2025003',studentName:'王浩然',courseId:'CS101',courseName:'数据结构',score:79,semester:'2025-2026春',type:'期末',inputAt:'2026-01-11' },
    { id:'SC006',studentId:'2025003',studentName:'王浩然',courseId:'CS102',courseName:'操作系统',score:82,semester:'2025-2026春',type:'期末',inputAt:'2026-01-12' },
    { id:'SC007',studentId:'2025004',studentName:'赵雅婷',courseId:'EN101',courseName:'大学英语',score:90,semester:'2025-2026春',type:'期末',inputAt:'2026-01-12' },
    { id:'SC008',studentId:'2025005',studentName:'陈俊杰',courseId:'PH101',courseName:'大学物理',score:68,semester:'2025-2026春',type:'期末',inputAt:'2026-01-13' },
    { id:'SC009',studentId:'2025006',studentName:'刘雨桐',courseId:'EC201',courseName:'微观经济学',score:74,semester:'2025-2026春',type:'期末',inputAt:'2026-01-13' },
    { id:'SC010',studentId:'2025007',studentName:'孙博文',courseId:'CS101',courseName:'数据结构',score:85,semester:'2025-2026春',type:'期末',inputAt:'2026-01-14' },
    { id:'SC011',studentId:'2025008',studentName:'周嘉怡',courseId:'MA201',courseName:'高等数学',score:71,semester:'2025-2026春',type:'期末',inputAt:'2026-01-14' },
    { id:'SC012',studentId:'2025009',studentName:'吴天宇',courseId:'PH101',courseName:'大学物理',score:58,semester:'2025-2026春',type:'期末',inputAt:'2026-01-15' }
  ];

  var ScoreService = {
    async getScores() {
      try { return await apiClient.get('/scores/all'); }
      catch { var c=localStorage.getItem('scores');return c?JSON.parse(c):sample; }
    },
    async addScore(s) {
      try { return await apiClient.post('/scores', s); }
      catch {
        var list=JSON.parse(localStorage.getItem('scores')||'null')||sample;
        if(list.some(function(x){return x.studentId===s.studentId&&x.courseId===s.courseId&&x.semester===s.semester;})){
          Common.showMsg('该成绩已存在','warning');return false;
        }
        s.id = 'SC' + Date.now(); s.inputAt = Common.today();
        list.unshift(s); localStorage.setItem('scores',JSON.stringify(list));
        Common.showMsg('录入成功：'+s.studentName+' '+s.courseName+' '+s.score+'分'); return true;
      }
    },
    async updateScore(s) {
      try { return await apiClient.put('/scores/'+s.id, s); }
      catch {
        var list=JSON.parse(localStorage.getItem('scores')||'null')||sample;
        var idx=list.findIndex(function(x){return x.id===s.id;});
        if(idx<0){Common.showMsg('未找到','error');return false;}
        list[idx]=Object.assign({},list[idx],s);localStorage.setItem('scores',JSON.stringify(list));
        Common.showMsg('更新成功');return true;
      }
    },
    async deleteScore(id) {
      try { return await apiClient.del('/scores/'+id); }
      catch{var list=(JSON.parse(localStorage.getItem('scores')||'null')||sample).filter(function(x){return x.id!==id;});localStorage.setItem('scores',JSON.stringify(list));Common.showMsg('删除成功');}
    },

    // 统计（纯前端计算，不依赖后端）
    statByCourse(list) {
      if (!Array.isArray(list)) { try { list = JSON.parse(localStorage.getItem('scores')); } catch(e){} if (!Array.isArray(list)) list = sample; }
      var map={};
      list.forEach(function(s){
        if(!map[s.courseId])map[s.courseId]={courseId:s.courseId,courseName:s.courseName,count:0,total:0,max:0,min:100,pass:0,fail:0};
        var r=map[s.courseId];r.count++;r.total+=Number(s.score);r.max=Math.max(r.max,Number(s.score));r.min=Math.min(r.min,Number(s.score));
        if(Number(s.score)>=60)r.pass++;else r.fail++;
      });
      return Object.values(map).map(function(r){return{courseId:r.courseId,courseName:r.courseName,count:r.count,avg:(r.total/r.count).toFixed(1),max:r.max,min:r.min,passRate:((r.pass/r.count)*100).toFixed(1)+'%',fail:r.fail};});
    },
    statByScoreRange(list) {
      if (!Array.isArray(list)) { try { list = JSON.parse(localStorage.getItem('scores')); } catch(e){} if (!Array.isArray(list)) list = sample; }
      var b=[{label:'0-59',value:0,color:'#f56c6c'},{label:'60-69',value:0,color:'#e6a23c'},{label:'70-79',value:0,color:'#409eff'},{label:'80-89',value:0,color:'#67c23a'},{label:'90-100',value:0,color:'#4ecdc4'}];
      list.forEach(function(s){var x=Number(s.score);if(x<60)b[0].value++;else if(x<70)b[1].value++;else if(x<80)b[2].value++;else if(x<90)b[3].value++;else b[4].value++;});
      return b;
    },
    statByStudent(list) {
      if (!Array.isArray(list)) { try { list = JSON.parse(localStorage.getItem('scores')); } catch(e){} if (!Array.isArray(list)) list = sample; }
      var map={};
      list.forEach(function(s){
        if(!map[s.studentId])map[s.studentId]={studentId:s.studentId,studentName:s.studentName,total:0,count:0,max:0,min:100};
        var r=map[s.studentId];r.total+=Number(s.score);r.count++;r.max=Math.max(r.max,Number(s.score));r.min=Math.min(r.min,Number(s.score));
      });
      return Object.values(map).map(function(r){return{studentId:r.studentId,studentName:r.studentName,count:r.count,avg:(r.total/r.count).toFixed(1),max:r.max,min:r.min};}).sort(function(a,b){return Number(b.avg)-Number(a.avg);});
    },

    // 预警
    async getWarnings() {
      try { return await apiClient.get('/scores/warnings'); }
      catch{return(JSON.parse(localStorage.getItem('scores')||'null')||sample).filter(function(s){return Number(s.score)<60;});}
    },

    async scoreCount() {
      try { return await apiClient.get('/scores/count'); }
      catch{var c=localStorage.getItem('scores');return c?JSON.parse(c).length:sample.length;}
    }
  };

  global.ScoreService = ScoreService;
})(window);
