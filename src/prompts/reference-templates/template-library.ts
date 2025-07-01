/**
 * 参考模板库 - Reference Template Library
 * 
 * 这个模块负责管理和组织优秀产品界面的参考模板，
 * 为AI生成高质量原型提供"药引子"。
 */

// ================== 核心数据结构 ==================

export interface ProductType {
  id: string;
  name: string;
  description: string;
  keywords: string[];
}

export interface IndustryType {
  id: string;
  name: string;
  description: string;
  characteristics: string[];
}

export interface LayoutAnalysis {
  structure: string;          // 页面整体结构描述
  gridSystem: string;         // 栅格系统说明
  navigationPattern: string;  // 导航模式
  contentOrganization: string; // 内容组织方式
  responsiveStrategy: string; // 响应式策略
}

export interface ComponentSpec {
  name: string;
  type: string;
  description: string;
  useCase: string;
  implementation: string;
}

export interface InteractionPattern {
  name: string;
  trigger: string;
  behavior: string;
  feedback: string;
  bestPractice: string;
}

export interface VisualStyleGuide {
  colorScheme: string;
  typography: string;
  spacing: string;
  iconStyle: string;
  brandingApproach: string;
}

export interface BusinessLogicPattern {
  scenario: string;
  implementation: string;
  dataFlow: string;
  userJourney: string;
  keyFeatures: string[];
}

export interface ReferenceTemplate {
  id: string;
  name: string;
  category: ProductType;
  industry: IndustryType;
  description: string;
  
  // 分析内容
  layoutStructure: LayoutAnalysis;
  componentLibrary: ComponentSpec[];
  interactionPatterns: InteractionPattern[];
  visualStyle: VisualStyleGuide;
  businessLogic: BusinessLogicPattern[];
  
  // 元数据
  qualityScore: number;       // 质量评分 (1-100)
  tags: string[];            // 标签
  referenceUrl?: string;     // 参考链接
  screenshotPath?: string;   // 截图路径
  analysisDate: string;      // 分析日期
  lastUpdated: string;       // 最后更新
}

// ================== 产品类型定义 ==================

export const PRODUCT_TYPES: ProductType[] = [
  {
    id: 'saas-tools',
    name: 'SaaS工具',
    description: '企业级软件即服务产品',
    keywords: ['仪表盘', '数据管理', '用户权限', '协作', '分析']
  },
  {
    id: 'social-media',
    name: '社交媒体',
    description: '用户互动和内容分享平台',
    keywords: ['信息流', '用户档案', '消息', '关注', '内容发布']
  },
  {
    id: 'ecommerce',
    name: '电商平台',
    description: '在线商品交易平台',
    keywords: ['商品展示', '购物车', '订单管理', '支付', '用户评价']
  },
  {
    id: 'content-platform',
    name: '内容平台',
    description: '内容创作和消费平台',
    keywords: ['内容管理', '编辑器', '发布', '订阅', '推荐']
  },
  {
    id: 'productivity-tools',
    name: '效率工具',
    description: '提升工作效率的工具产品',
    keywords: ['任务管理', '日程安排', '文档协作', '项目跟踪']
  }
];

export const INDUSTRY_TYPES: IndustryType[] = [
  {
    id: 'fintech',
    name: '金融科技',
    description: '金融服务和支付解决方案',
    characteristics: ['安全性', '合规性', '数据可视化', '实时处理']
  },
  {
    id: 'edtech',
    name: '教育科技',
    description: '在线教育和学习平台',
    characteristics: ['学习路径', '进度跟踪', '互动性', '个性化']
  },
  {
    id: 'healthcare',
    name: '医疗健康',
    description: '数字化医疗和健康管理',
    characteristics: ['隐私保护', '数据准确性', '用户引导', '专业性']
  },
  {
    id: 'creator-economy',
    name: '创作者经济',
    description: '内容创作者的商业化平台',
    characteristics: ['创作工具', '变现机制', '粉丝管理', '数据分析']
  }
];

