// PrimeVue Tree 主题配置

export interface TreeTheme {
  name: string
  variables: Record<string, string>
}

// 默认主题 (Lara Light)
export const laraLightTheme: TreeTheme = {
  name: 'lara-light',
  variables: {
    // 基础颜色
    '--p-tree-background': '#ffffff',
    '--p-tree-text-color': '#495057',
    '--p-tree-border-color': '#dee2e6',
    '--p-tree-secondary-text-color': '#6c757d',
    
    // 交互状态
    '--p-tree-hover-background': '#f8f9fa',
    '--p-tree-active-background': '#e9ecef',
    
    // 选中状态
    '--p-tree-selected-background': '#e3f2fd',
    '--p-tree-selected-border': '#1976d2',
    '--p-tree-selected-text-color': '#1976d2',
    
    // 焦点状态
    '--p-tree-focus-outline': '#1976d2',
    '--p-tree-focus-outline-width': '2px',
    '--p-tree-focus-ring': '0 0 0 0.2rem rgba(25, 118, 210, 0.2)',
    
    // 拖拽指示器
    '--p-tree-drop-line-color': '#1976d2',
    '--p-tree-drop-line-width': '3px',
    '--p-tree-drop-inside-background': 'rgba(25, 118, 210, 0.1)',
    '--p-tree-drop-inside-border': '#1976d2',
    
    // 跨树拖拽
    '--p-tree-cross-drop-line-color': '#2e7d32',
    '--p-tree-cross-drop-inside-background': 'rgba(46, 125, 50, 0.1)',
    '--p-tree-cross-drop-inside-border': '#2e7d32',
    
    // 过滤器
    '--p-tree-filter-background': '#f8f9fa',
    '--p-tree-filter-input-background': '#ffffff',
    '--p-tree-filter-input-border': '#dee2e6',
    '--p-tree-filter-input-focus-border': '#1976d2',
    '--p-tree-filter-icon-color': '#6c757d',
    
    // 加载和空状态
    '--p-tree-loading-text-color': '#6c757d',
    '--p-tree-empty-text-color': '#6c757d',
    
    // 复选框
    '--p-tree-checkbox-border': '#ced4da',
    '--p-tree-checkbox-background': '#ffffff',
    '--p-tree-checkbox-checked-background': '#1976d2',
    '--p-tree-checkbox-checked-border': '#1976d2',
    '--p-tree-checkbox-checked-color': '#ffffff',
    '--p-tree-checkbox-indeterminate-background': '#e3f2fd',
    '--p-tree-checkbox-indeterminate-border': '#1976d2',
    '--p-tree-checkbox-indeterminate-color': '#1976d2',
    
    // 切换器
    '--p-tree-toggler-color': '#6c757d',
    '--p-tree-toggler-hover-color': '#1976d2',
    
    // 动画
    '--p-tree-transition': 'background-color 0.15s ease, border-color 0.15s ease, color 0.15s ease',
    
    // 间距和尺寸
    '--p-tree-node-indent': '20px',
    '--p-tree-node-padding': '0.5rem',
    '--p-tree-node-height': '2rem',
    '--p-tree-node-border-radius': '0.25rem',
    '--p-tree-toggler-size': '1rem',
    '--p-tree-icon-size': '1rem',
    '--p-tree-checkbox-size': '1rem',
  }
}

