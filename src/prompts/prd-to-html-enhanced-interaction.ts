/**
 * 增强交互能力的提示词模板
 * 专门解决HTML原型交互功能不完整的问题
 */

export const ENHANCED_INTERACTION_PROMPT = `
## 🎯 核心要求：100%交互完整性

你不是在创建静态展示页面，而是构建真正可用的产品原型。每个按钮、每个表单、每个交互元素都必须有完整的功能实现。

## 🚫 严格禁止的做法

❌ 绝对不要创建任何无功能的按钮或表单
❌ 不要使用 placeholder 或 "TODO" 注释
❌ 不要创建只有样式没有逻辑的界面
❌ 不要依赖外部数据源或API调用

## ✅ 必须实现的交互功能

### 1. 数据管理系统 (必须实现)

\`\`\`javascript
// 通用数据管理器
class AppDataManager {
  constructor() {
    this.stores = new Map();
  }
  
  getStore(name) {
    if (!this.stores.has(name)) {
      this.stores.set(name, new DataStore(name));
    }
    return this.stores.get(name);
  }
}

class DataStore {
  constructor(storeName) {
    this.storeName = storeName;
    this.data = this.load();
    this.listeners = [];
  }
  
  load() {
    try {
      const stored = localStorage.getItem(this.storeName);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.warn('Failed to load data from localStorage:', error);
      return [];
    }
  }
  
  save() {
    try {
      localStorage.setItem(this.storeName, JSON.stringify(this.data));
      this.notifyListeners();
    } catch (error) {
      console.error('Failed to save data to localStorage:', error);
    }
  }
  
  add(item) {
    const newItem = {
      id: Date.now() + Math.random(),
      createdAt: new Date().toISOString(),
      ...item
    };
    this.data.unshift(newItem);
    this.save();
    return newItem;
  }
  
  update(id, updates) {
    const index = this.data.findIndex(item => item.id === id);
    if (index !== -1) {
      this.data[index] = { ...this.data[index], ...updates, updatedAt: new Date().toISOString() };
      this.save();
      return this.data[index];
    }
    return null;
  }
  
  delete(id) {
    const index = this.data.findIndex(item => item.id === id);
    if (index !== -1) {
      const deleted = this.data.splice(index, 1)[0];
      this.save();
      return deleted;
    }
    return null;
  }
  
  getAll() {
    return [...this.data];
  }
  
  find(predicate) {
    return this.data.find(predicate);
  }
  
  filter(predicate) {
    return this.data.filter(predicate);
  }
  
  subscribe(listener) {
    this.listeners.push(listener);
    return () => {
      const index = this.listeners.indexOf(listener);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }
  
  notifyListeners() {
    this.listeners.forEach(listener => listener(this.data));
  }
}

// 全局数据管理器实例
const appData = new AppDataManager();
\`\`\`

### 2. 搜索和过滤功能 (必须实现)

\`\`\`javascript
// 通用搜索系统
class SearchManager {
  constructor() {
    this.searchInputs = new Map();
  }
  
  setupSearch(inputSelector, targetSelector, searchFields = ['textContent']) {
    const searchInput = document.querySelector(inputSelector);
    const targets = document.querySelectorAll(targetSelector);
    
    if (!searchInput || targets.length === 0) return;
    
    const searchFunction = (query) => {
      const searchTerm = query.toLowerCase().trim();
      
      targets.forEach(target => {
        let shouldShow = false;
        
        if (searchTerm === '') {
          shouldShow = true;
        } else {
          for (const field of searchFields) {
            let text = '';
            if (field === 'textContent') {
              text = target.textContent.toLowerCase();
            } else if (target.dataset[field]) {
              text = target.dataset[field].toLowerCase();
            }
            
            if (text.includes(searchTerm)) {
              shouldShow = true;
              break;
            }
          }
        }
        
        target.style.display = shouldShow ? '' : 'none';
        target.style.opacity = shouldShow ? '1' : '0';
        target.style.transition = 'opacity 0.2s ease';
      });
    };
    
    searchInput.addEventListener('input', (e) => {
      searchFunction(e.target.value);
    });
    
    // 支持实时搜索
    searchInput.addEventListener('keyup', (e) => {
      if (e.key === 'Escape') {
        searchInput.value = '';
        searchFunction('');
      }
    });
    
    return searchFunction;
  }
}

const searchManager = new SearchManager();
\`\`\`

### 3. 表单处理系统 (必须实现)

\`\`\`javascript
// 通用表单管理器
class FormManager {
  constructor() {
    this.forms = new Map();
  }
  
  setupForm(formSelector, options = {}) {
    const form = document.querySelector(formSelector);
    if (!form) return;
    
    const config = {
      validateOnSubmit: true,
      validateOnChange: false,
      resetAfterSubmit: true,
      showSuccessMessage: true,
      ...options
    };
    
    // 表单验证
    const validateForm = () => {
      const inputs = form.querySelectorAll('input, textarea, select');
      let isValid = true;
      const errors = [];
      
      inputs.forEach(input => {
        const value = input.value.trim();
        const isRequired = input.hasAttribute('required');
        
        // 清除之前的错误样式
        input.classList.remove('border-red-500', 'border-green-500');
        
        if (isRequired && !value) {
          input.classList.add('border-red-500');
          errors.push(\`\${input.name || input.placeholder || 'Field'} is required\`);
          isValid = false;
        } else if (value) {
          input.classList.add('border-green-500');
        }
        
        // 特定验证
        if (input.type === 'email' && value && !value.includes('@')) {
          input.classList.add('border-red-500');
          errors.push('Please enter a valid email address');
          isValid = false;
        }
      });
      
      return { isValid, errors };
    };
    
    // 表单提交处理
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      
      if (config.validateOnSubmit) {
        const validation = validateForm();
        if (!validation.isValid) {
          this.showErrors(validation.errors);
          return;
        }
      }
      
      // 获取表单数据
      const formData = new FormData(form);
      const data = {};
      for (let [key, value] of formData.entries()) {
        data[key] = value;
      }
      
      // 触发自定义提交事件
      const submitEvent = new CustomEvent('formSubmit', {
        detail: { data, form }
      });
      form.dispatchEvent(submitEvent);
      
      if (config.resetAfterSubmit) {
        form.reset();
        // 清除验证样式
        form.querySelectorAll('input, textarea, select').forEach(input => {
          input.classList.remove('border-red-500', 'border-green-500');
        });
      }
      
      if (config.showSuccessMessage) {
        this.showSuccess('Data saved successfully!');
      }
    });
    
    // 实时验证
    if (config.validateOnChange) {
      form.addEventListener('input', validateForm);
    }
    
    return form;
  }
  
  showErrors(errors) {
    // 创建或更新错误提示
    let errorContainer = document.querySelector('.form-errors');
    if (!errorContainer) {
      errorContainer = document.createElement('div');
      errorContainer.className = 'form-errors bg-red-50 border border-red-200 rounded p-3 mb-4';
      errorContainer.innerHTML = \`
        <div class="flex items-center gap-2 text-red-700">
          <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd"></path>
          </svg>
          <ul class="text-sm list-disc list-inside"></ul>
        </div>
      \`;
    }
    
    const errorList = errorContainer.querySelector('ul');
    errorList.innerHTML = errors.map(error => \`<li>\${error}</li>\`).join('');
    
    // 插入到第一个表单前面
    const firstForm = document.querySelector('form');
    if (firstForm && !document.querySelector('.form-errors')) {
      firstForm.parentNode.insertBefore(errorContainer, firstForm);
    }
    
    // 3秒后自动隐藏
    setTimeout(() => {
      if (errorContainer.parentNode) {
        errorContainer.parentNode.removeChild(errorContainer);
      }
    }, 5000);
  }
  
  showSuccess(message) {
    // 创建成功提示
    const successContainer = document.createElement('div');
    successContainer.className = 'form-success fixed top-4 right-4 bg-green-50 border border-green-200 rounded p-3 z-50';
    successContainer.innerHTML = \`
      <div class="flex items-center gap-2 text-green-700">
        <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path>
        </svg>
        <span class="text-sm">\${message}</span>
      </div>
    \`;
    
    document.body.appendChild(successContainer);
    
    // 3秒后自动移除
    setTimeout(() => {
      if (successContainer.parentNode) {
        successContainer.parentNode.removeChild(successContainer);
      }
    }, 3000);
  }
}

const formManager = new FormManager();
\`\`\`

### 4. 响应式布局系统 (必须实现)

\`\`\`javascript
// 响应式管理器
class ResponsiveManager {
  constructor() {
    this.breakpoints = {
      mobile: 768,
      tablet: 1024,
      desktop: 1200
    };
    this.currentViewport = this.getViewport();
    this.listeners = [];
    
    this.init();
  }
  
  init() {
    // 监听窗口大小变化
    window.addEventListener('resize', this.handleResize.bind(this));
    // 初始设置
    this.handleResize();
  }
  
  getViewport() {
    const width = window.innerWidth;
    if (width < this.breakpoints.mobile) return 'mobile';
    if (width < this.breakpoints.tablet) return 'tablet';
    return 'desktop';
  }
  
  handleResize() {
    const newViewport = this.getViewport();
    if (newViewport !== this.currentViewport) {
      this.currentViewport = newViewport;
      this.updateLayout();
      this.notifyListeners(newViewport);
    }
  }
  
  updateLayout() {
    // 更新body的数据属性
    document.body.dataset.viewport = this.currentViewport;
    
    // 切换侧边栏显示
    const sidebar = document.querySelector('aside, .sidebar');
    if (sidebar) {
      if (this.currentViewport === 'mobile') {
        sidebar.style.transform = 'translateX(-100%)';
        sidebar.style.position = 'fixed';
        sidebar.style.zIndex = '1000';
      } else {
        sidebar.style.transform = 'translateX(0)';
        sidebar.style.position = 'relative';
        sidebar.style.zIndex = 'auto';
      }
    }
    
    // 调整表格显示
    const tables = document.querySelectorAll('table');
    tables.forEach(table => {
      const wrapper = table.closest('.overflow-x-auto');
      if (wrapper) {
        if (this.currentViewport === 'mobile') {
          wrapper.style.overflowX = 'auto';
          table.style.minWidth = '600px';
        } else {
          wrapper.style.overflowX = 'visible';
          table.style.minWidth = 'auto';
        }
      }
    });
    
    // 调整网格布局
    const grids = document.querySelectorAll('.grid');
    grids.forEach(grid => {
      grid.className = grid.className.replace(/grid-cols-\d+/g, '');
      
      if (this.currentViewport === 'mobile') {
        grid.classList.add('grid-cols-1');
      } else if (this.currentViewport === 'tablet') {
        grid.classList.add('grid-cols-2');
      } else {
        grid.classList.add('grid-cols-4');
      }
    });
  }
  
  subscribe(listener) {
    this.listeners.push(listener);
    return () => {
      const index = this.listeners.indexOf(listener);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }
  
  notifyListeners(viewport) {
    this.listeners.forEach(listener => listener(viewport));
  }
}

const responsiveManager = new ResponsiveManager();
\`\`\`

### 5. 模态框和弹窗系统 (必须实现)

\`\`\`javascript
// 模态框管理器
class ModalManager {
  constructor() {
    this.activeModal = null;
  }
  
  create(options = {}) {
    const config = {
      title: 'Modal',
      content: '',
      showCloseButton: true,
      closeOnOverlayClick: true,
      closeOnEscape: true,
      buttons: [],
      ...options
    };
    
    // 创建模态框HTML
    const modal = document.createElement('div');
    modal.className = 'modal-overlay fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 opacity-0';
    modal.style.transition = 'opacity 0.3s ease';
    
    modal.innerHTML = \`
      <div class="modal-content bg-white rounded-lg shadow-xl max-w-md w-full mx-4 transform scale-95">
        <div class="modal-header flex items-center justify-between p-4 border-b">
          <h3 class="text-lg font-semibold">\${config.title}</h3>
          \${config.showCloseButton ? '<button class="modal-close text-gray-400 hover:text-gray-600"><svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg></button>' : ''}
        </div>
        <div class="modal-body p-4">
          \${config.content}
        </div>
        \${config.buttons.length > 0 ? \`
          <div class="modal-footer flex justify-end gap-2 p-4 border-t">
            \${config.buttons.map(btn => \`
              <button class="modal-btn px-4 py-2 rounded \${btn.className || 'bg-gray-200 hover:bg-gray-300'}" data-action="\${btn.action || ''}">\${btn.text}</button>
            \`).join('')}
          </div>
        \` : ''}
      </div>
    \`;
    
    // 事件处理
    const closeModal = () => {
      modal.style.opacity = '0';
      modal.querySelector('.modal-content').style.transform = 'scale(0.95)';
      setTimeout(() => {
        if (modal.parentNode) {
          modal.parentNode.removeChild(modal);
        }
        this.activeModal = null;
      }, 300);
    };
    
    // 关闭按钮
    const closeButton = modal.querySelector('.modal-close');
    if (closeButton) {
      closeButton.addEventListener('click', closeModal);
    }
    
    // 点击遮罩关闭
    if (config.closeOnOverlayClick) {
      modal.addEventListener('click', (e) => {
        if (e.target === modal) {
          closeModal();
        }
      });
    }
    
    // ESC键关闭
    if (config.closeOnEscape) {
      const escapeHandler = (e) => {
        if (e.key === 'Escape') {
          closeModal();
          document.removeEventListener('keydown', escapeHandler);
        }
      };
      document.addEventListener('keydown', escapeHandler);
    }
    
    // 按钮事件
    modal.querySelectorAll('.modal-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const action = e.target.dataset.action;
        if (action) {
          const event = new CustomEvent('modalAction', {
            detail: { action, modal, closeModal }
          });
          modal.dispatchEvent(event);
        }
      });
    });
    
    // 显示模态框
    document.body.appendChild(modal);
    this.activeModal = modal;
    
    // 动画显示
    requestAnimationFrame(() => {
      modal.style.opacity = '1';
      modal.querySelector('.modal-content').style.transform = 'scale(1)';
    });
    
    return {
      modal,
      close: closeModal
    };
  }
  
  alert(message, title = 'Alert') {
    return this.create({
      title,
      content: \`<p>\${message}</p>\`,
      buttons: [
        { text: 'OK', className: 'bg-blue-500 text-white hover:bg-blue-600', action: 'ok' }
      ]
    });
  }
  
  confirm(message, title = 'Confirm') {
    return this.create({
      title,
      content: \`<p>\${message}</p>\`,
      buttons: [
        { text: 'Cancel', className: 'bg-gray-200 hover:bg-gray-300', action: 'cancel' },
        { text: 'Confirm', className: 'bg-red-500 text-white hover:bg-red-600', action: 'confirm' }
      ]
    });
  }
}

const modalManager = new ModalManager();
\`\`\`

## 🔧 初始化脚本 (必须添加到页面底部)

\`\`\`javascript
// 页面初始化
document.addEventListener('DOMContentLoaded', function() {
  console.log('🚀 初始化交互式原型...');
  
  // 1. 初始化数据存储 (根据产品类型调整)
  const tasksStore = appData.getStore('tasks');
  const usersStore = appData.getStore('users');
  
  // 2. 设置搜索功能
  searchManager.setupSearch('input[placeholder*="search"], input[placeholder*="搜索"]', '[data-searchable], tbody tr');
  
  // 3. 设置表单处理
  const forms = document.querySelectorAll('form');
  forms.forEach(form => {
    formManager.setupForm(form);
  });
  
  // 4. 设置按钮交互
  setupButtonInteractions();
  
  // 5. 设置表格交互
  setupTableInteractions();
  
  // 6. 初始化示例数据 (如果没有现有数据)
  initializeExampleData();
  
  console.log('✅ 交互式原型初始化完成');
});

function setupButtonInteractions() {
  // 添加按钮
  document.querySelectorAll('button:contains("Add"), button:contains("添加"), button:contains("Create"), button:contains("新建")').forEach(btn => {
    if (!btn.dataset.initialized) {
      btn.addEventListener('click', handleAddAction);
      btn.dataset.initialized = 'true';
    }
  });
  
  // 编辑按钮
  document.querySelectorAll('button[data-action="edit"], .edit-btn, button:has(svg[data-lucide="edit"])').forEach(btn => {
    if (!btn.dataset.initialized) {
      btn.addEventListener('click', handleEditAction);
      btn.dataset.initialized = 'true';
    }
  });
  
  // 删除按钮
  document.querySelectorAll('button[data-action="delete"], .delete-btn, button:has(svg[data-lucide="trash-2"])').forEach(btn => {
    if (!btn.dataset.initialized) {
      btn.addEventListener('click', handleDeleteAction);
      btn.dataset.initialized = 'true';
    }
  });
}

function setupTableInteractions() {
  // 使表格行可点击
  document.querySelectorAll('tbody tr').forEach(row => {
    if (!row.dataset.initialized) {
      row.style.cursor = 'pointer';
      row.addEventListener('click', function(e) {
        if (!e.target.closest('button')) {
          row.classList.toggle('bg-blue-50');
        }
      });
      row.dataset.initialized = 'true';
      row.dataset.searchable = 'true';
    }
  });
}

function handleAddAction(e) {
  e.preventDefault();
  
  // 根据上下文确定要添加的内容类型
  const context = e.target.closest('section') || document;
  const title = context.querySelector('h1, h2, h3')?.textContent || 'Add Item';
  
  const modal = modalManager.create({
    title: \`Add New \${title.replace(/list|管理|List/gi, '').trim()}\`,
    content: generateAddForm(title),
    buttons: [
      { text: 'Cancel', className: 'bg-gray-200 hover:bg-gray-300', action: 'cancel' },
      { text: 'Save', className: 'bg-blue-500 text-white hover:bg-blue-600', action: 'save' }
    ]
  });
  
  modal.modal.addEventListener('modalAction', function(e) {
    if (e.detail.action === 'save') {
      const form = modal.modal.querySelector('form');
      const formData = new FormData(form);
      const data = Object.fromEntries(formData.entries());
      
      // 保存数据并更新界面
      const store = appData.getStore('items');
      const newItem = store.add(data);
      addItemToUI(newItem);
      
      e.detail.closeModal();
    } else if (e.detail.action === 'cancel') {
      e.detail.closeModal();
    }
  });
}

function generateAddForm(context) {
  // 根据上下文生成合适的表单
  if (context.toLowerCase().includes('task')) {
    return \`
      <form class="space-y-4">
        <div>
          <label class="block text-sm font-medium mb-1">Task Title</label>
          <input type="text" name="title" required class="w-full border border-gray-300 rounded px-3 py-2" placeholder="Enter task title">
        </div>
        <div>
          <label class="block text-sm font-medium mb-1">Category</label>
          <select name="category" required class="w-full border border-gray-300 rounded px-3 py-2">
            <option value="">Select category</option>
            <option value="Development">Development</option>
            <option value="Design">Design</option>
            <option value="Documentation">Documentation</option>
            <option value="Testing">Testing</option>
          </select>
        </div>
        <div>
          <label class="block text-sm font-medium mb-1">Priority</label>
          <select name="priority" required class="w-full border border-gray-300 rounded px-3 py-2">
            <option value="">Select priority</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>
        </div>
        <div>
          <label class="block text-sm font-medium mb-1">Due Date</label>
          <input type="date" name="dueDate" required class="w-full border border-gray-300 rounded px-3 py-2">
        </div>
        <div>
          <label class="block text-sm font-medium mb-1">Description</label>
          <textarea name="description" rows="3" class="w-full border border-gray-300 rounded px-3 py-2" placeholder="Task description"></textarea>
        </div>
      </form>
    \`;
  }
  
  // 通用表单
  return \`
    <form class="space-y-4">
      <div>
        <label class="block text-sm font-medium mb-1">Name</label>
        <input type="text" name="name" required class="w-full border border-gray-300 rounded px-3 py-2" placeholder="Enter name">
      </div>
      <div>
        <label class="block text-sm font-medium mb-1">Description</label>
        <textarea name="description" rows="3" class="w-full border border-gray-300 rounded px-3 py-2" placeholder="Enter description"></textarea>
      </div>
    </form>
  \`;
}

function addItemToUI(item) {
  // 找到表格并添加新行
  const tbody = document.querySelector('tbody');
  if (tbody) {
    const row = document.createElement('tr');
    row.className = 'hover:bg-gray-50';
    row.dataset.searchable = 'true';
    
    row.innerHTML = \`
      <td class="px-6 py-4 whitespace-nowrap">\${item.title || item.name}</td>
      <td class="px-6 py-4 whitespace-nowrap">\${item.category || 'General'}</td>
      <td class="px-6 py-4 whitespace-nowrap">\${item.priority || 'Medium'}</td>
      <td class="px-6 py-4 whitespace-nowrap">\${item.dueDate || new Date().toISOString().split('T')[0]}</td>
      <td class="px-6 py-4 whitespace-nowrap">Pending</td>
      <td class="px-6 py-4 whitespace-nowrap text-right">
        <button class="text-blue-500 hover:text-blue-700 mr-2" data-action="edit"><i data-lucide="edit" class="w-4 h-4"></i></button>
        <button class="text-red-500 hover:text-red-700" data-action="delete"><i data-lucide="trash-2" class="w-4 h-4"></i></button>
      </td>
    \`;
    
    tbody.insertBefore(row, tbody.firstChild);
    setupTableInteractions();
    setupButtonInteractions();
    
    // 重新创建图标
    if (typeof lucide !== 'undefined') {
      lucide.createIcons();
    }
  }
}

function initializeExampleData() {
  // 初始化一些示例数据
  const tasksStore = appData.getStore('tasks');
  if (tasksStore.getAll().length === 0) {
    const exampleTasks = [
      { title: 'Design Homepage', category: 'Design', priority: 'High', dueDate: '2024-03-15', status: 'In Progress' },
      { title: 'Develop API', category: 'Development', priority: 'High', dueDate: '2024-03-20', status: 'Completed' },
      { title: 'Write Documentation', category: 'Documentation', priority: 'Medium', dueDate: '2024-03-25', status: 'Pending' }
    ];
    
    exampleTasks.forEach(task => tasksStore.add(task));
  }
}

// 辅助函数：按钮文本包含检查
function getElementByText(selector, text) {
  return Array.from(document.querySelectorAll(selector)).find(el => 
    el.textContent.trim().toLowerCase().includes(text.toLowerCase())
  );
}
\`\`\`

## 📱 响应式CSS增强 (必须添加)

\`\`\`css
/* 响应式增强样式 */
@media (max-width: 768px) {
  .mobile-hidden { display: none !important; }
  .mobile-full { width: 100% !important; }
  .mobile-stack { flex-direction: column !important; }
  
  /* 表格移动端优化 */
  .table-responsive {
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
  }
  
  /* 导航移动端优化 */
  .nav-mobile {
    position: fixed !important;
    top: 0;
    left: -100%;
    width: 80%;
    height: 100vh;
    background: white;
    transition: left 0.3s ease;
    z-index: 1000;
  }
  
  .nav-mobile.open {
    left: 0;
  }
}

/* 动画增强 */
.animate-fade-in {
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

.animate-slide-in {
  animation: slideIn 0.3s ease;
}

@keyframes slideIn {
  from { transform: translateX(-100%); }
  to { transform: translateX(0); }
}

/* 交互状态增强 */
.interactive:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transition: all 0.2s ease;
}

.btn-loading {
  position: relative;
  color: transparent !important;
}

.btn-loading::after {
  content: '';
  position: absolute;
  width: 16px;
  height: 16px;
  top: 50%;
  left: 50%;
  margin-left: -8px;
  margin-top: -8px;
  border: 2px solid #ffffff;
  border-radius: 50%;
  border-top-color: transparent;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
\`\`\`

记住：这不是可选功能，这些都是必须实现的基础交互能力！每个原型都必须是真正可用的产品界面。
`;

export default ENHANCED_INTERACTION_PROMPT; 