// ================== 参考模板库 ==================

export const REFERENCE_TEMPLATES: ReferenceTemplate[] = [
  // === 顶部导航布局模板 ===
  {
    id: "neura-ai-landing",
    name: "Neura AI Landing Page",
    description: "现代AI产品落地页，简洁的顶部导航设计",
    layoutType: "top-navigation",
    productType: "saas-tools",
    industryType: "ai-tech",
    designSystem: {
      // 基于neura.framer.ai的分析
      colorPalette: {
        primary: "#007AFF", // 蓝色主色调
        secondary: "#FF6B6B", // 红色辅助色
        background: "#FFFFFF",
        surface: "#F8F9FA",
        text: {
          primary: "#1C1C1E",
          secondary: "#8E8E93",
          inverse: "#FFFFFF"
        },
        accent: "#34C759",
        border: "#E5E5E7"
      },
      typography: {
        fontFamily: {
          primary: "SF Pro Display, -apple-system, BlinkMacSystemFont, sans-serif",
          secondary: "SF Pro Text, -apple-system, BlinkMacSystemFont, sans-serif"
        },
        scale: {
          h1: "3.5rem", // 56px
          h2: "2.5rem", // 40px
          h3: "1.75rem", // 28px
          body: "1rem", // 16px
          small: "0.875rem" // 14px
        },
        weights: {
          light: 300,
          regular: 400,
          medium: 500,
          semibold: 600,
          bold: 700
        }
      },
      spacing: {
        xs: "0.5rem",
        sm: "1rem", 
        md: "1.5rem",
        lg: "2rem",
        xl: "3rem",
        "2xl": "4rem"
      },
      components: {
        button: {
          primary: {
            background: "#007AFF",
            text: "#FFFFFF",
            border: "none",
            borderRadius: "12px",
            padding: "12px 24px"
          },
          secondary: {
            background: "transparent",
            text: "#007AFF", 
            border: "1px solid #007AFF",
            borderRadius: "12px",
            padding: "12px 24px"
          }
        },
        card: {
          background: "#FFFFFF",
          border: "1px solid #E5E5E7",
          borderRadius: "16px",
          shadow: "0 4px 16px rgba(0, 0, 0, 0.1)",
          padding: "24px"
        }
      }
    },
    layoutStructure: {
      header: {
        height: "80px",
        position: "fixed",
        background: "rgba(255, 255, 255, 0.95)",
        backdropFilter: "blur(20px)",
        components: ["logo", "navigation", "cta-button"]
      },
      hero: {
        padding: "120px 0 80px",
        background: "linear-gradient(135deg, #F8F9FA 0%, #E3F2FD 100%)",
        components: ["headline", "subtitle", "cta-buttons", "hero-image"]
      },
      sections: [
        { type: "features", layout: "three-column-grid" },
        { type: "testimonials", layout: "carousel" },
        { type: "pricing", layout: "three-tier" },
        { type: "cta", layout: "centered" }
      ],
      footer: {
        background: "#1C1C1E",
        color: "#FFFFFF",
        components: ["links", "social", "copyright"]
      }
    },
    interactionPatterns: {
      navigation: "smooth-scroll",
      buttons: "scale-on-hover",
      cards: "lift-on-hover",
      animations: "fade-in-on-scroll"
    },
    trustScore: 9,
    codeSnippetCount: 0,
    sourceUrl: "https://neura.framer.ai",
    tags: ["ai", "landing-page", "modern", "blue-theme", "top-nav"]
  },

  {
    id: "adaptify-marketing",
    name: "Adaptify Marketing Site", 
    description: "营销导向的产品展示页面，突出产品价值主张",
    layoutType: "top-navigation",
    productType: "saas-tools",
    industryType: "marketing-tech",
    designSystem: {
      // 基于adaptify.framer.website的分析
      colorPalette: {
        primary: "#6366F1", // 紫色主色调
        secondary: "#EC4899", // 粉色辅助色
        background: "#FFFFFF",
        surface: "#F9FAFB",
        text: {
          primary: "#111827",
          secondary: "#6B7280",
          inverse: "#FFFFFF"
        },
        accent: "#10B981",
        border: "#E5E7EB"
      },
      typography: {
        fontFamily: {
          primary: "Inter, -apple-system, BlinkMacSystemFont, sans-serif",
          secondary: "Inter, -apple-system, BlinkMacSystemFont, sans-serif"
        },
        scale: {
          h1: "4rem", // 64px
          h2: "3rem", // 48px  
          h3: "2rem", // 32px
          body: "1.125rem", // 18px
          small: "1rem" // 16px
        }
      },
      spacing: {
        xs: "0.5rem",
        sm: "1rem",
        md: "1.5rem", 
        lg: "2.5rem",
        xl: "4rem",
        "2xl": "6rem"
      }
    },
    layoutStructure: {
      header: {
        height: "72px",
        position: "sticky",
        background: "#FFFFFF",
        shadow: "0 1px 3px rgba(0, 0, 0, 0.1)"
      },
      hero: {
        padding: "100px 0",
        background: "radial-gradient(ellipse at center, #F3F4F6 0%, #FFFFFF 100%)"
      }
    },
    trustScore: 8,
    codeSnippetCount: 0,
    sourceUrl: "https://adaptify.framer.website",
    tags: ["marketing", "purple-theme", "gradient", "modern"]
  },

  // === 仪表盘 + 卡片网格布局模板 ===
  {
    id: "dashboard-analytics",
    name: "Analytics Dashboard",
    description: "基于截图分析的数据分析仪表盘设计",
    layoutType: "dashboard-grid",
    productType: "saas-tools", 
    industryType: "analytics",
    designSystem: {
      // 基于您提供的仪表盘截图分析
      colorPalette: {
        primary: "#2563EB", // 蓝色主色调
        secondary: "#7C3AED", // 紫色辅助色
        background: "#F8FAFC",
        surface: "#FFFFFF",
        text: {
          primary: "#1E293B",
          secondary: "#64748B", 
          inverse: "#FFFFFF"
        },
        success: "#10B981",
        warning: "#F59E0B",
        error: "#EF4444",
        border: "#E2E8F0"
      },
      typography: {
        fontFamily: {
          primary: "system-ui, -apple-system, sans-serif",
          mono: "ui-monospace, Menlo, Monaco, monospace"
        },
        scale: {
          h1: "2rem",
          h2: "1.5rem",
          h3: "1.25rem", 
          body: "0.875rem",
          small: "0.75rem"
        }
      },
      components: {
        card: {
          background: "#FFFFFF",
          border: "1px solid #E2E8F0",
          borderRadius: "8px",
          shadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
          padding: "20px"
        },
        metric: {
          value: {
            fontSize: "2rem",
            fontWeight: "700",
            color: "#1E293B"
          },
          label: {
            fontSize: "0.875rem", 
            color: "#64748B"
          },
          change: {
            positive: "#10B981",
            negative: "#EF4444"
          }
        }
      }
    },
    layoutStructure: {
      sidebar: {
        width: "256px",
        background: "#FFFFFF",
        border: "1px solid #E2E8F0"
      },
      main: {
        padding: "24px",
        gridTemplate: "repeat(auto-fit, minmax(320px, 1fr))",
        gap: "24px"
      },
      cards: [
        { type: "metric", size: "small" },
        { type: "chart", size: "large" },
        { type: "table", size: "medium" },
        { type: "activity", size: "medium" }
      ]
    },
    trustScore: 9,
    codeSnippetCount: 0,
    tags: ["dashboard", "analytics", "grid", "cards", "metrics"]
  },

  // === 左侧导航 + 主内容布局模板 ===
  {
    id: "project-management",
    name: "Project Management Interface",
    description: "基于截图的项目管理工具界面设计",
    layoutType: "sidebar-main",
    productType: "saas-tools",
    industryType: "productivity",
    designSystem: {
      // 基于您提供的项目管理界面截图分析
      colorPalette: {
        primary: "#5B21B6", // 深紫色
        secondary: "#3B82F6", // 蓝色
        background: "#FAFAFA",
        surface: "#FFFFFF", 
        text: {
          primary: "#1F2937",
          secondary: "#6B7280",
          inverse: "#FFFFFF"
        },
        accent: "#8B5CF6",
        border: "#E5E7EB"
      },
      typography: {
        fontFamily: {
          primary: "-apple-system, BlinkMacSystemFont, Segoe UI, sans-serif"
        },
        scale: {
          h1: "1.875rem",
          h2: "1.5rem", 
          h3: "1.25rem",
          body: "0.875rem",
          small: "0.75rem"
        }
      }
    },
    layoutStructure: {
      sidebar: {
        width: "280px",
        background: "#F9FAFB",
        border: "1px solid #E5E7EB",
        components: ["navigation", "user-profile", "project-switcher"]
      },
      header: {
        height: "64px",
        background: "#FFFFFF",
        border: "1px solid #E5E7EB",
        components: ["breadcrumb", "search", "actions"]
      },
      main: {
        padding: "24px",
        background: "#FFFFFF"
      }
    },
    trustScore: 8,
    codeSnippetCount: 0,
    tags: ["project-management", "sidebar", "purple-theme", "productivity"]
  },

  // === 基于用户截图分析的新模板 ===
  {
    id: "social-feed-interface",
    name: "Social Media Feed Interface",
    description: "基于截图分析的社交媒体信息流界面",
    layoutType: "top-navigation",
    productType: "social-media",
    industryType: "social-tech",
    designSystem: {
      colorPalette: {
        primary: "#1DA1F2", // Twitter蓝
        secondary: "#657786", // 灰蓝色
        background: "#FFFFFF",
        surface: "#F7F9FA",
        text: {
          primary: "#14171A",
          secondary: "#657786",
          inverse: "#FFFFFF"
        },
        accent: "#E1E8ED",
        border: "#E1E8ED"
      },
      typography: {
        fontFamily: {
          primary: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
        },
        scale: {
          h1: "1.5rem",
          h2: "1.25rem",
          h3: "1rem",
          body: "0.9375rem",
          small: "0.8125rem"
        }
      },
      spacing: {
        xs: "0.25rem",
        sm: "0.5rem",
        md: "1rem",
        lg: "1.5rem",
        xl: "2rem",
        "2xl": "3rem"
      },
      components: {
        post: {
          background: "#FFFFFF",
          border: "1px solid #E1E8ED",
          borderRadius: "0px",
          padding: "12px 16px"
        },
        button: {
          primary: {
            background: "#1DA1F2",
            text: "#FFFFFF",
            borderRadius: "9999px",
            padding: "8px 16px"
          },
          secondary: {
            background: "transparent",
            text: "#1DA1F2",
            border: "1px solid #1DA1F2",
            borderRadius: "9999px",
            padding: "8px 16px"
          }
        }
      }
    },
    layoutStructure: {
      header: {
        height: "56px",
        position: "sticky",
        background: "#FFFFFF",
        border: "1px solid #E1E8ED",
        components: ["logo", "search", "navigation", "profile"]
      },
      sidebar: {
        width: "275px",
        background: "#FFFFFF",
        components: ["navigation", "trending", "suggestions"]
      },
      main: {
        minWidth: "600px",
        maxWidth: "600px",
        border: "1px solid #E1E8ED"
      },
      rightPanel: {
        width: "350px",
        components: ["search", "trends", "suggestions"]
      }
    },
    interactionPatterns: {
      navigation: "instant",
      posts: "infinite-scroll",
      buttons: "subtle-hover",
      animations: "minimal"
    },
    trustScore: 9,
    codeSnippetCount: 0,
    tags: ["social-media", "feed", "twitter-like", "three-column", "blue-theme"]
  },

  {
    id: "ecommerce-product-grid",
    name: "E-commerce Product Grid",
    description: "基于截图分析的电商产品网格布局",
    layoutType: "top-navigation",
    productType: "ecommerce",
    industryType: "retail",
    designSystem: {
      colorPalette: {
        primary: "#FF6B6B", // 珊瑚红
        secondary: "#4ECDC4", // 青绿色
        background: "#FFFFFF",
        surface: "#F8F9FA",
        text: {
          primary: "#2C3E50",
          secondary: "#7F8C8D",
          inverse: "#FFFFFF"
        },
        accent: "#F39C12",
        border: "#E9ECEF"
      },
      typography: {
        fontFamily: {
          primary: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif"
        },
        scale: {
          h1: "2.5rem",
          h2: "2rem",
          h3: "1.5rem",
          body: "1rem",
          small: "0.875rem"
        }
      },
      spacing: {
        xs: "0.5rem",
        sm: "1rem",
        md: "1.5rem",
        lg: "2rem",
        xl: "3rem",
        "2xl": "4rem"
      },
      components: {
        productCard: {
          background: "#FFFFFF",
          border: "1px solid #E9ECEF",
          borderRadius: "8px",
          shadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
          padding: "16px"
        },
        button: {
          primary: {
            background: "#FF6B6B",
            text: "#FFFFFF",
            borderRadius: "6px",
            padding: "12px 24px"
          },
          addToCart: {
            background: "#4ECDC4",
            text: "#FFFFFF",
            borderRadius: "6px",
            padding: "10px 20px"
          }
        }
      }
    },
    layoutStructure: {
      header: {
        height: "80px",
        background: "#FFFFFF",
        shadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
        components: ["logo", "search", "navigation", "cart", "account"]
      },
      filters: {
        width: "280px",
        background: "#F8F9FA",
        components: ["categories", "price-range", "brand-filter", "rating"]
      },
      main: {
        padding: "24px",
        gridTemplate: "repeat(auto-fill, minmax(280px, 1fr))",
        gap: "24px"
      },
      pagination: {
        position: "bottom",
        alignment: "center"
      }
    },
    interactionPatterns: {
      navigation: "smooth-scroll",
      cards: "scale-on-hover",
      filters: "instant-filter",
      search: "autocomplete"
    },
    trustScore: 8,
    codeSnippetCount: 0,
    tags: ["ecommerce", "product-grid", "filters", "coral-theme", "shopping"]
  },

  {
    id: "finance-dashboard",
    name: "Financial Analytics Dashboard",
    description: "基于截图分析的金融数据仪表盘",
    layoutType: "dashboard-grid",
    productType: "saas-tools",
    industryType: "fintech",
    designSystem: {
      colorPalette: {
        primary: "#1B365D", // 深蓝色
        secondary: "#2E8B57", // 海绿色
        background: "#F6F8FA",
        surface: "#FFFFFF",
        text: {
          primary: "#1B365D",
          secondary: "#6B7280",
          inverse: "#FFFFFF"
        },
        success: "#22C55E",
        warning: "#F59E0B",
        error: "#EF4444",
        border: "#E5E7EB"
      },
      typography: {
        fontFamily: {
          primary: "system-ui, -apple-system, sans-serif",
          mono: "'Roboto Mono', 'Fira Code', monospace"
        },
        scale: {
          h1: "2rem",
          h2: "1.5rem",
          h3: "1.25rem",
          body: "0.875rem",
          small: "0.75rem"
        },
        weights: {
          regular: 400,
          medium: 500,
          semibold: 600,
          bold: 700
        }
      },
      spacing: {
        xs: "0.5rem",
        sm: "1rem",
        md: "1.5rem",
        lg: "2rem",
        xl: "2.5rem",
        "2xl": "3rem"
      },
      components: {
        card: {
          background: "#FFFFFF",
          border: "1px solid #E5E7EB",
          borderRadius: "12px",
          shadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
          padding: "24px"
        },
        metric: {
          value: {
            fontSize: "2.5rem",
            fontWeight: "700",
            color: "#1B365D"
          },
          label: {
            fontSize: "0.875rem",
            color: "#6B7280",
            fontWeight: "500"
          },
          change: {
            positive: "#22C55E",
            negative: "#EF4444",
            neutral: "#6B7280"
          }
        },
        chart: {
          colors: ["#1B365D", "#2E8B57", "#F59E0B", "#EF4444", "#8B5CF6"],
          background: "#FFFFFF",
          grid: "#F3F4F6"
        }
      }
    },
    layoutStructure: {
      header: {
        height: "72px",
        background: "#FFFFFF",
        border: "1px solid #E5E7EB",
        components: ["logo", "navigation", "search", "notifications", "profile"]
      },
      sidebar: {
        width: "280px",
        background: "#FFFFFF",
        border: "1px solid #E5E7EB",
        components: ["navigation", "account-summary", "quick-actions"]
      },
      main: {
        padding: "24px",
        gridTemplate: "repeat(auto-fit, minmax(400px, 1fr))",
        gap: "24px"
      },
      widgets: [
        { type: "balance-overview", size: "large", span: "2" },
        { type: "expense-chart", size: "medium" },
        { type: "income-chart", size: "medium" },
        { type: "recent-transactions", size: "large", span: "2" },
        { type: "budget-progress", size: "small" },
        { type: "investment-summary", size: "small" },
        { type: "alerts", size: "medium" }
      ]
    },
    interactionPatterns: {
      navigation: "instant",
      charts: "interactive-hover",
      cards: "subtle-lift",
      filters: "real-time-update",
      animations: "smooth-transitions"
    },
    trustScore: 9,
    codeSnippetCount: 0,
    tags: ["finance", "dashboard", "analytics", "charts", "professional", "dark-blue"]
  }
];