// 深色主题 (Lara Dark)
export const laraDarkTheme: TreeTheme = {
  name: 'lara-dark',
  variables: {
    // 基础颜色
    '--p-tree-background': '#1e1e1e',
    '--p-tree-text-color': '#e0e0e0',
    '--p-tree-border-color': '#404040',
    '--p-tree-secondary-text-color': '#a0a0a0',
    
    // 交互状态
    '--p-tree-hover-background': '#2a2a2a',
    '--p-tree-active-background': '#333333',
    
    // 选中状态
    '--p-tree-selected-background': '#1a365d',
    '--p-tree-selected-border': '#90cdf4',
    '--p-tree-selected-text-color': '#90cdf4',
    
    // 焦点状态
    '--p-tree-focus-outline': '#90cdf4',
    '--p-tree-focus-outline-width': '2px',
    '--p-tree-focus-ring': '0 0 0 0.2rem rgba(144, 205, 244, 0.2)',
    
    // 拖拽指示器
    '--p-tree-drop-line-color': '#90cdf4',
    '--p-tree-drop-line-width': '3px',
    '--p-tree-drop-inside-background': 'rgba(144, 205, 244, 0.1)',
    '--p-tree-drop-inside-border': '#90cdf4',
    
    // 跨树拖拽
    '--p-tree-cross-drop-line-color': '#68d391',
    '--p-tree-cross-drop-inside-background': 'rgba(104, 211, 145, 0.1)',
    '--p-tree-cross-drop-inside-border': '#68d391',
    
    // 过滤器
    '--p-tree-filter-background': '#2a2a2a',
    '--p-tree-filter-input-background': '#2a2a2a',
    '--p-tree-filter-input-border': '#404040',
    '--p-tree-filter-input-focus-border': '#90cdf4',
    '--p-tree-filter-icon-color': '#a0a0a0',
    
    // 加载和空状态
    '--p-tree-loading-text-color': '#a0a0a0',
    '--p-tree-empty-text-color': '#a0a0a0',
    
    // 复选框
    '--p-tree-checkbox-border': '#404040',
    '--p-tree-checkbox-background': '#2a2a2a',
    '--p-tree-checkbox-checked-background': '#90cdf4',
    '--p-tree-checkbox-checked-border': '#90cdf4',
    '--p-tree-checkbox-checked-color': '#1e1e1e',
    '--p-tree-checkbox-indeterminate-background': '#1a365d',
    '--p-tree-checkbox-indeterminate-border': '#90cdf4',
    '--p-tree-checkbox-indeterminate-color': '#90cdf4',
    
    // 切换器
    '--p-tree-toggler-color': '#a0a0a0',
    '--p-tree-toggler-hover-color': '#90cdf4',
    
    // 动画
    '--p-tree-transition': 'background-color 0.15s ease, border-color 0.15s ease, color 0.15s ease',
    
    // 间距和尺寸
    '--p-tree-node-indent': '20px',
    '--p-tree-node-padding': '0.5rem',
    '--p-tree-node-height': '2rem',
    '--p-tree-node-border-radius': '0.25rem',
    '--p-tree-toggler-size': '1rem',
    '--p-tree-icon-size': '1rem',
    '--p-tree-checkbox-size': '1rem',
  }
}

