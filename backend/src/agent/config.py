# config.py
"""
LangGraph Agent 配置文件
定义研究代理的核心参数和行为配置
"""

# 研究循环配置
RESEARCH_CONFIG = {
    "max_cycles": 3,           # 最大研究轮次 (当前硬编码为3)
    "min_cycles": 1,           # 最小研究轮次 
    "force_completion": True,  # 是否在达到最大轮次时强制完成
}

# 搜索配置
SEARCH_CONFIG = {
    "queries_per_cycle": 3,         # 每轮生成的查询数量
    "results_per_query": 5,         # 每个查询返回的结果数量
    "results_for_reflection": 7,    # 用于反思分析的结果数量
}

# 测试场景配置
TEST_SCENARIOS_CONFIG = {
    "simple": {
        "max_cycles": 1,      # 简单研究：1轮
        "description": "快速单轮研究，适合基础问题"
    },
    "complex": {
        "max_cycles": 3,      # 复杂研究：3轮
        "description": "深度多轮研究，适合复杂问题"
    },
    "adaptive": {
        "max_cycles": 2,      # 自适应研究：2轮
        "description": "AI自主决定，中等深度"
    }
}

# 决策逻辑配置
DECISION_CONFIG = {
    "enable_ai_decision": True,     # 是否允许AI自主决定继续/完成
    "enable_cycle_limit": True,     # 是否启用轮次限制
    "enable_quality_threshold": False,  # 是否启用质量阈值判断 (未来功能)
}

# API配置
API_CONFIG = {
    "gemini_temperature": 0.0,      # Gemini API温度参数
    "report_temperature": 0.4,      # 报告生成的温度参数
    "request_timeout": 60,          # API请求超时时间
}

# 日志配置
LOGGING_CONFIG = {
    "enable_step_info": True,       # 是否输出详细步骤信息
    "enable_debug_logs": True,      # 是否输出调试日志
    "log_format": "json",           # 日志格式: json, text
}

def get_research_config(scenario_type=None):
    """
    根据测试场景获取研究配置
    
    Args:
        scenario_type: 'simple', 'complex', 'adaptive' 或 None(使用默认)
    
    Returns:
        dict: 合并后的配置
    """
    config = RESEARCH_CONFIG.copy()
    
    if scenario_type and scenario_type in TEST_SCENARIOS_CONFIG:
        scenario_config = TEST_SCENARIOS_CONFIG[scenario_type]
        config.update(scenario_config)
    
    return config

def get_max_cycles(scenario_type=None):
    """获取指定场景的最大轮次"""
    config = get_research_config(scenario_type)
    return config.get("max_cycles", RESEARCH_CONFIG["max_cycles"])

def should_force_completion(cycle_count, scenario_type=None):
    """判断是否应该强制完成研究"""
    max_cycles = get_max_cycles(scenario_type)
    return cycle_count >= max_cycles and RESEARCH_CONFIG["force_completion"] 