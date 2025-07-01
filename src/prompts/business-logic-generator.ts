/**
 * 业务逻辑生成器 - Phase G.2
 * 生成标准化的业务逻辑、交互模式和数据处理方案
 */

import { PRDGenerationData } from '@/lib/prd-generator';

// 业务逻辑模式类型
export type BusinessLogicPattern = 
  | 'crud_operations'     // 增删改查操作
  | 'form_validation'     // 表单验证
  | 'search_filter'       // 搜索过滤
  | 'data_visualization'  // 数据可视化
  | 'user_auth'          // 用户认证
  | 'workflow_process'   // 工作流程
  | 'notification_system' // 通知系统
  | 'collaboration'      // 协作功能
  | 'import_export'      // 导入导出
  | 'real_time_sync';    // 实时同步

// 业务逻辑生成配置
export interface BusinessLogicConfig {
  pattern: BusinessLogicPattern;
  entityName: string;        // 实体名称（如：任务、用户、项目）
  operations: string[];      // 支持的操作
  validationRules: ValidationRule[];
  dataStructure: DataField[];
  uiComponents: UIComponent[];
}

// 验证规则
export interface ValidationRule {
  field: string;
  type: 'required' | 'email' | 'phone' | 'number' | 'date' | 'custom';
  message: string;
  pattern?: string;
}

// 数据字段
export interface DataField {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'date' | 'array' | 'object';
  required: boolean;
  defaultValue?: any;
  description: string;
}

// UI组件
export interface UIComponent {
  type: 'input' | 'select' | 'checkbox' | 'textarea' | 'button' | 'table' | 'card' | 'modal';
  name: string;
  props: Record<string, any>;
  validation?: string[];
  interactions: string[];
}

// 生成的业务逻辑代码
export interface GeneratedBusinessLogic {
  pattern: BusinessLogicPattern;
  entityName: string;
  htmlCode: string;
  jsCode: string;
  cssCode: string;
  description: string;
  features: string[];
  interactions: InteractionSpec[];
}

// 交互规格
export interface InteractionSpec {
  trigger: string;      // 触发条件
  action: string;       // 执行动作
  feedback: string;     // 用户反馈
  validation?: string;  // 验证逻辑
}

/**
 * 业务逻辑生成器
 */
export class BusinessLogicGenerator {
  
  /**
   * 从PRD数据分析业务逻辑模式
   */
  static analyzeBusinessPatterns(prdData: PRDGenerationData): BusinessLogicPattern[] {
    const patterns: BusinessLogicPattern[] = [];
    
    // 分析功能需求，识别业务模式
    const requirements = prdData.requirementSolution?.requirements || [];
    
    for (const req of requirements) {
      const features = req.features?.toLowerCase() || '';
      const name = req.name?.toLowerCase() || '';
      
      // CRUD操作模式识别
      if (features.includes('增加') || features.includes('创建') || 
          features.includes('删除') || features.includes('修改') ||
          features.includes('查看') || features.includes('管理')) {
        if (!patterns.includes('crud_operations')) {
          patterns.push('crud_operations');
        }
      }
      
      // 表单验证模式识别
      if (features.includes('输入') || features.includes('填写') || 
          features.includes('提交') || features.includes('验证')) {
        if (!patterns.includes('form_validation')) {
          patterns.push('form_validation');
        }
      }
      
      // 搜索过滤模式识别
      if (features.includes('搜索') || features.includes('筛选') || 
          features.includes('查找') || features.includes('过滤')) {
        if (!patterns.includes('search_filter')) {
          patterns.push('search_filter');
        }
      }
      
      // 数据可视化模式识别
      if (features.includes('图表') || features.includes('统计') || 
          features.includes('报表') || features.includes('分析')) {
        if (!patterns.includes('data_visualization')) {
          patterns.push('data_visualization');
        }
      }
      
      // 用户认证模式识别
      if (name.includes('登录') || name.includes('注册') || 
          features.includes('权限') || features.includes('认证')) {
        if (!patterns.includes('user_auth')) {
          patterns.push('user_auth');
        }
      }
      
      // 协作功能模式识别
      if (features.includes('分享') || features.includes('协作') || 
          features.includes('评论') || features.includes('团队')) {
        if (!patterns.includes('collaboration')) {
          patterns.push('collaboration');
        }
      }
    }
    
    // 如果没有识别到任何模式，默认添加CRUD和表单验证
    if (patterns.length === 0) {
      patterns.push('crud_operations', 'form_validation');
    }
    
    return patterns;
  }
  
