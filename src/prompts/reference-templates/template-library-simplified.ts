/**
 * 简化版参考模板库
 * 
 * 基于用户提供的HTML参考文件和截图分析，
 * 包含三种核心布局类型的实用模板配置。
 */

// ================== 简化的数据结构 ==================

export interface SimpleTemplate {
  id: string;
  name: string;
  description: string;
  layoutType: "top-navigation" | "sidebar-main" | "dashboard-grid";
  productType: string;
  industryType: string;
  
  // 设计系统配置
  designSystem: {
    colorPalette: {
      primary: string;
      secondary: string;
      background: string;
      surface: string;
      text: {
        primary: string;
        secondary: string;
        inverse: string;
      };
      accent?: string;
      border: string;
      success?: string;
      warning?: string;
      error?: string;
    };
    typography: {
      fontFamily: {
        primary: string;
        secondary?: string;
        mono?: string;
      };
      scale: {
        h1: string;
        h2: string;
        h3: string;
        body: string;
        small: string;
      };
      weights?: {
        light?: number;
        regular: number;
        medium?: number;
        semibold?: number;
        bold: number;
      };
    };
    spacing: {
      xs: string;
      sm: string;
      md: string;
      lg: string;
      xl: string;
      "2xl": string;
    };
    components?: Record<string, unknown>;
  };
  
  // 布局结构
  layoutStructure: Record<string, unknown>;
  
  // 交互模式
  interactionPatterns?: Record<string, unknown>;
  
  // 元数据
  trustScore: number;
  sourceUrl?: string;
  tags: string[];
}

// ================== 实用模板配置 ==================

export const PRACTICAL_TEMPLATES: SimpleTemplate[] = [
  // === 基于 HTML 文件分析的模板 ===
  {
    id: "neura-ai-landing",
    name: "Neura AI 落地页",
    description: "现代AI产品落地页，基于neura.framer.ai分析",
    layoutType: "top-navigation",
    productType: "saas-tools",
    industryType: "ai-tech",
    designSystem: {
      colorPalette: {
        primary: "#007AFF",
        secondary: "#FF6B6B",
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
          primary: "SF Pro Display, -apple-system, BlinkMacSystemFont, sans-serif"
        },
        scale: {
          h1: "3.5rem",
          h2: "2.5rem",
          h3: "1.75rem",
          body: "1rem",
          small: "0.875rem"
        },
        weights: {
          regular: 400,
          medium: 500,
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
            borderRadius: "12px",
            padding: "12px 24px"
          }
        }
      }
    },
    layoutStructure: {
      header: {
        height: "80px",
        position: "fixed",
        background: "rgba(255, 255, 255, 0.95)",
        backdropFilter: "blur(20px)"
      },
      hero: {
        padding: "120px 0 80px",
        background: "linear-gradient(135deg, #F8F9FA 0%, #E3F2FD 100%)"
      },
      sections: ["features", "testimonials", "pricing", "cta"]
    },
    interactionPatterns: {
      navigation: "smooth-scroll",
      buttons: "scale-on-hover",
      animations: "fade-in-on-scroll"
    },
    trustScore: 9,
    sourceUrl: "https://neura.framer.ai",
    tags: ["ai", "landing-page", "modern", "blue-theme"]
  },

  {
    id: "adaptify-marketing",
    name: "Adaptify 营销站点",
    description: "营销导向的产品展示页面，基于adaptify.framer.website分析",
    layoutType: "top-navigation",
    productType: "saas-tools",
    industryType: "marketing-tech",
    designSystem: {
      colorPalette: {
        primary: "#6366F1",
        secondary: "#EC4899",
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
          primary: "Inter, -apple-system, BlinkMacSystemFont, sans-serif"
        },
        scale: {
          h1: "4rem",
          h2: "3rem",
          h3: "2rem",
          body: "1.125rem",
          small: "1rem"
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
        background: "#FFFFFF"
      },
      hero: {
        padding: "100px 0",
        background: "radial-gradient(ellipse at center, #F3F4F6 0%, #FFFFFF 100%)"
      }
    },
    trustScore: 8,
    sourceUrl: "https://adaptify.framer.website",
    tags: ["marketing", "purple-theme", "gradient"]
  },

  // === 基于截图分析的模板 ===
  {
    id: "analytics-dashboard",
    name: "数据分析仪表盘",
    description: "基于截图分析的现代化数据仪表盘设计",
    layoutType: "dashboard-grid",
    productType: "saas-tools",
    industryType: "analytics",
    designSystem: {
      colorPalette: {
        primary: "#2563EB",
        secondary: "#7C3AED",
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
          }
        }
      }
    },
    layoutStructure: {
      sidebar: {
        width: "256px",
        background: "#FFFFFF"
      },
      main: {
        padding: "24px",
        gridTemplate: "repeat(auto-fit, minmax(320px, 1fr))",
        gap: "24px"
      },
      cards: ["metric", "chart", "table", "activity"]
    },
    trustScore: 9,
    tags: ["dashboard", "analytics", "grid", "cards", "blue-theme"]
  },

  {
    id: "project-management",
    name: "项目管理界面",
    description: "基于截图分析的项目管理工具界面",
    layoutType: "sidebar-main",
    productType: "saas-tools",
    industryType: "productivity",
    designSystem: {
      colorPalette: {
        primary: "#5B21B6",
        secondary: "#3B82F6",
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
      },
      spacing: {
        xs: "0.5rem",
        sm: "1rem",
        md: "1.5rem",
        lg: "2rem",
        xl: "3rem",
        "2xl": "4rem"
      }
    },
    layoutStructure: {
      sidebar: {
        width: "280px",
        background: "#F9FAFB",
        components: ["navigation", "user-profile", "project-switcher"]
      },
      header: {
        height: "64px",
        background: "#FFFFFF",
        components: ["breadcrumb", "search", "actions"]
      },
      main: {
        padding: "24px",
        background: "#FFFFFF"
      }
    },
    trustScore: 8,
    tags: ["project-management", "sidebar", "purple-theme"]
  },

  {
    id: "social-feed",
    name: "社交媒体信息流",
    description: "基于截图分析的社交媒体信息流界面",
    layoutType: "top-navigation",
    productType: "social-media",
    industryType: "social-tech",
    designSystem: {
      colorPalette: {
        primary: "#1DA1F2",
        secondary: "#657786",
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
          padding: "12px 16px"
        },
        button: {
          primary: {
            background: "#1DA1F2",
            text: "#FFFFFF",
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
        background: "#FFFFFF"
      },
      layout: "three-column",
      sidebar: {
        width: "275px",
        components: ["navigation", "trending"]
      },
      main: {
        width: "600px",
        components: ["compose", "feed"]
      },
      rightPanel: {
        width: "350px",
        components: ["search", "trends", "suggestions"]
      }
    },
    interactionPatterns: {
      posts: "infinite-scroll",
      buttons: "subtle-hover",
      navigation: "instant"
    },
    trustScore: 9,
    tags: ["social-media", "feed", "three-column", "blue-theme"]
  },

  {
    id: "ecommerce-grid",
    name: "电商产品网格",
    description: "基于截图分析的电商产品展示网格",
    layoutType: "top-navigation",
    productType: "ecommerce",
    industryType: "retail",
    designSystem: {
      colorPalette: {
        primary: "#FF6B6B",
        secondary: "#4ECDC4",
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
        }
      }
    },
    layoutStructure: {
      header: {
        height: "80px",
        background: "#FFFFFF",
        components: ["logo", "search", "navigation", "cart"]
      },
      layout: "sidebar-main",
      filters: {
        width: "280px",
        background: "#F8F9FA",
        components: ["categories", "price-range", "brand-filter"]
      },
      main: {
        padding: "24px",
        gridTemplate: "repeat(auto-fill, minmax(280px, 1fr))",
        gap: "24px"
      }
    },
    interactionPatterns: {
      cards: "scale-on-hover",
      filters: "instant-filter",
      search: "autocomplete"
    },
    trustScore: 8,
    tags: ["ecommerce", "product-grid", "filters", "coral-theme"]
  }
];

