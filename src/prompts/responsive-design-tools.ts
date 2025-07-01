/**
 * 响应式设计工具库 - Phase F.3
 * 为HTML原型提供完整的响应式设计解决方案
 */

export const RESPONSIVE_DESIGN_TOOLS = `
# 📱 响应式设计工具库

## 🎨 Franken/UI 响应式类系统

### 基础响应式类（uk-width-*）
- **手机**: uk-width-1-1 (100%)
- **平板**: uk-width-1-2@s (50%@small), uk-width-1-3@s (33%@small)
- **桌面**: uk-width-1-4@m (25%@medium), uk-width-1-6@l (16.7%@large)

### 响应式网格（uk-grid）
\`\`\`html
<!-- 响应式网格布局 -->
<div class="uk-grid-small uk-child-width-1-1 uk-child-width-1-2@s uk-child-width-1-3@m" uk-grid>
    <div>项目1</div>
    <div>项目2</div>
    <div>项目3</div>
</div>
\`\`\`

### 响应式可见性
- **隐藏**: uk-hidden@s (小屏隐藏), uk-hidden@m (中屏隐藏)
- **显示**: uk-visible@s (小屏显示), uk-visible@m (中屏显示)

### 响应式文字
- **大小**: uk-text-small@s, uk-text-large@m
- **对齐**: uk-text-left@s, uk-text-center@m, uk-text-right@l

## 🔧 响应式管理器（核心系统）

\`\`\`javascript
// 响应式管理器 - 统一的响应式解决方案
class ResponsiveManager {
  constructor() {
    this.breakpoints = {
      xs: 0,
      sm: 640,
      md: 768,
      lg: 1024,
      xl: 1280,
      '2xl': 1536
    };
    
    this.currentBreakpoint = this.getCurrentBreakpoint();
    this.listeners = [];
    this.components = new Map();
    
    this.init();
  }
  
  // 初始化响应式监听
  init() {
    // 监听窗口大小变化
    window.addEventListener('resize', this.debounce(() => {
      const newBreakpoint = this.getCurrentBreakpoint();
      if (newBreakpoint !== this.currentBreakpoint) {
        const oldBreakpoint = this.currentBreakpoint;
        this.currentBreakpoint = newBreakpoint;
        this.notifyBreakpointChange(oldBreakpoint, newBreakpoint);
      }
    }, 100));
    
    // 初始化响应式组件
    this.initializeResponsiveComponents();
  }
  
  // 获取当前断点
  getCurrentBreakpoint() {
    const width = window.innerWidth;
    
    if (width >= this.breakpoints['2xl']) return '2xl';
    if (width >= this.breakpoints.xl) return 'xl';
    if (width >= this.breakpoints.lg) return 'lg';
    if (width >= this.breakpoints.md) return 'md';
    if (width >= this.breakpoints.sm) return 'sm';
    return 'xs';
  }
  
  // 检查是否为移动设备
  isMobile() {
    return ['xs', 'sm'].includes(this.currentBreakpoint);
  }
  
  // 检查是否为桌面设备
  isDesktop() {
    return ['lg', 'xl', '2xl'].includes(this.currentBreakpoint);
  }
  
  // 添加断点变化监听器
  addBreakpointListener(callback) {
    this.listeners.push(callback);
    return () => {
      const index = this.listeners.indexOf(callback);
      if (index > -1) this.listeners.splice(index, 1);
    };
  }
  
  // 通知断点变化
  notifyBreakpointChange(oldBreakpoint, newBreakpoint) {
    this.listeners.forEach(callback => {
      callback({
        oldBreakpoint,
        newBreakpoint,
        isMobile: this.isMobile(),
        isDesktop: this.isDesktop(),
        width: window.innerWidth,
        height: window.innerHeight
      });
    });
    
    // 更新响应式组件
    this.updateResponsiveComponents();
  }
  
  // 初始化响应式组件
  initializeResponsiveComponents() {
    // 导航菜单响应式
    this.setupResponsiveNavigation();
    
    // 表格响应式
    this.setupResponsiveTables();
    
    // 网格布局响应式
    this.setupResponsiveGrids();
  }
  
  // 更新响应式组件
  updateResponsiveComponents() {
    this.components.forEach((component, selector) => {
      component.update(this);
    });
  }
  
  // 注册响应式组件
  registerComponent(selector, component) {
    this.components.set(selector, component);
  }
  
  // 防抖函数
  debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }
  
  // 设置响应式导航
  setupResponsiveNavigation() {
    const navs = document.querySelectorAll('[data-responsive="nav"]');
    
    navs.forEach(nav => {
      const mobileToggle = nav.querySelector('[data-mobile-toggle]');
      const mobileMenu = nav.querySelector('[data-mobile-menu]');
      
      if (mobileToggle && mobileMenu) {
        // 移动端菜单切换
        mobileToggle.addEventListener('click', () => {
          const isOpen = mobileMenu.classList.contains('active');
          if (isOpen) {
            mobileMenu.classList.remove('active');
            mobileToggle.setAttribute('aria-expanded', 'false');
          } else {
            mobileMenu.classList.add('active');
            mobileToggle.setAttribute('aria-expanded', 'true');
          }
        });
        
        // 响应式组件
        this.registerComponent(nav, {
          update: (rm) => {
            if (rm.isMobile()) {
              mobileToggle.style.display = 'block';
              mobileMenu.classList.add('mobile-layout');
            } else {
              mobileToggle.style.display = 'none';
              mobileMenu.classList.remove('mobile-layout', 'active');
              mobileToggle.setAttribute('aria-expanded', 'false');
            }
          }
        });
      }
    });
  }
  
  // 设置响应式表格
  setupResponsiveTables() {
    const tables = document.querySelectorAll('table[data-responsive]');
    
    tables.forEach(table => {
      this.registerComponent(table, {
        update: (rm) => {
          if (rm.isMobile()) {
            table.style.fontSize = '14px';
            table.parentNode.style.overflowX = 'auto';
          } else {
            table.style.fontSize = '';
            table.parentNode.style.overflowX = 'visible';
          }
        }
      });
    });
  }
  
  // 设置响应式网格
  setupResponsiveGrids() {
    const grids = document.querySelectorAll('[data-responsive="grid"]');
    
    grids.forEach(grid => {
      const config = {
        xs: grid.dataset.colsXs || '1',
        sm: grid.dataset.colsSm || '2',
        md: grid.dataset.colsMd || '3',
        lg: grid.dataset.colsLg || '4',
        xl: grid.dataset.colsXl || '4',
        '2xl': grid.dataset.cols2xl || '4'
      };
      
      this.registerComponent(grid, {
        update: (rm) => {
          // 清除旧的grid类
          grid.className = grid.className.replace(/grid-cols-\\d+/g, '');
          
          // 添加当前断点的grid类
          const cols = config[rm.currentBreakpoint];
          grid.classList.add(\`grid-cols-\${cols}\`);
        }
      });
    });
  }
}

// 全局响应式管理器
window.responsiveManager = new ResponsiveManager();
\`\`\`

## 🎨 响应式工具函数集

\`\`\`javascript
// 响应式工具函数
const ResponsiveUtils = {
  // 获取设备信息
  getDeviceInfo() {
    const rm = window.responsiveManager;
    return {
      breakpoint: rm.currentBreakpoint,
      isMobile: rm.isMobile(),
      isDesktop: rm.isDesktop(),
      width: window.innerWidth,
      height: window.innerHeight,
      pixelRatio: window.devicePixelRatio || 1,
      orientation: window.innerHeight > window.innerWidth ? 'portrait' : 'landscape'
    };
  },
  
  // 动态加载CSS
  loadResponsiveCSS() {
    const css = \`
      /* 响应式基础样式 */
      .table-responsive {
        border-radius: 0.5rem;
        border: 1px solid #e5e7eb;
      }
      
      .mobile-modal {
        width: 95% !important;
        max-width: none !important;
        border-radius: 0.75rem 0.75rem 0 0 !important;
        position: fixed !important;
        bottom: 0 !important;
        left: 50% !important;
        transform: translateX(-50%) !important;
        margin: 0 !important;
      }
      
      .sidebar-overlay {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.5);
        z-index: 40;
        transition: opacity 0.3s ease;
      }
      
      [data-responsive="sidebar"].mobile-layout {
        position: fixed;
        top: 0;
        left: 0;
        height: 100vh;
        z-index: 50;
        transform: translateX(-100%);
        transition: transform 0.3s ease;
      }
      
      [data-responsive="sidebar"].mobile-layout.open {
        transform: translateX(0);
      }
      
      [data-responsive="sidebar"].desktop-layout {
        position: relative;
        transform: none;
      }
      
      [data-mobile-menu].mobile-layout {
        position: absolute;
        top: 100%;
        left: 0;
        right: 0;
        background: white;
        border-radius: 0 0 0.5rem 0.5rem;
        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        transform: translateY(-10px);
        opacity: 0;
        visibility: hidden;
        transition: all 0.3s ease;
      }
      
      [data-mobile-menu].mobile-layout.active {
        transform: translateY(0);
        opacity: 1;
        visibility: visible;
      }
      
      /* 响应式文字大小 */
      @media (max-width: 640px) {
        .responsive-text-xs { font-size: 0.75rem; }
        .responsive-text-sm { font-size: 0.875rem; }
        .responsive-text-base { font-size: 0.875rem; }
        .responsive-text-lg { font-size: 1rem; }
        .responsive-text-xl { font-size: 1.125rem; }
        .responsive-text-2xl { font-size: 1.25rem; }
        .responsive-text-3xl { font-size: 1.5rem; }
      }
      
      /* 响应式间距 */
      @media (max-width: 640px) {
        .responsive-p-4 { padding: 1rem; }
        .responsive-p-6 { padding: 1rem; }
        .responsive-p-8 { padding: 1.5rem; }
        .responsive-m-4 { margin: 1rem; }
        .responsive-m-6 { margin: 1rem; }
        .responsive-m-8 { margin: 1.5rem; }
      }
    \`;
    
    const style = document.createElement('style');
    style.textContent = css;
    document.head.appendChild(style);
  },
  
  // 设置响应式字体
  setupResponsiveFonts() {
    const elements = document.querySelectorAll('[data-responsive-font]');
    
    elements.forEach(element => {
      const sizes = {
        xs: element.dataset.fontXs,
        sm: element.dataset.fontSm,
        md: element.dataset.fontMd,
        lg: element.dataset.fontLg,
        xl: element.dataset.fontXl,
        '2xl': element.dataset.font2xl
      };
      
      window.responsiveManager.addBreakpointListener(({newBreakpoint}) => {
        if (sizes[newBreakpoint]) {
          element.style.fontSize = sizes[newBreakpoint];
        }
      });
    });
  },
  
  // 设置响应式图片
  setupResponsiveImages() {
    const images = document.querySelectorAll('img[data-responsive]');
    
    images.forEach(img => {
      // 懒加载
      if ('IntersectionObserver' in window) {
        const observer = new IntersectionObserver((entries) => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              const src = img.dataset.src;
              if (src) {
                img.src = src;
                img.removeAttribute('data-src');
                observer.unobserve(img);
              }
            }
          });
        });
        
        observer.observe(img);
      }
      
      // 响应式尺寸
      window.responsiveManager.addBreakpointListener(({isMobile, isTablet}) => {
        if (isMobile) {
          img.style.maxWidth = '100%';
          img.style.height = 'auto';
        } else if (isTablet) {
          img.style.maxWidth = '80%';
          img.style.height = 'auto';
        } else {
          img.style.maxWidth = img.dataset.maxWidth || 'none';
          img.style.height = img.dataset.height || 'auto';
        }
      });
    });
  },
  
  // 触摸手势支持
  setupTouchGestures() {
    let startX, startY, endX, endY;
    
    document.addEventListener('touchstart', (e) => {
      startX = e.touches[0].clientX;
      startY = e.touches[0].clientY;
    });
    
    document.addEventListener('touchend', (e) => {
      endX = e.changedTouches[0].clientX;
      endY = e.changedTouches[0].clientY;
      
      const deltaX = endX - startX;
      const deltaY = endY - startY;
      
      // 左滑手势
      if (deltaX < -50 && Math.abs(deltaY) < 100) {
        document.dispatchEvent(new CustomEvent('swipeleft', {
          detail: { deltaX, deltaY, target: e.target }
        }));
      }
      
      // 右滑手势
      if (deltaX > 50 && Math.abs(deltaY) < 100) {
        document.dispatchEvent(new CustomEvent('swiperight', {
          detail: { deltaX, deltaY, target: e.target }
        }));
      }
    });
  }
};

// 自动初始化
document.addEventListener('DOMContentLoaded', () => {
  ResponsiveUtils.loadResponsiveCSS();
  ResponsiveUtils.setupResponsiveFonts();
  ResponsiveUtils.setupResponsiveImages();
  ResponsiveUtils.setupTouchGestures();
});
\`\`\`

## 📱 移动端优化组件

\`\`\`javascript
// 移动端特殊优化
const MobileOptimizations = {
  // 安全区域适配（iOS）
  setupSafeArea() {
    const css = \`
      :root {
        --safe-area-inset-top: env(safe-area-inset-top);
        --safe-area-inset-bottom: env(safe-area-inset-bottom);
        --safe-area-inset-left: env(safe-area-inset-left);
        --safe-area-inset-right: env(safe-area-inset-right);
      }
      
      .safe-area-top {
        padding-top: var(--safe-area-inset-top);
      }
      
      .safe-area-bottom {
        padding-bottom: var(--safe-area-inset-bottom);
      }
    \`;
    
    const style = document.createElement('style');
    style.textContent = css;
    document.head.appendChild(style);
  },
  
  // 禁用移动端缩放
  disablePinchZoom() {
    document.addEventListener('gesturestart', (e) => e.preventDefault());
    document.addEventListener('gesturechange', (e) => e.preventDefault());
    document.addEventListener('gestureend', (e) => e.preventDefault());
  },
  
  // 移动端键盘适配
  setupKeyboardHandling() {
    let originalHeight = window.innerHeight;
    
    window.addEventListener('resize', () => {
      const currentHeight = window.innerHeight;
      const heightDiff = originalHeight - currentHeight;
      
      if (heightDiff > 150) {
        // 键盘弹出
        document.body.classList.add('keyboard-open');
        document.body.style.paddingBottom = \`\${heightDiff}px\`;
      } else {
        // 键盘收起
        document.body.classList.remove('keyboard-open');
        document.body.style.paddingBottom = '';
      }
    });
  },
  
  // 移动端点击延迟优化
  setupFastClick() {
    let lastTouchTime = 0;
    
    document.addEventListener('touchstart', (e) => {
      lastTouchTime = Date.now();
    });
    
    document.addEventListener('click', (e) => {
      const timeDiff = Date.now() - lastTouchTime;
      if (timeDiff > 300) {
        e.preventDefault();
        e.stopPropagation();
      }
    });
  }
};

// 移动端初始化
if (window.responsiveManager.isMobile()) {
  MobileOptimizations.setupSafeArea();
  MobileOptimizations.disablePinchZoom();
  MobileOptimizations.setupKeyboardHandling();
  MobileOptimizations.setupFastClick();
}
\`\`\`

## 使用示例

\`\`\`html
<!-- 响应式导航 -->
<nav data-responsive="nav" class="bg-white shadow">
  <div class="max-w-7xl mx-auto px-4">
    <div class="flex justify-between items-center h-16">
      <div class="flex-shrink-0">
        <h1 class="text-xl font-bold">Logo</h1>
      </div>
      
      <!-- 桌面菜单 -->
      <div class="hidden md:block" data-mobile-menu>
        <a href="#" class="px-3 py-2 text-gray-700 hover:text-gray-900">首页</a>
        <a href="#" class="px-3 py-2 text-gray-700 hover:text-gray-900">产品</a>
        <a href="#" class="px-3 py-2 text-gray-700 hover:text-gray-900">关于</a>
      </div>
      
      <!-- 移动端菜单按钮 -->
      <button data-mobile-toggle class="md:hidden">
        <span class="sr-only">打开菜单</span>
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path>
        </svg>
      </button>
    </div>
  </div>
</nav>

<!-- 响应式网格 -->
<div data-responsive="grid" 
     data-cols-xs="1" 
     data-cols-sm="2" 
     data-cols-md="3" 
     data-cols-lg="4"
     class="grid gap-4 p-4">
  <div class="bg-white p-4 rounded shadow">卡片 1</div>
  <div class="bg-white p-4 rounded shadow">卡片 2</div>
  <div class="bg-white p-4 rounded shadow">卡片 3</div>
  <div class="bg-white p-4 rounded shadow">卡片 4</div>
</div>

<!-- 响应式表格 -->
<table data-responsive class="w-full bg-white shadow rounded">
  <thead>
    <tr class="bg-gray-50">
      <th class="px-4 py-3 text-left">姓名</th>
      <th class="px-4 py-3 text-left">邮箱</th>
      <th class="px-4 py-3 text-left">部门</th>
      <th class="px-4 py-3 text-left">操作</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td class="px-4 py-3">张三</td>
      <td class="px-4 py-3">zhang@example.com</td>
      <td class="px-4 py-3">技术部</td>
      <td class="px-4 py-3">
        <button class="text-blue-600 hover:text-blue-800">编辑</button>
      </td>
    </tr>
  </tbody>
</table>
\`\`\`
`;

export default RESPONSIVE_DESIGN_TOOLS; 