  /**
   * 生成CRUD操作逻辑
   */
  static generateCRUDLogic(entityName: string): GeneratedBusinessLogic {
    const htmlCode = `
<!-- ${entityName}管理界面 -->
<div class="crud-container">
  <!-- 操作工具栏 -->
  <div class="toolbar">
    <button id="add-btn" class="btn btn-primary">
      <i class="icon-plus"></i> 添加${entityName}
    </button>
    <div class="search-box">
      <input type="text" id="search-input" placeholder="搜索${entityName}..." class="form-control">
      <button id="search-btn" class="btn btn-secondary">搜索</button>
    </div>
  </div>

  <!-- 数据表格 -->
  <div class="table-container">
    <table id="data-table" class="table">
      <thead>
        <tr id="table-header">
          <!-- 表头将由JS动态生成 -->
        </tr>
      </thead>
      <tbody id="table-body">
        <!-- 数据行将由JS动态生成 -->
      </tbody>
    </table>
  </div>

  <!-- 添加/编辑弹窗 -->
  <div id="edit-modal" class="modal" style="display: none;">
    <div class="modal-content">
      <div class="modal-header">
        <h3 id="modal-title">添加${entityName}</h3>
        <button id="close-modal" class="close-btn">&times;</button>
      </div>
      <div class="modal-body">
        <form id="edit-form">
          <!-- 表单字段将由JS动态生成 -->
        </form>
      </div>
      <div class="modal-footer">
        <button id="save-btn" class="btn btn-primary">保存</button>
        <button id="cancel-btn" class="btn btn-secondary">取消</button>
      </div>
    </div>
  </div>

  <!-- 确认删除弹窗 -->
  <div id="delete-modal" class="modal" style="display: none;">
    <div class="modal-content">
      <div class="modal-header">
        <h3>确认删除</h3>
        <button id="close-delete-modal" class="close-btn">&times;</button>
      </div>
      <div class="modal-body">
        <p>确定要删除这个${entityName}吗？此操作不可恢复。</p>
      </div>
      <div class="modal-footer">
        <button id="confirm-delete-btn" class="btn btn-danger">确认删除</button>
        <button id="cancel-delete-btn" class="btn btn-secondary">取消</button>
      </div>
    </div>
  </div>
</div>`;

    const jsCode = `
// ${entityName}CRUD管理器
class ${entityName}CRUDManager {
  constructor() {
    this.data = [];
    this.currentEditId = null;
    this.init();
  }

  init() {
    this.loadData();
    this.bindEvents();
    this.renderTable();
  }

  // 绑定事件
  bindEvents() {
    // 添加按钮
    document.getElementById('add-btn').addEventListener('click', () => {
      this.showEditModal();
    });

    // 搜索功能
    document.getElementById('search-input').addEventListener('input', (e) => {
      this.handleSearch(e.target.value);
    });

    // 保存按钮
    document.getElementById('save-btn').addEventListener('click', () => {
      this.handleSave();
    });

    // 取消按钮
    document.getElementById('cancel-btn').addEventListener('click', () => {
      this.hideEditModal();
    });

    // 确认删除
    document.getElementById('confirm-delete-btn').addEventListener('click', () => {
      this.handleDelete();
    });

    // 关闭弹窗
    document.getElementById('close-modal').addEventListener('click', () => {
      this.hideEditModal();
    });
  }

  // 加载数据
  loadData() {
    const saved = localStorage.getItem('${entityName.toLowerCase()}_data');
    this.data = saved ? JSON.parse(saved) : this.getDefaultData();
  }

  // 保存数据
  saveData() {
    localStorage.setItem('${entityName.toLowerCase()}_data', JSON.stringify(this.data));
  }

  // 获取默认数据
  getDefaultData() {
    return [
      { id: 1, name: '示例${entityName}1', status: '活跃', createdAt: new Date().toLocaleDateString() },
      { id: 2, name: '示例${entityName}2', status: '待处理', createdAt: new Date().toLocaleDateString() }
    ];
  }

  // 渲染表格
  renderTable(dataToRender = this.data) {
    const tableHeader = document.getElementById('table-header');
    const tableBody = document.getElementById('table-body');

    // 渲染表头
    tableHeader.innerHTML = \`
      <th>ID</th>
      <th>名称</th>
      <th>状态</th>
      <th>创建时间</th>
      <th>操作</th>
    \`;

    // 渲染数据行
    tableBody.innerHTML = dataToRender.map(item => \`
      <tr>
        <td>\${item.id}</td>
        <td>\${item.name}</td>
        <td><span class="status-badge status-\${item.status.toLowerCase()}">\${item.status}</span></td>
        <td>\${item.createdAt}</td>
        <td>
          <button onclick="${entityName.toLowerCase()}Manager.editItem(\${item.id})" class="btn btn-sm btn-secondary">编辑</button>
          <button onclick="${entityName.toLowerCase()}Manager.deleteItem(\${item.id})" class="btn btn-sm btn-danger">删除</button>
        </td>
      </tr>
    \`).join('');
  }

  // 搜索处理
  handleSearch(query) {
    if (!query.trim()) {
      this.renderTable();
      return;
    }

    const filtered = this.data.filter(item => 
      item.name.toLowerCase().includes(query.toLowerCase()) ||
      item.status.toLowerCase().includes(query.toLowerCase())
    );
    this.renderTable(filtered);
  }

  // 显示编辑弹窗
  showEditModal(item = null) {
    this.currentEditId = item ? item.id : null;
    const modal = document.getElementById('edit-modal');
    const title = document.getElementById('modal-title');
    const form = document.getElementById('edit-form');

    title.textContent = item ? '编辑${entityName}' : '添加${entityName}';
    
    form.innerHTML = \`
      <div class="form-group">
        <label for="item-name">名称</label>
        <input type="text" id="item-name" class="form-control" value="\${item ? item.name : ''}" required>
      </div>
      <div class="form-group">
        <label for="item-status">状态</label>
        <select id="item-status" class="form-control">
          <option value="活跃" \${item && item.status === '活跃' ? 'selected' : ''}>活跃</option>
          <option value="待处理" \${item && item.status === '待处理' ? 'selected' : ''}>待处理</option>
          <option value="已完成" \${item && item.status === '已完成' ? 'selected' : ''}>已完成</option>
        </select>
      </div>
    \`;

    modal.style.display = 'flex';
  }

  // 隐藏编辑弹窗
  hideEditModal() {
    document.getElementById('edit-modal').style.display = 'none';
    this.currentEditId = null;
  }

  // 保存处理
  handleSave() {
    const name = document.getElementById('item-name').value.trim();
    const status = document.getElementById('item-status').value;

    if (!name) {
      this.showMessage('请输入名称', 'error');
      return;
    }

    if (this.currentEditId) {
      // 更新现有项目
      const index = this.data.findIndex(item => item.id === this.currentEditId);
      if (index !== -1) {
        this.data[index] = { ...this.data[index], name, status };
      }
    } else {
      // 添加新项目
      const newItem = {
        id: Math.max(...this.data.map(item => item.id), 0) + 1,
        name,
        status,
        createdAt: new Date().toLocaleDateString()
      };
      this.data.push(newItem);
    }

    this.saveData();
    this.renderTable();
    this.hideEditModal();
    this.showMessage(\`\${this.currentEditId ? '更新' : '添加'}${entityName}成功\`, 'success');
  }

  // 编辑项目
  editItem(id) {
    const item = this.data.find(item => item.id === id);
    if (item) {
      this.showEditModal(item);
    }
  }

  // 删除项目
  deleteItem(id) {
    this.currentDeleteId = id;
    document.getElementById('delete-modal').style.display = 'flex';
  }

  // 处理删除
  handleDelete() {
    if (this.currentDeleteId) {
      this.data = this.data.filter(item => item.id !== this.currentDeleteId);
      this.saveData();
      this.renderTable();
      document.getElementById('delete-modal').style.display = 'none';
      this.showMessage('删除${entityName}成功', 'success');
    }
  }

  // 显示消息
  showMessage(message, type = 'info') {
    const messageEl = document.createElement('div');
    messageEl.className = \`message message-\${type}\`;
    messageEl.textContent = message;
    
    document.body.appendChild(messageEl);
    
    setTimeout(() => {
      messageEl.classList.add('show');
    }, 100);
    
    setTimeout(() => {
      messageEl.classList.remove('show');
      setTimeout(() => {
        document.body.removeChild(messageEl);
      }, 300);
    }, 3000);
  }
}

// 初始化管理器
const ${entityName.toLowerCase()}Manager = new ${entityName}CRUDManager();`;

    const cssCode = `
/* ${entityName}CRUD样式 */
.crud-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding: 15px;
  background: #f8f9fa;
  border-radius: 8px;
}

.search-box {
  display: flex;
  gap: 10px;
}

.search-box input {
  min-width: 250px;
}

.table-container {
  background: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.table {
  width: 100%;
  border-collapse: collapse;
}

.table th,
.table td {
  padding: 12px 15px;
  text-align: left;
  border-bottom: 1px solid #eee;
}

.table th {
  background: #f8f9fa;
  font-weight: 600;
  color: #495057;
}

.table tbody tr:hover {
  background: #f8f9fa;
}

.status-badge {
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
}

.status-活跃 { background: #d4edda; color: #155724; }
.status-待处理 { background: #fff3cd; color: #856404; }
.status-已完成 { background: #d1ecf1; color: #0c5460; }

.modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0,0,0,0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  border-radius: 8px;
  width: 90%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid #eee;
}

.modal-body {
  padding: 20px;
}

.modal-footer {
  display: flex;
  gap: 10px;
  justify-content: flex-end;
  padding: 20px;
  border-top: 1px solid #eee;
}

.form-group {
  margin-bottom: 15px;
}

.form-group label {
  display: block;
  margin-bottom: 5px;
  font-weight: 500;
  color: #495057;
}

.form-control {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #ced4da;
  border-radius: 4px;
  font-size: 14px;
}

.form-control:focus {
  outline: none;
  border-color: #80bdff;
  box-shadow: 0 0 0 0.2rem rgba(0,123,255,.25);
}

.btn {
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  text-decoration: none;
  display: inline-block;
  transition: all 0.2s;
}

.btn-primary {
  background: #007bff;
  color: white;
}

.btn-primary:hover {
  background: #0056b3;
}

.btn-secondary {
  background: #6c757d;
  color: white;
}

.btn-secondary:hover {
  background: #545b62;
}

.btn-danger {
  background: #dc3545;
  color: white;
}

.btn-danger:hover {
  background: #c82333;
}

.btn-sm {
  padding: 4px 8px;
  font-size: 12px;
}

.close-btn {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #999;
}

.close-btn:hover {
  color: #333;
}

.message {
  position: fixed;
  top: 20px;
  right: 20px;
  padding: 12px 20px;
  border-radius: 4px;
  color: white;
  font-weight: 500;
  z-index: 2000;
  transform: translateX(100%);
  transition: transform 0.3s ease;
}

.message.show {
  transform: translateX(0);
}

.message-success {
  background: #28a745;
}

.message-error {
  background: #dc3545;
}

.message-info {
  background: #17a2b8;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .toolbar {
    flex-direction: column;
    gap: 15px;
  }
  
  .search-box {
    width: 100%;
  }
  
  .search-box input {
    flex: 1;
    min-width: auto;
  }
  
  .table-container {
    overflow-x: auto;
  }
  
  .modal-content {
    width: 95%;
    margin: 10px;
  }
}`;

    return {
      pattern: 'crud_operations',
      entityName,
      htmlCode,
      jsCode,
      cssCode,
      description: `完整的${entityName}CRUD管理系统，支持增加、删除、修改、查看和搜索功能`,
      features: [
        '数据表格展示',
        '添加/编辑弹窗',
        '删除确认',
        '实时搜索',
        '本地数据存储',
        '响应式设计',
        '状态管理',
        '用户反馈'
      ],
      interactions: [
        {
          trigger: '点击添加按钮',
          action: '显示添加表单弹窗',
          feedback: '弹窗动画显示'
        },
        {
          trigger: '提交表单',
          action: '验证数据并保存',
          feedback: '成功消息提示',
          validation: '必填字段检查'
        },
        {
          trigger: '搜索输入',
          action: '实时过滤表格数据',
          feedback: '表格内容更新'
        },
        {
          trigger: '点击删除',
          action: '显示确认弹窗',
          feedback: '确认对话框'
        }
      ]
    };
  }
  
