/* ============================================================
 * 公告服务 notice-service — 对接后端 REST API
 * 功能：公告发布、查询、置顶、删除
 * ============================================================ */
(function (global) {

  var noticeSample = [
    { id:'N001',title:'关于2026年春季学期开学工作的通知',type:'重要',level:'high',target:'全体师生',publisher:'教务处',content:'根据学校安排，2026年春季学期将于2月24日正式开学。',createAt:'2026-01-20',views:1892,pinned:true },
    { id:'N002',title:'【预警】期末考试成绩低于60分学生名单提醒',type:'预警',level:'warning',target:'相关学生',publisher:'学生工作处',content:'以下学生本次期末考试存在不及格科目。',createAt:'2026-01-18',views:452,pinned:false },
    { id:'N003',title:'图书馆寒假开放时间调整公告',type:'通知',level:'normal',target:'全体师生',publisher:'图书馆',content:'寒假期间图书馆开放时间调整为：周一至周五 9:00-17:00。',createAt:'2026-01-15',views:1203,pinned:false },
    { id:'N004',title:'关于开展2026年度科研项目申报工作的通知',type:'通知',level:'normal',target:'教师',publisher:'科研处',content:'现启动2026年度科研项目申报工作。',createAt:'2026-01-12',views:688,pinned:false },
    { id:'N005',title:'校园网络安全升级通知',type:'通知',level:'normal',target:'全体师生',publisher:'信息中心',content:'校园网络将于1月25日凌晨2:00-6:00进行安全升级。',createAt:'2026-01-10',views:2341,pinned:false }
  ];

  var NoticeService = {
    async getNotices() {
      try { return await apiClient.get('/notices/all'); }
      catch { var c=localStorage.getItem('notices');return c?JSON.parse(c):noticeSample; }
    },
    async addNotice(n) {
      if (!n.id) n.id = 'N' + Date.now();
      try { return await apiClient.post('/notices', n); }
      catch {
        var list=JSON.parse(localStorage.getItem('notices')||'null')||noticeSample;
        n.id='N'+Date.now();n.createAt=Common.today();n.views=0;
        list.unshift(n);localStorage.setItem('notices',JSON.stringify(list));
        Common.showMsg('发布成功：'+n.title);return true;
      }
    },
    async updateNotice(n) {
      try { return await apiClient.put('/notices/'+n.id, n); }
      catch {
        var list=JSON.parse(localStorage.getItem('notices')||'null')||noticeSample;
        var idx=list.findIndex(function(x){return x.id===n.id;});
        if(idx<0){Common.showMsg('未找到','error');return false;}
        list[idx]=Object.assign({},list[idx],n);localStorage.setItem('notices',JSON.stringify(list));
        Common.showMsg('更新成功');return true;
      }
    },
    async deleteNotice(id) {
      if (!id) { Common.showMsg('公告 ID 无效', 'error'); return; }
      try { return await apiClient.del('/notices/'+id); }
      catch{var list=(JSON.parse(localStorage.getItem('notices')||'null')||noticeSample).filter(function(x){return x.id!==id;});localStorage.setItem('notices',JSON.stringify(list));Common.showMsg('删除成功');}
    },
    async togglePin(id) {
      if (!id) { Common.showMsg('公告 ID 无效', 'error'); return; }
      try { return await apiClient.put('/notices/'+id+'/pin'); }
      catch {
        var list=JSON.parse(localStorage.getItem('notices')||'null')||noticeSample;
        var idx=list.findIndex(function(x){return x.id===id;});
        if(idx>=0){list[idx].pinned=!list[idx].pinned;localStorage.setItem('notices',JSON.stringify(list));}
      }
    },
    async noticeCount() {
      try { return await apiClient.get('/notices/count'); }
      catch{var c=localStorage.getItem('notices');return c?JSON.parse(c).length:noticeSample.length;}
    }
  };

  global.NoticeService = NoticeService;
})(window);