// Bootstrap 主题
export const bootstrapTheme: TreeTheme = {
  name: 'bootstrap',
  variables: {
    // 基础颜色
    '--p-tree-background': '#ffffff',
    '--p-tree-text-color': '#212529',
    '--p-tree-border-color': '#dee2e6',
    '--p-tree-secondary-text-color': '#6c757d',
    
    // 交互状态
    '--p-tree-hover-background': '#f8f9fa',
    '--p-tree-active-background': '#e9ecef',
    
    // 选中状态
    '--p-tree-selected-background': '#e7f3ff',
    '--p-tree-selected-border': '#0d6efd',
    '--p-tree-selected-text-color': '#0d6efd',
    
    // 焦点状态
    '--p-tree-focus-outline': '#0d6efd',
    '--p-tree-focus-outline-width': '2px',
    '--p-tree-focus-ring': '0 0 0 0.25rem rgba(13, 110, 253, 0.25)',
    
    // 拖拽指示器
    '--p-tree-drop-line-color': '#0d6efd',
    '--p-tree-drop-line-width': '3px',
    '--p-tree-drop-inside-background': 'rgba(13, 110, 253, 0.1)',
    '--p-tree-drop-inside-border': '#0d6efd',
    
    // 跨树拖拽
    '--p-tree-cross-drop-line-color': '#198754',
    '--p-tree-cross-drop-inside-background': 'rgba(25, 135, 84, 0.1)',
    '--p-tree-cross-drop-inside-border': '#198754',
    
    // 过滤器
    '--p-tree-filter-background': '#f8f9fa',
    '--p-tree-filter-input-background': '#ffffff',
    '--p-tree-filter-input-border': '#dee2e6',
    '--p-tree-filter-input-focus-border': '#0d6efd',
    '--p-tree-filter-icon-color': '#6c757d',
    
    // 加载和空状态
    '--p-tree-loading-text-color': '#6c757d',
    '--p-tree-empty-text-color': '#6c757d',
    
    // 复选框
    '--p-tree-checkbox-border': '#dee2e6',
    '--p-tree-checkbox-background': '#ffffff',
    '--p-tree-checkbox-checked-background': '#0d6efd',
    '--p-tree-checkbox-checked-border': '#0d6efd',
    '--p-tree-checkbox-checked-color': '#ffffff',
    '--p-tree-checkbox-indeterminate-background': '#e7f3ff',
    '--p-tree-checkbox-indeterminate-border': '#0d6efd',
    '--p-tree-checkbox-indeterminate-color': '#0d6efd',
    
    // 切换器
    '--p-tree-toggler-color': '#6c757d',
    '--p-tree-toggler-hover-color': '#0d6efd',
    
    // 动画
    '--p-tree-transition': 'background-color 0.15s ease, border-color 0.15s ease, color 0.15s ease',
    
    // 间距和尺寸
    '--p-tree-node-indent': '20px',
    '--p-tree-node-padding': '0.5rem',
    '--p-tree-node-height': '2rem',
    '--p-tree-node-border-radius': '0.25rem',
    '--p-tree-toggler-size': '1rem',
    '--p-tree-icon-size': '1rem',
    '--p-tree-checkbox-size': '1rem',
  }
}

// Material Design 主题
export const materialTheme: TreeTheme = {
  name: 'material',
  variables: {
    // 基础颜色
    '--p-tree-background': '#ffffff',
    '--p-tree-text-color': '#212121',
    '--p-tree-border-color': '#e0e0e0',
    '--p-tree-secondary-text-color': '#757575',
    
    // 交互状态
    '--p-tree-hover-background': '#f5f5f5',
    '--p-tree-active-background': '#eeeeee',
    
    // 选中状态
    '--p-tree-selected-background': '#e8f5e8',
    '--p-tree-selected-border': '#2e7d32',
    '--p-tree-selected-text-color': '#2e7d32',
    
    // 焦点状态
    '--p-tree-focus-outline': '#2e7d32',
    '--p-tree-focus-outline-width': '2px',
    '--p-tree-focus-ring': '0 0 0 2px rgba(46, 125, 50, 0.2)',
    
    // 拖拽指示器
    '--p-tree-drop-line-color': '#2e7d32',
    '--p-tree-drop-line-width': '3px',
    '--p-tree-drop-inside-background': 'rgba(46, 125, 50, 0.1)',
    '--p-tree-drop-inside-border': '#2e7d32',
    
    // 跨树拖拽
    '--p-tree-cross-drop-line-color': '#1976d2',
    '--p-tree-cross-drop-inside-background': 'rgba(25, 118, 210, 0.1)',
    '--p-tree-cross-drop-inside-border': '#1976d2',
    
    // 过滤器
    '--p-tree-filter-background': '#f5f5f5',
    '--p-tree-filter-input-background': '#ffffff',
    '--p-tree-filter-input-border': '#e0e0e0',
    '--p-tree-filter-input-focus-border': '#2e7d32',
    '--p-tree-filter-icon-color': '#757575',
    
    // 加载和空状态
    '--p-tree-loading-text-color': '#757575',
    '--p-tree-empty-text-color': '#757575',
    
    // 复选框
    '--p-tree-checkbox-border': '#e0e0e0',
    '--p-tree-checkbox-background': '#ffffff',
    '--p-tree-checkbox-checked-background': '#2e7d32',
    '--p-tree-checkbox-checked-border': '#2e7d32',
    '--p-tree-checkbox-checked-color': '#ffffff',
    '--p-tree-checkbox-indeterminate-background': '#e8f5e8',
    '--p-tree-checkbox-indeterminate-border': '#2e7d32',
    '--p-tree-checkbox-indeterminate-color': '#2e7d32',
    
    // 切换器
    '--p-tree-toggler-color': '#757575',
    '--p-tree-toggler-hover-color': '#2e7d32',
    
    // 动画
    '--p-tree-transition': 'background-color 0.15s ease, border-color 0.15s ease, color 0.15s ease',
    
    // 间距和尺寸
    '--p-tree-node-indent': '20px',
    '--p-tree-node-padding': '0.5rem',
    '--p-tree-node-height': '2rem',
    '--p-tree-node-border-radius': '0.25rem',
    '--p-tree-toggler-size': '1rem',
    '--p-tree-icon-size': '1rem',
    '--p-tree-checkbox-size': '1rem',
  }
}

