/* ============================================================
 * AI 分析页面 ai-pages — AI 智能数据分析看板
 * 功能：智能分析导航 / 分析结果展示 / 自由问答
 * ============================================================ */
(function (global) {

  // ========== Markdown 简易渲染器 ==========
  function renderMarkdown(text) {
    if (!text) return '';
    var html = text
      // 标题
      .replace(/^### (.+)$/gm, '<h3 style="margin:16px 0 8px;font-size:15px;color:#303133">$1</h3>')
      .replace(/^## (.+)$/gm, '<h2 style="margin:18px 0 10px;font-size:17px;color:#303133;border-bottom:1px solid #eee;padding-bottom:6px">$1</h2>')
      .replace(/^# (.+)$/gm, '<h1 style="margin:20px 0 12px;font-size:20px;color:#303133">$1</h1>')
      // 粗体
      .replace(/\*\*(.+?)\*\*/g, '<strong style="color:#303133">$1</strong>')
      // 斜体
      .replace(/\*(.+?)\*/g, '<em>$1</em>')
      // 行内代码
      .replace(/`(.+?)`/g, '<code style="background:#f5f7fa;padding:2px 6px;border-radius:4px;font-size:13px;color:#c44a6a">$1</code>')
      // 无序列表
      .replace(/^- (.+)$/gm, '<li style="margin:4px 0;color:#606266">$1</li>')
      .replace(/(<li.*<\/li>\n?)+/g, function(m) { return '<ul style="padding-left:22px;margin:8px 0">' + m + '</ul>'; })
      // 有序列表
      .replace(/^\d+\. (.+)$/gm, '<li style="margin:4px 0;color:#606266">$1</li>')
      // 段落（连续两换行）
      .replace(/\n\n/g, '</p><p style="margin:8px 0;line-height:1.8;color:#606266">')
      // 单换行保留
      .replace(/\n/g, '<br>');
    return '<p style="margin:8px 0;line-height:1.8;color:#606266">' + html + '</p>';
  }

  // ========== 1. AI 分析看板 ==========
  const PageAIDashboard = {
    template: `
      <div class="page-wrapper">
        <!-- 页面标题 -->
        <div class="page-header">
          <div>
            <div class="page-title">🤖 AI 智能数据分析</div>
            <div class="page-desc">基于 DeepSeek 大模型的校园数据智能分析平台，一键获取洞察与建议</div>
          </div>
        </div>

        <!-- 数据概览卡片 -->
        <el-row :gutter="14" style="margin-bottom:18px">
          <el-col :span="6" v-for="(stat, idx) in dataStats" :key="idx">
            <div :style="'padding:16px 18px;border-radius:10px;background:' + stat.bg + ';border:1px solid ' + stat.border">
              <div style="font-size:28px;font-weight:700;color:#303133">{{ stat.value }}</div>
              <div style="font-size:13px;color:#909399;margin-top:4px">{{ stat.label }}</div>
            </div>
          </el-col>
        </el-row>

        <!-- 分析能力卡片网格 -->
        <div style="margin-bottom:18px">
          <div style="font-size:15px;font-weight:600;color:#303133;margin-bottom:12px">🔍 选择分析场景</div>
          <el-row :gutter="14">
            <el-col :span="8" v-for="(cap, idx) in capabilities" :key="idx" style="margin-bottom:14px">
              <div
                @click="startAnalysis(cap)"
                :style="'padding:20px;border-radius:12px;cursor:pointer;transition:all 0.25s;background:' + cap.color + ';border:2px solid ' + (loading && currentCap && currentCap.key === cap.key ? cap.textColor : 'transparent')"
                class="ai-cap-card"
              >
                <div style="font-size:24px;margin-bottom:6px">{{ cap.icon }}</div>
                <div style="font-size:14px;font-weight:600;color:#303133;margin-bottom:4px">{{ cap.title }}</div>
                <div style="font-size:12px;color:#606266;line-height:1.5">{{ cap.desc }}</div>
              </div>
            </el-col>
          </el-row>
        </div>

        <!-- 自由问答 -->
        <div class="panel" style="margin-bottom:18px">
          <div style="display:flex;gap:10px;align-items:center">
            <el-input
              v-model="customQuery"
              type="textarea"
              :rows="2"
              placeholder="💡 输入你想了解的问题，例如：分析一下本学期的成绩分布情况……"
              style="flex:1"
              @keydown.enter.prevent="submitCustomQuery"
            />
            <el-button
              type="primary"
              :loading="loading"
              :disabled="!customQuery.trim()"
              @click="submitCustomQuery"
              style="height:56px;min-width:100px"
            >
              {{ loading ? '分析中...' : '🤖 提问' }}
            </el-button>
          </div>
        </div>

        <!-- 加载状态 -->
        <div v-if="loading" class="panel" style="text-align:center;padding:40px 0">
          <el-icon :size="40" class="is-loading" style="color:#3a7bd5">
            <svg viewBox="0 0 24 24" width="40" height="40" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10" stroke-dasharray="32" stroke-dashoffset="32">
                <animate attributeName="stroke-dashoffset" values="32;0" dur="1.5s" repeatCount="indefinite" />
              </circle>
            </svg>
          </el-icon>
          <div style="margin-top:12px;color:#909399;font-size:14px">
            <div>🧠 AI 正在分析校园数据...</div>
            <div style="font-size:12px;margin-top:4px;color:#c0c4cc">正在调用 DeepSeek 大模型生成分析报告</div>
          </div>
        </div>

        <!-- 分析结果 -->
        <div v-if="result && !loading" class="panel">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px">
            <div style="font-size:15px;font-weight:600;color:#303133">
              📋 分析报告
              <el-tag size="small" type="info" effect="plain" style="margin-left:8px">{{ resultTypeLabel }}</el-tag>
            </div>
            <div style="display:flex;gap:8px">
              <el-button size="small" plain @click="copyResult">📋 复制</el-button>
              <el-button size="small" plain type="danger" @click="clearResult">清空</el-button>
            </div>
          </div>
          <el-divider style="margin:6px 0 14px" />

          <!-- 分析文本（Markdown 渲染） -->
          <div v-if="result.analysis" class="ai-analysis-content" v-html="renderMarkdown(result.analysis)"></div>

          <!-- 建议列表 -->
          <div v-if="result.suggestions && result.suggestions.length > 0" style="margin-top:16px;padding:16px;background:linear-gradient(135deg,#f0f7ff,#e8f4ff);border-radius:10px">
            <div style="font-size:14px;font-weight:600;color:#2e5fa8;margin-bottom:8px">💡 建议与行动项</div>
            <div v-for="(s, i) in result.suggestions" :key="i" style="padding:4px 0;font-size:13px;color:#606266">
              {{ s }}
            </div>
          </div>

          <!-- 数据快照 -->
          <div v-if="result.dataSnapshot" style="margin-top:16px">
            <el-collapse>
              <el-collapse-item title="📊 查看分析数据源" name="data">
                <div style="display:flex;flex-wrap:wrap;gap:10px;padding:8px 0">
                  <el-tag v-for="(v, k) in result.dataSnapshot" :key="k" size="small" effect="plain" :type="tagType(k)">
                    {{ dataLabel(k) }}: {{ v }}
                  </el-tag>
                </div>
              </el-collapse-item>
            </el-collapse>
          </div>
        </div>

        <!-- 错误状态 -->
        <div v-if="result && !result.success && !loading" class="panel" style="background:#fef0f0">
          <div style="display:flex;align-items:center;gap:10px;color:#f56c6c">
            <span style="font-size:18px">⚠️</span>
            <span style="font-weight:600">分析过程出现异常</span>
          </div>
          <div style="margin-top:8px;color:#606266;font-size:13px">{{ result.error || result.analysis }}</div>
        </div>

        <!-- 使用提示 -->
        <div style="margin-top:18px;padding:12px 16px;background:#fafafa;border-radius:8px;font-size:12px;color:#c0c4cc;line-height:1.8">
          💡 AI 分析结果由大模型生成，仅供参考。数据准确性以实际系统数据为准。
          建议在 DeepSeek 配置中正确设置 API Key 以获得最佳分析效果。
        </div>
      </div>
    `,
    data() {
      return {
        loading: false,
        result: null,
        currentCap: null,
        customQuery: '',
        dataSnapshot: null,
        capabilities: AIService.getCapabilities()
      };
    },
    computed: {
      resultTypeLabel() {
        if (!this.result || !this.result.type) return '自定义分析';
        var labels = {
          score_analysis: '成绩智能分析',
          teaching_evaluation: '教学效果评估',
          borrow_analysis: '图书借阅分析',
          student_profile: '学生综合画像',
          dorm_analysis: '宿舍管理分析',
          custom_query: '自由问答'
        };
        return labels[this.result.type] || this.result.type;
      },
      dataStats() {
        var s = this.dataSnapshot;
        if (!s) return [
          { label: '学生总数', value: '—', bg: '#e8f1fb', border: '#d0e0f0' },
          { label: '成绩记录', value: '—', bg: '#e6f9f7', border: '#c0e8e0' },
          { label: '借阅记录', value: '—', bg: '#fef4e6', border: '#f0e0c0' },
          { label: '宿舍入住率', value: '—', bg: '#e8f5f9', border: '#c0dce8' }
        ];
        return [
          { label: '学生总数', value: s.studentCount || 0, bg: '#e8f1fb', border: '#d0e0f0' },
          { label: '成绩记录', value: s.scoreCount || 0, bg: '#e6f9f7', border: '#c0e8e0' },
          { label: '借阅记录', value: s.borrowCount || 0, bg: '#fef4e6', border: '#f0e0c0' },
          { label: '宿舍入住率', value: s.dormOccupancy || 'N/A', bg: '#e8f5f9', border: '#c0dce8' }
        ];
      }
    },
    created() {
      this.loadSnapshot();
    },
    methods: {
      renderMarkdown,
      async loadSnapshot() {
        try {
          this.dataSnapshot = await AIService.getDataSnapshot();
        } catch (e) {
          console.warn('加载数据快照失败', e);
        }
      },
      async startAnalysis(cap) {
        this.currentCap = cap;
        this.loading = true;
        this.result = null;
        try {
          this.result = await AIService.analyze(cap.key, {}, cap.prompt);
        } catch (e) {
          this.result = { success: false, analysis: '调用失败: ' + e.message, suggestions: [] };
        } finally {
          this.loading = false;
        }
      },
      async submitCustomQuery() {
        var q = this.customQuery.trim();
        if (!q) return;
        this.currentCap = { key: 'custom_query', title: '自由问答' };
        this.loading = true;
        this.result = null;
        try {
          this.result = await AIService.analyze('custom_query', {}, q);
        } catch (e) {
          this.result = { success: false, analysis: '调用失败: ' + e.message, suggestions: [] };
        } finally {
          this.loading = false;
        }
      },
      clearResult() {
        this.result = null;
        this.currentCap = null;
      },
      copyResult() {
        if (!this.result || !this.result.analysis) return;
        var text = this.result.analysis;
        try {
          if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(text).then(function() {
              Common.showMsg('已复制到剪贴板');
            }).catch(function() {
              fallbackCopy(text);
            });
          } else {
            fallbackCopy(text);
          }
        } catch (e) {
          fallbackCopy(text);
        }

        function fallbackCopy(t) {
          var ta = document.createElement('textarea');
          ta.value = t;
          ta.style.position = 'fixed';
          ta.style.opacity = '0';
          document.body.appendChild(ta);
          ta.select();
          try {
            document.execCommand('copy');
            Common.showMsg('已复制到剪贴板');
          } catch (e) {
            Common.showMsg('复制失败，请手动选择复制', 'warning');
          }
          document.body.removeChild(ta);
        }
      },
      dataLabel(k) {
        var labels = {
          studentCount: '学生总数', teacherCount: '教师总数',
          courseCount: '课程总数', scoreCount: '成绩记录',
          failCount: '不及格人数', averageScore: '平均分',
          borrowCount: '借阅记录', overdueCount: '逾期记录',
          dormOccupancy: '入住率', recentNoticeCount: '近30天公告'
        };
        return labels[k] || k;
      },
      tagType(k) {
        var danger = ['failCount', 'overdueCount'];
        var success = ['averageScore', 'dormOccupancy'];
        if (danger.includes(k)) return 'danger';
        if (success.includes(k)) return 'success';
        return 'info';
      }
    }
  };

  global.AIPages = { PageAIDashboard };
})(window);
