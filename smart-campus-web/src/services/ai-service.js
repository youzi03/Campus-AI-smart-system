/* ============================================================
 * AI 分析服务 ai-service — 对接后端 AI 分析 REST API
 * 功能：智能分析、数据快照、快速查询
 * ============================================================ */
(function (global) {

  var AIService = {

    /**
     * AI 智能分析
     * @param {string} type 分析类型: score_analysis | student_profile | teaching_evaluation | borrow_analysis | dorm_analysis | custom_query
     * @param {object} params 附加参数
     * @param {string} query 用户自定义问题
     * @param {boolean} stream 是否流式（暂未实现）
     */
    async analyze(type, params, query, stream) {
      try {
        return await apiClient.post('/ai/analyze', {
          type: type || 'custom_query',
          params: params || {},
          query: query || '',
          stream: stream || false
        });
      } catch (e) {
        console.error('AI 分析调用失败', e);
        // 离线降级
        return {
          success: false,
          analysis: '⚠️ **AI 分析服务暂不可用**\n\n无法连接到后端 AI 分析服务，请确认：\n1. 后端服务已启动\n2. DeepSeek API Key 已正确配置\n3. 网络连接正常',
          suggestions: ['检查后端服务状态', '配置 DeepSeek API Key', '稍后重试'],
          type: type || 'custom_query'
        };
      }
    },

    /**
     * 获取数据快照（概览数据）
     */
    async getDataSnapshot() {
      try {
        return await apiClient.get('/ai/data-snapshot');
      } catch (e) {
        console.error('获取数据快照失败', e);
        return null;
      }
    },

    /**
     * 快速分析（一句话查询）
     */
    async quickAnalyze(query) {
      try {
        return await apiClient.post('/ai/quick-analyze', { query: query });
      } catch (e) {
        console.error('快速分析调用失败', e);
        return {
          success: false,
          analysis: '⚠️ 分析服务暂不可用，请稍后重试。',
          suggestions: []
        };
      }
    },

    /**
     * AI 分析能力列表（供前端展示）
     */
    getCapabilities() {
      return [
        {
          key: 'score_analysis',
          title: '📊 成绩智能分析',
          desc: '深入分析全校成绩数据，发现课程教学中的问题与亮点',
          color: '#e8f1fb',
          textColor: '#2e5fa8',
          icon: '📊',
          prompt: '请对我校当前的成绩数据进行全面分析，包括总体情况、各课程对比、存在问题及改进建议。'
        },
        {
          key: 'teaching_evaluation',
          title: '📈 教学效果评估',
          desc: '通过成绩分布评估各课程教学成效，给出改进方向',
          color: '#e6f9f7',
          textColor: '#2d8f6f',
          icon: '📈',
          prompt: '请根据全校成绩数据，对教学效果进行综合评估，分析各课程的教学质量，找出需要改进的环节。'
        },
        {
          key: 'borrow_analysis',
          title: '📚 图书借阅分析',
          desc: '分析图书馆借阅趋势，推荐热门图书，优化馆藏',
          color: '#fef4e6',
          textColor: '#b07030',
          icon: '📚',
          prompt: '请分析图书馆借阅数据，包括借阅趋势、热门书籍、逾期情况，并提出馆藏优化建议。'
        },
        {
          key: 'student_profile',
          title: '🎓 学生综合画像',
          desc: '多维度分析学生成绩、借阅、住宿等综合表现',
          color: '#f5f0ff',
          textColor: '#6b4a9a',
          icon: '🎓',
          prompt: '我需要查看学生的综合画像，从成绩、借阅行为等多维度分析学生表现。'
        },
        {
          key: 'dorm_analysis',
          title: '🏠 宿舍管理分析',
          desc: '分析宿舍入住情况，优化住宿资源配置',
          color: '#e8f5f9',
          textColor: '#2a7a9a',
          icon: '🏠',
          prompt: '请分析当前的宿舍入住与分配数据，评估住宿资源利用情况，并提出优化建议。'
        },
        {
          key: 'custom_query',
          title: '💬 自由问答',
          desc: '输入任意问题，AI 基于校园数据为你解答',
          color: '#fef0f0',
          textColor: '#c44a6a',
          icon: '💬',
          prompt: ''
        }
      ];
    }
  };

  global.AIService = AIService;
})(window);