// Fluent UI 主题
export const fluentTheme: TreeTheme = {
  name: 'fluent',
  variables: {
    // 基础颜色
    '--p-tree-background': '#ffffff',
    '--p-tree-text-color': '#323130',
    '--p-tree-border-color': '#d2d0ce',
    '--p-tree-secondary-text-color': '#605e5c',
    
    // 交互状态
    '--p-tree-hover-background': '#f3f2f1',
    '--p-tree-active-background': '#edebe9',
    
    // 选中状态
    '--p-tree-selected-background': '#deecf9',
    '--p-tree-selected-border': '#106ebe',
    '--p-tree-selected-text-color': '#106ebe',
    
    // 焦点状态
    '--p-tree-focus-outline': '#106ebe',
    '--p-tree-focus-outline-width': '2px',
    '--p-tree-focus-ring': '0 0 0 2px rgba(16, 110, 190, 0.2)',
    
    // 拖拽指示器
    '--p-tree-drop-line-color': '#106ebe',
    '--p-tree-drop-line-width': '3px',
    '--p-tree-drop-inside-background': 'rgba(16, 110, 190, 0.1)',
    '--p-tree-drop-inside-border': '#106ebe',
    
    // 跨树拖拽
    '--p-tree-cross-drop-line-color': '#107c10',
    '--p-tree-cross-drop-inside-background': 'rgba(16, 124, 16, 0.1)',
    '--p-tree-cross-drop-inside-border': '#107c10',
    
    // 过滤器
    '--p-tree-filter-background': '#f3f2f1',
    '--p-tree-filter-input-background': '#ffffff',
    '--p-tree-filter-input-border': '#d2d0ce',
    '--p-tree-filter-input-focus-border': '#106ebe',
    '--p-tree-filter-icon-color': '#605e5c',
    
    // 加载和空状态
    '--p-tree-loading-text-color': '#605e5c',
    '--p-tree-empty-text-color': '#605e5c',
    
    // 复选框
    '--p-tree-checkbox-border': '#d2d0ce',
    '--p-tree-checkbox-background': '#ffffff',
    '--p-tree-checkbox-checked-background': '#106ebe',
    '--p-tree-checkbox-checked-border': '#106ebe',
    '--p-tree-checkbox-checked-color': '#ffffff',
    '--p-tree-checkbox-indeterminate-background': '#deecf9',
    '--p-tree-checkbox-indeterminate-border': '#106ebe',
    '--p-tree-checkbox-indeterminate-color': '#106ebe',
    
    // 切换器
    '--p-tree-toggler-color': '#605e5c',
    '--p-tree-toggler-hover-color': '#106ebe',
    
    // 动画
    '--p-tree-transition': 'background-color 0.15s ease, border-color 0.15s ease, color 0.15s ease',
    
    // 间距和尺寸
    '--p-tree-node-indent': '20px',
    '--p-tree-node-padding': '0.5rem',
    '--p-tree-node-height': '2rem',
    '--p-tree-node-border-radius': '0.25rem',
    '--p-tree-toggler-size': '1rem',
    '--p-tree-icon-size': '1rem',
    '--p-tree-checkbox-size': '1rem',
  }
}