// ================== 工具函数 ==================

export function getTemplatesByLayoutType(layoutType: SimpleTemplate['layoutType']): SimpleTemplate[] {
  return PRACTICAL_TEMPLATES.filter(template => template.layoutType === layoutType);
}

export function getTemplatesByProductType(productType: string): SimpleTemplate[] {
  return PRACTICAL_TEMPLATES.filter(template => template.productType === productType);
}

export function getTemplatesByTags(tags: string[]): SimpleTemplate[] {
  return PRACTICAL_TEMPLATES.filter(template =>
    tags.some(tag => template.tags.includes(tag))
  );
}

export function getHighQualityTemplates(minScore: number = 8): SimpleTemplate[] {
  return PRACTICAL_TEMPLATES.filter(template => template.trustScore >= minScore);
}

export function getTemplateById(id: string): SimpleTemplate | undefined {
  return PRACTICAL_TEMPLATES.find(template => template.id === id);
}

// ================== 模板分析器 ==================

export function analyzeTemplateUsage(): {
  layoutTypes: Record<string, number>;
  productTypes: Record<string, number>;
  averageScore: number;
  totalTemplates: number;
} {
  const layoutTypes: Record<string, number> = {};
  const productTypes: Record<string, number> = {};
  let totalScore = 0;

  PRACTICAL_TEMPLATES.forEach(template => {
    // 统计布局类型
    layoutTypes[template.layoutType] = (layoutTypes[template.layoutType] || 0) + 1;
    
    // 统计产品类型
    productTypes[template.productType] = (productTypes[template.productType] || 0) + 1;
    
    // 累计评分
    totalScore += template.trustScore;
  });

  return {
    layoutTypes,
    productTypes,
    averageScore: totalScore / PRACTICAL_TEMPLATES.length,
    totalTemplates: PRACTICAL_TEMPLATES.length
  };
}

// ================== 导出默认配置 ==================

export default {
  templates: PRACTICAL_TEMPLATES,
  getTemplatesByLayoutType,
  getTemplatesByProductType,
  getTemplatesByTags,
  getHighQualityTemplates,
  getTemplateById,
  analyzeTemplateUsage
}; 