  /**
   * 生成表单验证逻辑
   */
  static generateFormValidation(formName: string, fields: DataField[]): GeneratedBusinessLogic {
    const htmlCode = `
<!-- ${formName}表单 -->
<div class="form-container">
  <div class="form-header">
    <h2>${formName}</h2>
    <p>请填写以下信息，带 * 号的为必填项</p>
  </div>
  
  <form id="${formName.toLowerCase()}-form" class="validation-form">
    ${fields.map(field => this.generateFieldHTML(field)).join('\n    ')}
    
    <div class="form-actions">
      <button type="submit" class="btn btn-primary">
        <span class="btn-text">提交</span>
        <span class="btn-loading" style="display: none;">
          <i class="loading-spinner"></i> 提交中...
        </span>
      </button>
      <button type="reset" class="btn btn-secondary">重置</button>
    </div>
  </form>
  
  <!-- 成功提示 -->
  <div id="success-message" class="alert alert-success" style="display: none;">
    <i class="icon-check"></i>
    <span>表单提交成功！</span>
  </div>
</div>`;

    const jsCode = `
// ${formName}表单验证器
class ${formName}FormValidator {
  constructor() {
    this.form = document.getElementById('${formName.toLowerCase()}-form');
    this.fields = ${JSON.stringify(fields, null, 2)};
    this.init();
  }

  init() {
    this.bindEvents();
    this.setupValidation();
  }

  bindEvents() {
    // 表单提交
    this.form.addEventListener('submit', (e) => {
      e.preventDefault();
      this.handleSubmit();
    });

    // 实时验证
    this.form.addEventListener('input', (e) => {
      this.validateField(e.target);
    });

    // 失焦验证
    this.form.addEventListener('blur', (e) => {
      this.validateField(e.target);
    }, true);
  }

  setupValidation() {
    this.fields.forEach(field => {
      const input = document.getElementById(field.name);
      if (input && field.required) {
        input.setAttribute('required', 'true');
      }
    });
  }

  validateField(input) {
    const fieldName = input.name || input.id;
    const fieldConfig = this.fields.find(f => f.name === fieldName);
    
    if (!fieldConfig) return true;

    const value = input.value.trim();
    const errors = [];

    // 必填验证
    if (fieldConfig.required && !value) {
      errors.push(\`\${fieldConfig.description}是必填项\`);
    }

    // 类型验证
    if (value && !this.validateType(value, fieldConfig.type)) {
      errors.push(\`\${fieldConfig.description}格式不正确\`);
    }

    this.showFieldError(input, errors);
    return errors.length === 0;
  }

  validateType(value, type) {
    switch (type) {
      case 'string':
        return typeof value === 'string' && value.length > 0;
      case 'number':
        return !isNaN(value) && !isNaN(parseFloat(value));
      case 'boolean':
        return ['true', 'false', '1', '0'].includes(value.toLowerCase());
      case 'date':
        return !isNaN(new Date(value).getTime());
      default:
        return true;
    }
  }

  showFieldError(input, errors) {
    const container = input.closest('.form-group');
    let errorEl = container.querySelector('.field-error');

    if (errors.length > 0) {
      if (!errorEl) {
        errorEl = document.createElement('div');
        errorEl.className = 'field-error';
        container.appendChild(errorEl);
      }
      errorEl.textContent = errors[0];
      input.classList.add('error');
    } else {
      if (errorEl) {
        errorEl.remove();
      }
      input.classList.remove('error');
      input.classList.add('valid');
    }
  }

  validateForm() {
    let isValid = true;
    const formData = new FormData(this.form);

    this.fields.forEach(field => {
      const input = document.getElementById(field.name);
      if (input && !this.validateField(input)) {
        isValid = false;
      }
    });

    return isValid;
  }

  async handleSubmit() {
    if (!this.validateForm()) {
      this.showMessage('请检查表单中的错误', 'error');
      return;
    }

    this.setSubmitLoading(true);

    try {
      const formData = this.getFormData();
      await this.submitForm(formData);
      this.showSuccess();
    } catch (error) {
      this.showMessage('提交失败，请重试', 'error');
    } finally {
      this.setSubmitLoading(false);
    }
  }

  getFormData() {
    const formData = new FormData(this.form);
    const data = {};
    
    this.fields.forEach(field => {
      const value = formData.get(field.name);
      data[field.name] = this.convertValue(value, field.type);
    });

    return data;
  }

  convertValue(value, type) {
    if (!value) return null;
    
    switch (type) {
      case 'number':
        return parseFloat(value);
      case 'boolean':
        return ['true', '1'].includes(value.toLowerCase());
      case 'date':
        return new Date(value);
      default:
        return value;
    }
  }

  async submitForm(data) {
    // 模拟API调用
    return new Promise((resolve) => {
      setTimeout(() => {
        console.log('表单数据:', data);
        localStorage.setItem('${formName.toLowerCase()}_data', JSON.stringify(data));
        resolve(data);
      }, 1500);
    });
  }

  setSubmitLoading(loading) {
    const btn = this.form.querySelector('button[type="submit"]');
    const text = btn.querySelector('.btn-text');
    const loadingEl = btn.querySelector('.btn-loading');

    if (loading) {
      text.style.display = 'none';
      loadingEl.style.display = 'inline-flex';
      btn.disabled = true;
    } else {
      text.style.display = 'inline';
      loadingEl.style.display = 'none';
      btn.disabled = false;
    }
  }

  showSuccess() {
    const successEl = document.getElementById('success-message');
    successEl.style.display = 'block';
    
    setTimeout(() => {
      successEl.style.display = 'none';
      this.form.reset();
      // 清除验证样式
      this.form.querySelectorAll('.valid, .error').forEach(el => {
        el.classList.remove('valid', 'error');
      });
      this.form.querySelectorAll('.field-error').forEach(el => el.remove());
    }, 3000);
  }

  showMessage(message, type = 'info') {
    const messageEl = document.createElement('div');
    messageEl.className = \`toast toast-\${type}\`;
    messageEl.textContent = message;
    
    document.body.appendChild(messageEl);
    
    setTimeout(() => {
      messageEl.classList.add('show');
    }, 100);
    
    setTimeout(() => {
      messageEl.classList.remove('show');
      setTimeout(() => {
        if (messageEl.parentNode) {
          document.body.removeChild(messageEl);
        }
      }, 300);
    }, 3000);
  }
}

// 初始化表单验证器
const ${formName.toLowerCase()}Validator = new ${formName}FormValidator();`;

    const cssCode = `
/* ${formName}表单样式 */
.form-container {
  max-width: 600px;
  margin: 0 auto;
  padding: 20px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
}

.form-header {
  text-align: center;
  margin-bottom: 30px;
  padding-bottom: 20px;
  border-bottom: 1px solid #eee;
}

.form-header h2 {
  color: #333;
  margin-bottom: 10px;
}

.form-header p {
  color: #666;
  margin: 0;
}

.validation-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
}

.form-group label {
  margin-bottom: 5px;
  font-weight: 500;
  color: #333;
}

.form-group label.required::after {
  content: ' *';
  color: #dc3545;
}

.form-control {
  padding: 10px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  transition: all 0.2s ease;
}

.form-control:focus {
  outline: none;
  border-color: #007bff;
  box-shadow: 0 0 0 0.2rem rgba(0,123,255,.25);
}

.form-control.valid {
  border-color: #28a745;
}

.form-control.error {
  border-color: #dc3545;
}

.field-error {
  margin-top: 5px;
  font-size: 12px;
  color: #dc3545;
}

.form-actions {
  display: flex;
  gap: 10px;
  justify-content: center;
  margin-top: 20px;
}

.btn {
  padding: 10px 20px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.2s;
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-primary {
  background: #007bff;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background: #0056b3;
}

.btn-secondary {
  background: #6c757d;
  color: white;
}

.btn-secondary:hover {
  background: #545b62;
}

.loading-spinner {
  width: 16px;
  height: 16px;
  border: 2px solid transparent;
  border-top: 2px solid currentColor;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.alert {
  padding: 12px 16px;
  border-radius: 4px;
  margin-top: 20px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.alert-success {
  background: #d4edda;
  color: #155724;
  border: 1px solid #c3e6cb;
}

.toast {
  position: fixed;
  top: 20px;
  right: 20px;
  padding: 12px 20px;
  border-radius: 4px;
  color: white;
  font-weight: 500;
  z-index: 2000;
  transform: translateX(100%);
  transition: transform 0.3s ease;
}

.toast.show {
  transform: translateX(0);
}

.toast-success {
  background: #28a745;
}

.toast-error {
  background: #dc3545;
}

.toast-info {
  background: #17a2b8;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .form-container {
    margin: 10px;
    padding: 15px;
  }
  
  .form-actions {
    flex-direction: column;
  }
  
  .btn {
    width: 100%;
    justify-content: center;
  }
}`;

    return {
      pattern: 'form_validation',
      entityName: formName,
      htmlCode,
      jsCode,
      cssCode,
      description: `完整的${formName}表单验证系统，支持实时验证、类型检查和用户反馈`,
      features: [
        '实时字段验证',
        '类型检查',
        '必填验证',
        '错误提示',
        '加载状态',
        '成功反馈',
        '表单重置',
        '响应式设计'
      ],
      interactions: [
        {
          trigger: '输入字段内容',
          action: '实时验证字段',
          feedback: '显示验证状态（成功/错误）'
        },
        {
          trigger: '提交表单',
          action: '验证所有字段并提交',
          feedback: '加载状态和结果提示',
          validation: '完整表单验证'
        },
        {
          trigger: '字段失焦',
          action: '验证当前字段',
          feedback: '显示错误信息（如有）'
        }
      ]
    };
  }

