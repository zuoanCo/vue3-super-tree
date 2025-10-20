import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'
import { resolve } from 'path'
import dts from 'vite-plugin-dts'
import removeConsole from 'vite-plugin-remove-console'

// 库构建配置
export default defineConfig({
  plugins: [
    vue(),
    dts({
      insertTypesEntry: true,
      copyDtsFiles: false,
      include: ['src/**/*'],
      exclude: ['src/**/*.test.*', 'src/**/*.spec.*', 'src/pages/**/*', 'src/router/**/*', 'src/main.ts', 'src/App.vue'],
      outDir: 'dist',
      tsconfigPath: './tsconfig.lib.json',
      skipDiagnostics: true,
      logDiagnostics: false,
      rollupTypes: true,
      staticImport: true,
      clearPureImport: true,
      compilerOptions: {
        skipLibCheck: true,
        noEmitOnError: false,
        suppressImplicitAnyIndexErrors: true,
        suppressExcessPropertyErrors: true,
        ignoreDeprecations: "5.0",
        diagnostics: false,
        pretty: false
      },
      beforeWriteFile: (filePath, content) => {
        // 过滤掉 Vue SFC 相关的类型错误和警告
        return content
          .replace(/\/\*\* @vue\/shared \*\*\//g, '')
          .replace(/\/\/ @ts-ignore.*\n/g, '')
          .replace(/\/\* eslint-disable.*\*\//g, '');
      },
      afterBuild: () => {
        console.log('✓ Type definitions generated successfully - Vue SFC errors suppressed');
      }
    }),
    // 在生产环境中移除 console.log
    removeConsole()
  ],
  build: {
    lib: {
      entry: resolve(__dirname, 'src/lib/index.ts'),
      name: 'Vue3SuperTree',
      fileName: (format) => `index.${format}.js`,
      formats: ['es', 'umd']
    },
    rollupOptions: {
      external: ['vue'],
      output: {
        exports: 'named',
        globals: {
          vue: 'Vue'
        }
      }
    },
    sourcemap: true,
    emptyOutDir: true
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})