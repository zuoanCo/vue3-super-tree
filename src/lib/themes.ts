// PrimeVue Tree 主题配置

export interface TreeTheme {
  name: string
  variables: Record<string, string>
}

// 默认主题 (Lara Light)
export const laraLightTheme: TreeTheme = {
  name: 'lara-light',
  variables: {
    '--p-tree-background': '#ffffff',
    '--p-tree-text-color': '#495057',
    '--p-tree-border-color': '#dee2e6',
    '--p-tree-hover-background': '#f8f9fa',
    '--p-tree-selected-background': '#e3f2fd',
    '--p-tree-selected-text-color': '#1976d2',
    '--p-tree-focus-ring': '0 0 0 0.2rem rgba(25, 118, 210, 0.2)',
    '--p-tree-drag-background': 'rgba(25, 118, 210, 0.1)',
    '--p-tree-drop-indicator': '#1976d2',
  }
}

// 深色主题 (Lara Dark)
export const laraDarkTheme: TreeTheme = {
  name: 'lara-dark',
  variables: {
    '--p-tree-background': '#1e1e1e',
    '--p-tree-text-color': '#e0e0e0',
    '--p-tree-border-color': '#404040',
    '--p-tree-hover-background': '#2a2a2a',
    '--p-tree-selected-background': '#1a365d',
    '--p-tree-selected-text-color': '#90cdf4',
    '--p-tree-focus-ring': '0 0 0 0.2rem rgba(144, 205, 244, 0.2)',
    '--p-tree-drag-background': 'rgba(144, 205, 244, 0.1)',
    '--p-tree-drop-indicator': '#90cdf4',
  }
}

// Bootstrap 主题
export const bootstrapTheme: TreeTheme = {
  name: 'bootstrap',
  variables: {
    '--p-tree-background': '#ffffff',
    '--p-tree-text-color': '#212529',
    '--p-tree-border-color': '#dee2e6',
    '--p-tree-hover-background': '#f8f9fa',
    '--p-tree-selected-background': '#e7f3ff',
    '--p-tree-selected-text-color': '#0d6efd',
    '--p-tree-focus-ring': '0 0 0 0.25rem rgba(13, 110, 253, 0.25)',
    '--p-tree-drag-background': 'rgba(13, 110, 253, 0.1)',
    '--p-tree-drop-indicator': '#0d6efd',
  }
}

// Material Design 主题
export const materialTheme: TreeTheme = {
  name: 'material',
  variables: {
    '--p-tree-background': '#ffffff',
    '--p-tree-text-color': '#212121',
    '--p-tree-border-color': '#e0e0e0',
    '--p-tree-hover-background': '#f5f5f5',
    '--p-tree-selected-background': '#e8f5e8',
    '--p-tree-selected-text-color': '#2e7d32',
    '--p-tree-focus-ring': '0 0 0 2px rgba(46, 125, 50, 0.2)',
    '--p-tree-drag-background': 'rgba(46, 125, 50, 0.1)',
    '--p-tree-drop-indicator': '#2e7d32',
  }
}

// Fluent UI 主题
export const fluentTheme: TreeTheme = {
  name: 'fluent',
  variables: {
    '--p-tree-background': '#ffffff',
    '--p-tree-text-color': '#323130',
    '--p-tree-border-color': '#d2d0ce',
    '--p-tree-hover-background': '#f3f2f1',
    '--p-tree-selected-background': '#deecf9',
    '--p-tree-selected-text-color': '#106ebe',
    '--p-tree-focus-ring': '0 0 0 2px rgba(16, 110, 190, 0.2)',
    '--p-tree-drag-background': 'rgba(16, 110, 190, 0.1)',
    '--p-tree-drop-indicator': '#106ebe',
  }
}

// Tailwind 主题
export const tailwindTheme: TreeTheme = {
  name: 'tailwind',
  variables: {
    '--p-tree-background': '#ffffff',
    '--p-tree-text-color': '#374151',
    '--p-tree-border-color': '#d1d5db',
    '--p-tree-hover-background': '#f9fafb',
    '--p-tree-selected-background': '#dbeafe',
    '--p-tree-selected-text-color': '#1d4ed8',
    '--p-tree-focus-ring': '0 0 0 3px rgba(29, 78, 216, 0.1)',
    '--p-tree-drag-background': 'rgba(29, 78, 216, 0.1)',
    '--p-tree-drop-indicator': '#1d4ed8',
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