  /**
   * 生成字段HTML
   */
  private static generateFieldHTML(field: DataField): string {
    const required = field.required ? 'required' : '';
    const requiredClass = field.required ? 'required' : '';
    
    switch (field.type) {
      case 'string':
        return `
    <div class="form-group">
      <label for="${field.name}" class="${requiredClass}">${field.description}</label>
      <input type="text" id="${field.name}" name="${field.name}" class="form-control" ${required}>
    </div>`;
      
      case 'number':
        return `
    <div class="form-group">
      <label for="${field.name}" class="${requiredClass}">${field.description}</label>
      <input type="number" id="${field.name}" name="${field.name}" class="form-control" ${required}>
    </div>`;
      
      case 'boolean':
        return `
    <div class="form-group">
      <label>
        <input type="checkbox" id="${field.name}" name="${field.name}" value="true" ${required}>
        ${field.description}
      </label>
    </div>`;
      
      case 'date':
        return `
    <div class="form-group">
      <label for="${field.name}" class="${requiredClass}">${field.description}</label>
      <input type="date" id="${field.name}" name="${field.name}" class="form-control" ${required}>
    </div>`;
      
      default:
        return `
    <div class="form-group">
      <label for="${field.name}" class="${requiredClass}">${field.description}</label>
      <textarea id="${field.name}" name="${field.name}" class="form-control" rows="3" ${required}></textarea>
    </div>`;
    }
  }
  
