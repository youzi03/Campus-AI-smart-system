/* ============================================================
 * API 客户端 — 封装 fetch 请求，对接后端 RESTful API
 * 统一错误处理、自动 JSON 序列化/反序列化
 * ============================================================ */
(function (global) {

  const API_BASE = 'http://localhost:8080/api';

  /**
   * 核心请求方法
   * @param {string} url    路径（如 /students）
   * @param {object} opts   fetch 选项
   * @returns {Promise<any>} 解析后的 data 字段
   */
  async function request(url, opts = {}) {
    try {
      const response = await fetch(API_BASE + url, {
        headers: {
          'Content-Type': 'application/json',
          ...(opts.headers || {})
        },
        ...opts
      });

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
      // 网络错误或解析错误
      if (err.name === 'TypeError' && err.message.includes('fetch')) {
        const netMsg = '无法连接后端服务器，请确认服务已启动';
        if (global.ElementPlus) {
          global.ElementPlus.ElMessage.error(netMsg);
        }
        throw new Error(netMsg);
      }
      // 已在上面提示过的错误不再重复提示
      if (!err.message.includes('请求失败')) {
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