// ================== 模板管理功能 ==================

export class TemplateLibrary {
  private templates: ReferenceTemplate[] = [...REFERENCE_TEMPLATES];

  /**
   * 添加新的参考模板
   */
  addTemplate(template: ReferenceTemplate): void {
    this.templates.push(template);
  }

  /**
   * 根据产品类型获取模板
   */
  getTemplatesByProductType(productTypeId: string): ReferenceTemplate[] {
    return this.templates.filter(template => 
      template.category.id === productTypeId
    );
  }

  /**
   * 根据行业类型获取模板
   */
  getTemplatesByIndustry(industryId: string): ReferenceTemplate[] {
    return this.templates.filter(template => 
      template.industry.id === industryId
    );
  }

  /**
   * 根据标签搜索模板
   */
  searchTemplatesByTags(tags: string[]): ReferenceTemplate[] {
    return this.templates.filter(template =>
      tags.some(tag => template.tags.includes(tag))
    );
  }

  /**
   * 获取质量最高的模板
   */
  getTopQualityTemplates(limit: number = 5): ReferenceTemplate[] {
    return this.templates
      .sort((a, b) => b.qualityScore - a.qualityScore)
      .slice(0, limit);
  }

  /**
   * 根据关键词匹配模板
   */
  searchTemplatesByKeywords(keywords: string[]): ReferenceTemplate[] {
    return this.templates.filter(template => {
      const templateKeywords = [
        ...template.category.keywords,
        ...template.tags,
        template.name.toLowerCase(),
        template.description.toLowerCase()
      ];
      
      return keywords.some(keyword => 
        templateKeywords.some(tk => 
          tk.toLowerCase().includes(keyword.toLowerCase())
        )
      );
    });
  }

