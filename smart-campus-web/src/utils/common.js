/* ============================================================
 * 通用工具函数
 * 统一消息提示 (Element Plus Message)
 * ============================================================ */
(function (global) {
  const Common = {
    showMsg(msg, type = 'success') {
      if (!global.ElementPlus) return;
      global.ElementPlus.ElMessage({
        message: msg,
        type: type,
        duration: 2200,
        showClose: true,
        grouping: true,
        customClass: 'global-msg'
      });
    },
    confirm(message, title = '提示', type = 'warning') {
      return global.ElementPlus.ElMessageBox.confirm(
        message, title,
        { confirmButtonText: '确定', cancelButtonText: '取消', type: type }
      );
    },
    randomId(prefix = '') {
      return prefix + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
    },
    today() {
      const d = new Date();
      return d.getFullYear() + '-' +
        String(d.getMonth() + 1).padStart(2, '0') + '-' +
        String(d.getDate()).padStart(2, '0');
    },
    formatDate(d) {
      if (!d) return '';
      const t = typeof d === 'object' ? d : new Date(d);
      return t.getFullYear() + '-' +
        String(t.getMonth() + 1).padStart(2, '0') + '-' +
        String(t.getDate()).padStart(2, '0');
    },
    deepClone(o) { return JSON.parse(JSON.stringify(o)); },
    uid(prefix = 'ID') {
      return prefix + '-' + Date.now().toString(36).toUpperCase() + Math.floor(Math.random() * 1000);
    },
    now() {
      const d = new Date();
      return d.getFullYear() + '-' +
        String(d.getMonth() + 1).padStart(2, '0') + '-' +
        String(d.getDate()).padStart(2, '0') + ' ' +
        String(d.getHours()).padStart(2, '0') + ':' +
        String(d.getMinutes()).padStart(2, '0') + ':' +
        String(d.getSeconds()).padStart(2, '0');
    },
    pickRandom(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
  };
  global.Common = Common;
})(window);