// Tailwind 主题
export const tailwindTheme: TreeTheme = {
  name: 'tailwind',
  variables: {
    // 基础颜色
    '--p-tree-background': '#ffffff',
    '--p-tree-text-color': '#374151',
    '--p-tree-border-color': '#d1d5db',
    '--p-tree-secondary-text-color': '#6b7280',
    
    // 交互状态
    '--p-tree-hover-background': '#f9fafb',
    '--p-tree-active-background': '#f3f4f6',
    
    // 选中状态
    '--p-tree-selected-background': '#dbeafe',
    '--p-tree-selected-border': '#3b82f6',
    '--p-tree-selected-text-color': '#1e40af',
    
    // 焦点状态
    '--p-tree-focus-outline': '#3b82f6',
    '--p-tree-focus-outline-width': '2px',
    '--p-tree-focus-ring': '0 0 0 3px rgba(59, 130, 246, 0.1)',
    
    // 拖拽指示器
    '--p-tree-drop-line-color': '#3b82f6',
    '--p-tree-drop-line-width': '3px',
    '--p-tree-drop-inside-background': 'rgba(59, 130, 246, 0.1)',
    '--p-tree-drop-inside-border': '#3b82f6',
    
    // 跨树拖拽
    '--p-tree-cross-drop-line-color': '#10b981',
    '--p-tree-cross-drop-inside-background': 'rgba(16, 185, 129, 0.1)',
    '--p-tree-cross-drop-inside-border': '#10b981',
    
    // 过滤器
    '--p-tree-filter-background': '#f9fafb',
    '--p-tree-filter-input-background': '#ffffff',
    '--p-tree-filter-input-border': '#d1d5db',
    '--p-tree-filter-input-focus-border': '#3b82f6',
    '--p-tree-filter-icon-color': '#6b7280',
    
    // 加载和空状态
    '--p-tree-loading-text-color': '#6b7280',
    '--p-tree-empty-text-color': '#6b7280',
    
    // 复选框
    '--p-tree-checkbox-border': '#d1d5db',
    '--p-tree-checkbox-background': '#ffffff',
    '--p-tree-checkbox-checked-background': '#3b82f6',
    '--p-tree-checkbox-checked-border': '#3b82f6',
    '--p-tree-checkbox-checked-color': '#ffffff',
    '--p-tree-checkbox-indeterminate-background': '#dbeafe',
    '--p-tree-checkbox-indeterminate-border': '#3b82f6',
    '--p-tree-checkbox-indeterminate-color': '#3b82f6',
    
    // 切换器
    '--p-tree-toggler-color': '#6b7280',
    '--p-tree-toggler-hover-color': '#3b82f6',
    
    // 动画
    '--p-tree-transition': 'background-color 0.15s ease, border-color 0.15s ease, color 0.15s ease',
    
    // 间距和尺寸
    '--p-tree-node-indent': '20px',
    '--p-tree-node-padding': '0.5rem',
    '--p-tree-node-height': '2rem',
    '--p-tree-node-border-radius': '0.25rem',
    '--p-tree-toggler-size': '1rem',
    '--p-tree-icon-size': '1rem',
    '--p-tree-checkbox-size': '1rem',
  }
}

// 所有可用主题
export const availableThemes: TreeTheme[] = [
  laraLightTheme,
  laraDarkTheme,
  bootstrapTheme,
  materialTheme,
  fluentTheme,
  tailwindTheme
]

// 主题管理器
export class TreeThemeManager {
  private currentTheme: TreeTheme = laraLightTheme
  private rootElement: HTMLElement

  constructor(rootElement: HTMLElement = document.documentElement) {
    this.rootElement = rootElement
  }

