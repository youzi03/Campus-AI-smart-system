/* ============================================================
 * 认证服务 auth.js
 * 登录/登出、Token 管理、当前用户信息、权限判断
 * ============================================================ */
(function (global) {

  const TOKEN_KEY = 'campus_token';
  const USER_KEY = 'campus_user';

  const Auth = {

    // ==================== Token 管理 ====================

    /** 获取 token */
    getToken() {
      return localStorage.getItem(TOKEN_KEY);
    },

    /** 保存 token */
    setToken(token) {
      localStorage.setItem(TOKEN_KEY, token);
    },

    /** 清除 token */
    removeToken() {
      localStorage.removeItem(TOKEN_KEY);
    },

    // ==================== 用户信息管理 ====================

    /** 获取当前用户信息 */
    getUser() {
      const data = localStorage.getItem(USER_KEY);
      return data ? JSON.parse(data) : null;
    },

    /** 保存用户信息 */
    setUser(user) {
      localStorage.setItem(USER_KEY, JSON.stringify(user));
    },

    /** 清除用户信息 */
    removeUser() {
      localStorage.removeItem(USER_KEY);
    },

    // ==================== 登录状态 ====================

    /** 是否已登录 */
    isLoggedIn() {
      return !!this.getToken();
    },

    /** 当前用户角色 */
    getRole() {
      const user = this.getUser();
      return user ? user.role : null;
    },

    /** 当前用户真实姓名 */
    getRealName() {
      const user = this.getUser();
      return user ? (user.realName || (user.profile && user.profile.name) || user.username) : '未登录';
    },

    // ==================== 权限判断 ====================

    /** 判断当前角色是否可以访问指定菜单项 */
    canAccess(roles) {
      if (!roles || roles.length === 0) return true; // 无限制
      const role = this.getRole();
      if (!role) return false;
      return roles.includes(role);
    },

    /** 判断是否拥有指定角色 */
    hasRole(role) {
      return this.getRole() === role;
    },

    /** 是否为管理员 */
    isAdmin() {
      return this.hasRole('admin');
    },

    /** 是否为教师 */
    isTeacher() {
      return this.hasRole('teacher');
    },

    /** 是否为管理员或教师 */
    isAdminOrTeacher() {
      const r = this.getRole();
      return r === 'admin' || r === 'teacher';
    },

    // ==================== 登录/登出 ====================

    /** 调用后端登录 API */
    async login(username, password) {
      const data = await apiClient.post('/auth/login', { username, password });
      this.setToken(data.token);
      this.setUser(data.userInfo);
      return data;
    },

    /** 登出 */
    logout() {
      this.removeToken();
      this.removeUser();
      // 刷新页面回到登录状态
      window.location.reload();
    }
  };

  global.Auth = Auth;
})(window);