  /**
   * 获取所有模板
   */
  getAllTemplates(): ReferenceTemplate[] {
    return [...this.templates];
  }
}

// ================== 导出实例 ==================

export const templateLibrary = new TemplateLibrary();

// ================== 模板构建辅助函数 ==================

/**
 * 创建新的参考模板
 */
export function createReferenceTemplate(
  basicInfo: Pick<ReferenceTemplate, 'name' | 'description' | 'category' | 'industry'>,
  analysis: {
    layout: LayoutAnalysis;
    components: ComponentSpec[];
    interactions: InteractionPattern[];
    visual: VisualStyleGuide;
    business: BusinessLogicPattern[];
  },
  metadata: {
    qualityScore: number;
    tags: string[];
    referenceUrl?: string;
    screenshotPath?: string;
  }
): ReferenceTemplate {
  const now = new Date().toISOString();
  
  return {
    id: `template_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    ...basicInfo,
    layoutStructure: analysis.layout,
    componentLibrary: analysis.components,
    interactionPatterns: analysis.interactions,
    visualStyle: analysis.visual,
    businessLogic: analysis.business,
    qualityScore: metadata.qualityScore,
    tags: metadata.tags,
    referenceUrl: metadata.referenceUrl,
    screenshotPath: metadata.screenshotPath,
    analysisDate: now,
    lastUpdated: now
  };
}

/**
 * 验证模板数据完整性
 */
export function validateTemplate(template: Partial<ReferenceTemplate>): string[] {
  const errors: string[] = [];
  
  if (!template.name) errors.push('模板名称不能为空');
  if (!template.description) errors.push('模板描述不能为空');
  if (!template.category) errors.push('产品类型不能为空');
  if (!template.industry) errors.push('行业类型不能为空');
  if (!template.qualityScore || template.qualityScore < 1 || template.qualityScore > 100) {
    errors.push('质量评分必须在1-100之间');
  }
  
  return errors;
}

/**
 * 模板质量评估
 */
export function assessTemplateQuality(template: ReferenceTemplate): {
  score: number;
  strengths: string[];
  improvements: string[];
} {
  const strengths: string[] = [];
  const improvements: string[] = [];
  let score = 0;

  // 内容完整性检查 (40分)
  if (template.componentLibrary.length >= 5) {
    score += 10;
    strengths.push('组件库丰富');
  } else {
    improvements.push('需要更多组件分析');
  }

  if (template.interactionPatterns.length >= 3) {
    score += 10;
    strengths.push('交互模式完整');
  } else {
    improvements.push('需要更多交互模式分析');
  }

  if (template.businessLogic.length >= 2) {
    score += 10;
    strengths.push('业务逻辑清晰');
  } else {
    improvements.push('需要更详细的业务逻辑分析');
  }

  if (template.layoutStructure.responsiveStrategy) {
    score += 10;
    strengths.push('响应式设计考虑周全');
  } else {
    improvements.push('需要补充响应式设计策略');
  }

  // 描述质量检查 (30分)
  if (template.description.length > 100) {
    score += 15;
    strengths.push('描述详细充实');
  } else {
    improvements.push('需要更详细的产品描述');
  }

  if (template.tags.length >= 5) {
    score += 15;
    strengths.push('标签丰富，便于搜索');
  } else {
    improvements.push('需要更多标签以便分类');
  }

  // 实用性检查 (30分)
  if (template.referenceUrl) {
    score += 15;
    strengths.push('提供了参考链接');
  } else {
    improvements.push('建议提供参考链接');
  }

  if (template.screenshotPath) {
    score += 15;
    strengths.push('包含截图参考');
  } else {
    improvements.push('建议添加界面截图');
  }

  return { score, strengths, improvements };
}

// 更新模板匹配器以支持新的模板
export function getTemplatesByLayoutType(layoutType: LayoutType): ReferenceTemplate[] {
  return REFERENCE_TEMPLATES.filter(template => template.layoutType === layoutType);
}

export function getTemplatesByProductType(productType: ProductType): ReferenceTemplate[] {
  return REFERENCE_TEMPLATES.filter(template => template.productType === productType);
}

export function getTemplatesByIndustry(industryType: IndustryType): ReferenceTemplate[] {
  return REFERENCE_TEMPLATES.filter(template => template.industryType === industryType);
}

// 获取高质量模板（信任度 >= 8）
export function getHighQualityTemplates(): ReferenceTemplate[] {
  return REFERENCE_TEMPLATES.filter(template => template.trustScore >= 8);
} 