  /**
   * 从PRD生成推荐的业务逻辑配置
   */
  static generateBusinessLogicConfigs(prdData: PRDGenerationData): BusinessLogicConfig[] {
    const patterns = this.analyzeBusinessPatterns(prdData);
    const configs: BusinessLogicConfig[] = [];
    
    patterns.forEach(pattern => {
      const config = this.createConfigForPattern(pattern, prdData);
      if (config) {
        configs.push(config);
      }
    });
    
    return configs;
  }
  
  /**
   * 为特定模式创建配置
   */
  private static createConfigForPattern(pattern: BusinessLogicPattern, prdData: PRDGenerationData): BusinessLogicConfig | null {
    const entityName = this.extractEntityName(prdData);
    
    switch (pattern) {
      case 'crud_operations':
        return {
          pattern,
          entityName,
          operations: ['create', 'read', 'update', 'delete', 'search'],
          validationRules: [],
          dataStructure: [
            { name: 'id', type: 'number', required: true, description: 'ID' },
            { name: 'name', type: 'string', required: true, description: '名称' },
            { name: 'status', type: 'string', required: true, description: '状态' },
            { name: 'createdAt', type: 'date', required: true, description: '创建时间' }
          ],
          uiComponents: []
        };
        
      case 'form_validation':
        return {
          pattern,
          entityName: `${entityName}表单`,
          operations: ['validate', 'submit', 'reset'],
          validationRules: [
            { field: 'name', type: 'required', message: '名称是必填项' },
            { field: 'email', type: 'email', message: '邮箱格式不正确' }
          ],
          dataStructure: [
            { name: 'name', type: 'string', required: true, description: '姓名' },
            { name: 'email', type: 'string', required: true, description: '邮箱' },
            { name: 'phone', type: 'string', required: false, description: '电话' }
          ],
          uiComponents: []
        };
        
      default:
        return null;
    }
  }
  
  /**
   * 从PRD数据中提取实体名称
   */
  private static extractEntityName(prdData: PRDGenerationData): string {
    // 从需求方案名称中提取
    if (prdData.requirementSolution?.sharedPrototype) {
      const prototype = prdData.requirementSolution.sharedPrototype;
      // 简单的关键词提取逻辑
      const keywords = ['管理', '系统', '平台', '工具', '应用'];
      for (const keyword of keywords) {
        const index = prototype.indexOf(keyword);
        if (index > 0) {
          return prototype.substring(0, index);
        }
      }
    }
    
    // 从用户场景中提取
    if (prdData.userScenarios?.length > 0) {
      const firstScenario = prdData.userScenarios[0];
      if (firstScenario.userType) {
        return firstScenario.userType;
      }
    }
    
    // 默认返回
    return '项目';
  }
} 