  /**
   * 应用主题
   */
  applyTheme(theme: TreeTheme | string): void {
    const targetTheme = typeof theme === 'string' 
      ? this.getThemeByName(theme) 
      : theme

    if (!targetTheme) {
      console.warn(`Theme not found: ${theme}`)
      return
    }

    // 移除当前主题类
    this.rootElement.classList.remove(`p-tree-theme-${this.currentTheme.name}`)
    
    // 应用新主题变量
    Object.entries(targetTheme.variables).forEach(([property, value]) => {
      this.rootElement.style.setProperty(property, value)
    })

    // 添加新主题类
    this.rootElement.classList.add(`p-tree-theme-${targetTheme.name}`)
    
    this.currentTheme = targetTheme
  }

  /**
   * 获取当前主题
   */
  getCurrentTheme(): TreeTheme {
    return this.currentTheme
  }

  /**
   * 根据名称获取主题
   */
  getThemeByName(name: string): TreeTheme | undefined {
    return availableThemes.find(theme => theme.name === name)
  }

  /**
   * 获取所有可用主题
   */
  getAvailableThemes(): TreeTheme[] {
    return [...availableThemes]
  }

  /**
   * 创建自定义主题
   */
  createCustomTheme(name: string, variables: Record<string, string>): TreeTheme {
    return {
      name,
      variables: {
        ...laraLightTheme.variables,
        ...variables
      }
    }
  }

  /**
   * 重置为默认主题
   */
  resetToDefault(): void {
    this.applyTheme(laraLightTheme)
  }

  /**
   * 检测系统主题偏好
   */
  detectSystemTheme(): TreeTheme {
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return laraDarkTheme
    }
    return laraLightTheme
  }

  /**
   * 自动应用系统主题
   */
  applySystemTheme(): void {
    const systemTheme = this.detectSystemTheme()
    this.applyTheme(systemTheme)

    // 监听系统主题变化
    if (window.matchMedia) {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
      mediaQuery.addEventListener('change', (e) => {
        const newTheme = e.matches ? laraDarkTheme : laraLightTheme
        this.applyTheme(newTheme)
      })
    }
  }

  /**
   * 导出当前主题配置
   */
  exportTheme(): string {
    return JSON.stringify(this.currentTheme, null, 2)
  }

  /**
   * 从配置导入主题
   */
  importTheme(themeConfig: string): TreeTheme | null {
    try {
      const theme = JSON.parse(themeConfig) as TreeTheme
      if (theme.name && theme.variables) {
        return theme
      }
      throw new Error('Invalid theme format')
    } catch (error) {
      console.error('Failed to import theme:', error)
      return null
    }
  }
}

// 默认主题管理器实例
export const defaultThemeManager = new TreeThemeManager()

// 主题工具函数
export const themeUtils = {
  /**
   * 快速应用主题
   */
  applyTheme: (theme: TreeTheme | string) => {
    defaultThemeManager.applyTheme(theme)
  },

  /**
   * 获取当前主题
   */
  getCurrentTheme: () => {
    return defaultThemeManager.getCurrentTheme()
  },

  /**
   * 切换明暗主题
   */
  toggleDarkMode: () => {
    const current = defaultThemeManager.getCurrentTheme()
    const newTheme = current.name.includes('dark') ? laraLightTheme : laraDarkTheme
    defaultThemeManager.applyTheme(newTheme)
  },

  /**
   * 应用系统主题
   */
  applySystemTheme: () => {
    defaultThemeManager.applySystemTheme()
  }
}

// Vue 3 组合式函数
export function useTreeTheme() {
  const themeManager = new TreeThemeManager()

  return {
    currentTheme: themeManager.getCurrentTheme(),
    availableThemes,
    applyTheme: themeManager.applyTheme.bind(themeManager),
    createCustomTheme: themeManager.createCustomTheme.bind(themeManager),
    detectSystemTheme: themeManager.detectSystemTheme.bind(themeManager),
    applySystemTheme: themeManager.applySystemTheme.bind(themeManager),
    toggleDarkMode: () => {
      const current = themeManager.getCurrentTheme()
      const newTheme = current.name.includes('dark') ? laraLightTheme : laraDarkTheme
      themeManager.applyTheme(newTheme)
    }
  }
}