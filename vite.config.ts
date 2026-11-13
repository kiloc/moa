import path from 'node:path'
import process from 'node:process'
import { fileURLToPath, URL } from 'node:url'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import AutoImport from 'unplugin-auto-import/vite'
import { VantResolver } from 'unplugin-vue-components/resolvers'
import Components from 'unplugin-vue-components/vite'
import { defineConfig, loadEnv } from 'vite'
import { compression } from 'vite-plugin-compression2'
import { mockDevServerPlugin } from 'vite-plugin-mock-dev-server'
import { createSvgIconsPlugin } from 'vite-plugin-svg-icons-ng'
import { enableCDN } from './build/cdn'

// 当前工作目录路径
const root: string = process.cwd()

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // 环境变量
  const env = loadEnv(mode, root, '')

  return {
    base: env.VITE_PUBLIC_PATH || '/',
    plugins: [
      vue(),
      vueJsx(),
      mockDevServerPlugin(),
      // 自动导入 Vue/Vue Router/Pinia API
      AutoImport({
        imports: ['vue', 'vue-router', 'pinia', '@vueuse/core'],
        dts: 'src/typings/auto-imports.d.ts',
      }),
      // vant 组件自动按需引入
      Components({
        dts: 'src/typings/components.d.ts',
        resolvers: [VantResolver()],
      }),
      // svg icon
      createSvgIconsPlugin({
        // 指定图标文件夹
        iconDirs: [path.resolve(root, 'src/icons/svg')],
        // 指定 symbolId 格式
        symbolId: 'icon-[dir]-[name]',
      }),
      // 生产环境 gzip 压缩资源
      compression({
        algorithms: ['gzip'],
        threshold: 10240, // 只压缩大于 10KB 的资源
      }),
      // 生产环境默认不启用 CDN 加速
      enableCDN(env.VITE_CDN_DEPS),
    ],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
      },
    },
    server: {
      host: true,
      // 仅在 proxy 中配置的代理前缀， mock-dev-server 才会拦截并 mock
      // doc: https://github.com/pengzhanbo/vite-plugin-mock-dev-server
      proxy: {
        // API 代理
        '/ynzqgztmoa/gov/admin/': {
          // target: 'https://218.206.42.177:19002', //生产环境
          target: 'http://192.168.10.40', //开发环境
          //  target: 'http://10.118.144.6',//云南移动测试环境
          changeOrigin: true,
          pathRewrite: { '^/ynzqgztmoa/gov/admin/': '/ynzqgztmoa/gov/admin/' },
        },
        // 静态资源代理：将静态资源路径映射到开发服务器
        '/YnMoa/ynzqgztmoa/moaMobile/': {
          target: 'http://localhost:5173',
          changeOrigin: true,
          pathRewrite: { '^/YnMoa/ynzqgztmoa/moaMobile/': '/ynzqgztmoa/moaMobile/' },
        },
      },
    },
    build: {
      // 启用源码映射，便于调试
      sourcemap: false,
      rolldownOptions: {
        output: {
          chunkFileNames: 'static/js/[name]-[hash].js',
          entryFileNames: 'static/js/[name]-[hash].js',
          assetFileNames: 'static/[ext]/[name]-[hash].[ext]',
          // 关键chunk预加载
          preload: 'modules',
        },
      },
    },
    // 静态资源路径配置：与页面功能路径分离（开发和生产环境都生效）
    experimental: {
      renderBuiltUrl(filename, { hostType }) {
        // 静态资源基础路径
        const staticAssetBase = '/YnMoa/ynzqgztmoa/moaMobile/'
        // 所有静态资源（JS、CSS、HTML中引用的资源）都使用静态资源专用路径
        if (hostType === 'js' || hostType === 'css' || hostType === 'html') {
          return staticAssetBase + filename
        }
        // 其他情况使用相对路径
        return { relative: true }
      },
    },
  }
})
