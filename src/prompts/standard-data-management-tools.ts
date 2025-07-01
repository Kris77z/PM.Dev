/**
 * 标准化数据管理工具库 - Phase F.3
 * 为HTML原型提供通用的数据管理功能模板
 */

export const STANDARD_DATA_MANAGEMENT_TOOLS = `
# 📊 标准化数据管理工具库

## 🔧 通用数据管理器（必须集成）

\`\`\`javascript
// 全局数据管理系统 - 支持多个数据存储
class AppDataManager {
  constructor() {
    this.stores = new Map();
    this.listeners = new Map();
  }
  
  // 获取指定的数据存储
  getStore(name) {
    if (!this.stores.has(name)) {
      this.stores.set(name, new DataStore(name));
      this.listeners.set(name, []);
    }
    return this.stores.get(name);
  }
  
  // 订阅数据变化
  subscribe(storeName, callback) {
    if (!this.listeners.has(storeName)) {
      this.listeners.set(storeName, []);
    }
    this.listeners.get(storeName).push(callback);
    
    return () => {
      const listeners = this.listeners.get(storeName);
      const index = listeners.indexOf(callback);
      if (index > -1) listeners.splice(index, 1);
    };
  }
  
  // 通知数据变化
  notify(storeName, data) {
    const listeners = this.listeners.get(storeName) || [];
    listeners.forEach(callback => callback(data));
  }
}

// 数据存储类 - 标准CRUD操作
class DataStore {
  constructor(storeName) {
    this.storeName = storeName;
    this.data = this.load();
    this.manager = window.appDataManager;
  }
  
  // 从localStorage加载数据
  load() {
    try {
      const stored = localStorage.getItem(this.storeName);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.warn(\`Failed to load data from \${this.storeName}:\`, error);
      return [];
    }
  }
  
  // 保存数据到localStorage
  save() {
    try {
      localStorage.setItem(this.storeName, JSON.stringify(this.data));
      this.manager.notify(this.storeName, this.data);
      return true;
    } catch (error) {
      console.error(\`Failed to save data to \${this.storeName}:\`, error);
      return false;
    }
  }
  
  // 添加新项目
  add(item) {
    const newItem = {
      id: this.generateId(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ...item
    };
    this.data.unshift(newItem);
    this.save();
    return newItem;
  }
  
  // 更新项目
  update(id, updates) {
    const index = this.data.findIndex(item => item.id === id);
    if (index !== -1) {
      this.data[index] = {
        ...this.data[index],
        ...updates,
        updatedAt: new Date().toISOString()
      };
      this.save();
      return this.data[index];
    }
    return null;
  }
  
  // 删除项目
  delete(id) {
    const index = this.data.findIndex(item => item.id === id);
    if (index !== -1) {
      const deleted = this.data.splice(index, 1)[0];
      this.save();
      return deleted;
    }
    return null;
  }
  
  // 批量删除
  deleteBatch(ids) {
    const deleted = [];
    ids.forEach(id => {
      const index = this.data.findIndex(item => item.id === id);
      if (index !== -1) {
        deleted.push(this.data.splice(index, 1)[0]);
      }
    });
    if (deleted.length > 0) {
      this.save();
    }
    return deleted;
  }
  
  // 获取所有数据
  getAll() {
    return [...this.data];
  }
  
  // 根据条件查找
  find(predicate) {
    return this.data.find(predicate);
  }
  
  // 根据条件过滤
  filter(predicate) {
    return this.data.filter(predicate);
  }
  
  // 搜索功能
  search(query, fields = ['name', 'title', 'description']) {
    if (!query) return this.data;
    
    const searchTerm = query.toLowerCase().trim();
    return this.data.filter(item => {
      return fields.some(field => {
        const value = this.getNestedValue(item, field);
        return value && value.toString().toLowerCase().includes(searchTerm);
      });
    });
  }
  
  // 排序功能
  sort(field, direction = 'asc') {
    return [...this.data].sort((a, b) => {
      const aVal = this.getNestedValue(a, field);
      const bVal = this.getNestedValue(b, field);
      
      if (direction === 'asc') {
        return aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
      } else {
        return aVal > bVal ? -1 : aVal < bVal ? 1 : 0;
      }
    });
  }
  
  // 分页功能
  paginate(page = 1, pageSize = 10) {
    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    return {
      data: this.data.slice(start, end),
      pagination: {
        page,
        pageSize,
        total: this.data.length,
        totalPages: Math.ceil(this.data.length / pageSize),
        hasNext: end < this.data.length,
        hasPrev: page > 1
      }
    };
  }
  
  // 统计功能
  getStats() {
    return {
      total: this.data.length,
      createdToday: this.data.filter(item => 
        new Date(item.createdAt).toDateString() === new Date().toDateString()
      ).length,
      createdThisWeek: this.data.filter(item => {
        const created = new Date(item.createdAt);
        const now = new Date();
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        return created >= weekAgo;
      }).length
    };
  }
  
  // 辅助方法：生成ID
  generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }
  
  // 辅助方法：获取嵌套属性值
  getNestedValue(obj, path) {
    return path.split('.').reduce((current, key) => current?.[key], obj);
  }
}

// 全局初始化
window.appDataManager = new AppDataManager();
\`\`\`

## 🔍 通用搜索和过滤系统

\`\`\`javascript
// 实时搜索管理器
class SearchManager {
  constructor() {
    this.activeSearches = new Map();
  }
  
  // 设置搜索功能
  setupSearch(config) {
    const {
      inputSelector,
      targetSelector,
      dataStore,
      searchFields = ['name', 'title'],
      placeholder = '搜索...',
      debounceTime = 300
    } = config;
    
    const searchInput = document.querySelector(inputSelector);
    const targetContainer = document.querySelector(targetSelector);
    
    if (!searchInput || !targetContainer) return;
    
    // 设置占位符
    searchInput.placeholder = placeholder;
    
    // 防抖搜索
    let timeoutId;
    const performSearch = (query) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        this.executeSearch(query, dataStore, searchFields, targetContainer);
      }, debounceTime);
    };
    
    // 绑定事件
    searchInput.addEventListener('input', (e) => performSearch(e.target.value));
    searchInput.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        searchInput.value = '';
        performSearch('');
      }
    });
    
    // 保存搜索配置
    this.activeSearches.set(inputSelector, config);
  }
  
  // 执行搜索
  executeSearch(query, dataStore, searchFields, container) {
    const results = dataStore.search(query, searchFields);
    
    // 触发自定义事件
    const searchEvent = new CustomEvent('searchResults', {
      detail: { query, results, total: results.length }
    });
    container.dispatchEvent(searchEvent);
    
    // 高亮搜索结果
    if (query) {
      this.highlightResults(container, query);
    }
  }
  
  // 高亮搜索关键词
  highlightResults(container, query) {
    const regex = new RegExp(\`(\${query})\`, 'gi');
    const walker = document.createTreeWalker(
      container,
      NodeFilter.SHOW_TEXT,
      null,
      false
    );
    
    const textNodes = [];
    let node;
    while (node = walker.nextNode()) {
      if (node.textContent.toLowerCase().includes(query.toLowerCase())) {
        textNodes.push(node);
      }
    }
    
    textNodes.forEach(textNode => {
      const highlightedHTML = textNode.textContent.replace(regex, '<mark class="bg-yellow-200 dark:bg-yellow-600">$1</mark>');
      const span = document.createElement('span');
      span.innerHTML = highlightedHTML;
      textNode.parentNode.replaceChild(span, textNode);
    });
  }
}

// 全局搜索管理器
window.searchManager = new SearchManager();
\`\`\`

## 📋 表单验证和处理系统

\`\`\`javascript
// 表单管理器
class FormManager {
  constructor() {
    this.forms = new Map();
    this.validators = new Map();
  }
  
  // 注册表单
  registerForm(formSelector, config = {}) {
    const form = document.querySelector(formSelector);
    if (!form) return;
    
    const formConfig = {
      validateOnBlur: true,
      validateOnSubmit: true,
      showSuccessMessage: true,
      resetAfterSubmit: false,
      ...config
    };
    
    this.forms.set(formSelector, formConfig);
    this.setupFormValidation(form, formConfig);
  }
  
  // 设置表单验证
  setupFormValidation(form, config) {
    const inputs = form.querySelectorAll('input, textarea, select');
    
    // 为每个输入框设置验证
    inputs.forEach(input => {
      if (config.validateOnBlur) {
        input.addEventListener('blur', () => this.validateField(input));
      }
      
      input.addEventListener('input', () => {
        this.clearFieldError(input);
      });
    });
    
    // 表单提交处理
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      
      if (config.validateOnSubmit) {
        const isValid = this.validateForm(form);
        if (!isValid) return;
      }
      
      this.handleFormSubmit(form, config);
    });
  }
  
  // 验证单个字段
  validateField(input) {
    const rules = this.getValidationRules(input);
    const value = input.value.trim();
    
    for (const rule of rules) {
      const result = rule.validator(value, input);
      if (!result.isValid) {
        this.showFieldError(input, result.message);
        return false;
      }
    }
    
    this.clearFieldError(input);
    return true;
  }
  
  // 验证整个表单
  validateForm(form) {
    const inputs = form.querySelectorAll('input, textarea, select');
    let isValid = true;
    
    inputs.forEach(input => {
      if (!this.validateField(input)) {
        isValid = false;
      }
    });
    
    return isValid;
  }
  
  // 获取验证规则
  getValidationRules(input) {
    const rules = [];
    
    // 必填验证
    if (input.required) {
      rules.push({
        validator: (value) => ({ 
          isValid: value.length > 0, 
          message: '此字段为必填项' 
        })
      });
    }
    
    // 邮箱验证
    if (input.type === 'email') {
      rules.push({
        validator: (value) => {
          if (!value) return { isValid: true, message: '' };
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          return {
            isValid: emailRegex.test(value),
            message: '请输入有效的邮箱地址'
          };
        }
      });
    }
    
    // 最小长度验证
    if (input.minLength) {
      rules.push({
        validator: (value) => ({
          isValid: value.length >= input.minLength,
          message: \`最少需要 \${input.minLength} 个字符\`
        })
      });
    }
    
    // 自定义验证规则
    const customRule = input.dataset.validate;
    if (customRule && this.validators.has(customRule)) {
      rules.push(this.validators.get(customRule));
    }
    
    return rules;
  }
  
  // 显示字段错误
  showFieldError(input, message) {
    this.clearFieldError(input);
    
    input.classList.add('border-red-500', 'dark:border-red-400');
    
    const errorDiv = document.createElement('div');
    errorDiv.className = 'text-red-500 text-sm mt-1 field-error';
    errorDiv.textContent = message;
    
    input.parentNode.appendChild(errorDiv);
  }
  
  // 清除字段错误
  clearFieldError(input) {
    input.classList.remove('border-red-500', 'dark:border-red-400');
    
    const errorDiv = input.parentNode.querySelector('.field-error');
    if (errorDiv) {
      errorDiv.remove();
    }
  }
  
  // 处理表单提交
  handleFormSubmit(form, config) {
    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());
    
    // 显示加载状态
    this.showLoadingState(form, true);
    
    // 触发提交事件
    const submitEvent = new CustomEvent('formSubmit', {
      detail: { data, form }
    });
    form.dispatchEvent(submitEvent);
    
    // 模拟提交延迟
    setTimeout(() => {
      this.showLoadingState(form, false);
      
      if (config.showSuccessMessage) {
        this.showSuccessMessage(form);
      }
      
      if (config.resetAfterSubmit) {
        form.reset();
      }
    }, 1000);
  }
  
  // 显示加载状态
  showLoadingState(form, isLoading) {
    const submitBtn = form.querySelector('button[type="submit"]');
    if (submitBtn) {
      submitBtn.disabled = isLoading;
      submitBtn.textContent = isLoading ? '提交中...' : '提交';
    }
  }
  
  // 显示成功消息
  showSuccessMessage(form) {
    const message = document.createElement('div');
    message.className = 'bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4';
    message.textContent = '提交成功！';
    
    form.insertBefore(message, form.firstChild);
    
    setTimeout(() => message.remove(), 3000);
  }
  
  // 注册自定义验证器
  addValidator(name, validator) {
    this.validators.set(name, validator);
  }
}

// 全局表单管理器
window.formManager = new FormManager();
\`\`\`

## 使用示例

\`\`\`javascript
// 1. 初始化数据存储
const usersStore = appDataManager.getStore('users');
const projectsStore = appDataManager.getStore('projects');

// 2. 设置搜索功能
searchManager.setupSearch({
  inputSelector: '#user-search',
  targetSelector: '#user-list',
  dataStore: usersStore,
  searchFields: ['name', 'email', 'department'],
  placeholder: '搜索用户...'
});

// 3. 注册表单验证
formManager.registerForm('#user-form', {
  validateOnBlur: true,
  showSuccessMessage: true,
  resetAfterSubmit: true
});

// 4. 监听数据变化
appDataManager.subscribe('users', (users) => {
  console.log('用户数据已更新:', users);
  updateUserList(users);
});
\`\`\`
`;

export default STANDARD_DATA_MANAGEMENT_TOOLS; 