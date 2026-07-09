/* ============================================================
 * API 客户端 — 封装 fetch 请求，对接后端 RESTful API
 * 统一错误处理、自动 JSON 序列化/反序列化、JWT 鉴权
 * ============================================================ */
(function (global) {

  // 自动检测运行环境：
  // - 通过 Vite 开发服务器 (localhost:3000) 时使用相对路径，由 Vite 代理转发
  // - 直接打开文件时使用绝对路径直连后端
  const isViteDev = window.location.hostname === 'localhost' && window.location.port === '3000';
  const API_BASE = isViteDev ? '/api' : 'http://localhost:8080/api';

  /**
   * 获取 Authorization 请求头
   */
  function getAuthHeader() {
    if (global.Auth) {
      const token = global.Auth.getToken();
      if (token) return { 'Authorization': 'Bearer ' + token };
    }
    return {};
  }

  /**
   * 核心请求方法
   */
  async function request(url, opts = {}) {
    try {
      const response = await fetch(API_BASE + url, {
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeader(),
          ...(opts.headers || {})
        },
        ...opts
      });

      // 处理 401 未授权
      if (response.status === 401) {
        if (global.Auth) {
          global.Auth.logout(); // 清除 token，刷新回到登录页
        }
        throw new Error('登录已过期，请重新登录');
      }

      // 处理非 JSON 响应
      const contentType = response.headers.get('content-type') || '';
      if (!contentType.includes('application/json')) {
        const text = await response.text();
        if (!response.ok) {
          throw new Error('请求失败: ' + response.status);
        }
        return text;
      }

      const result = await response.json();

      if (result.code !== 200) {
        const errMsg = result.message || '请求失败';
        if (global.ElementPlus) {
          global.ElementPlus.ElMessage.error(errMsg);
        }
        throw new Error(errMsg);
      }

      return result.data;
    } catch (err) {
      // 网络错误
      if (err.name === 'TypeError' && err.message.includes('fetch')) {
        const netMsg = '无法连接后端服务器，请确认服务已启动';
        if (global.ElementPlus) {
          global.ElementPlus.ElMessage.error(netMsg);
        }
        throw new Error(netMsg);
      }
      // 已在上面提示过的错误不再重复提示
      if (!err.message.includes('请求失败') && !err.message.includes('登录已过期')) {
        if (global.ElementPlus) {
          global.ElementPlus.ElMessage.error(err.message || '网络错误');
        }
      }
      throw err;
    }
  }

  const apiClient = {
    /** GET 请求 */
    get(url, params) {
      const qs = params && Object.keys(params).length
        ? '?' + new URLSearchParams(
            Object.entries(params).filter(([_, v]) => v !== undefined && v !== null && v !== '')
          ).toString()
        : '';
      return request(url + qs, { method: 'GET' });
    },

    /** POST 请求 */
    post(url, data) {
      return request(url, {
        method: 'POST',
        body: JSON.stringify(data)
      });
    },

    /** PUT 请求 */
    put(url, data) {
      return request(url, {
        method: 'PUT',
        body: JSON.stringify(data)
      });
    },

    /** DELETE 请求 */
    del(url) {
      return request(url, { method: 'DELETE' });
    }
  };

  global.apiClient = apiClient;
})(window);
