import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      // 새 버전은 자동으로 적용하지 않고, 앱에서 업데이트 안내를 띄운 뒤 사용자가 고른다.
      registerType: 'prompt',
      // 등록은 App에서 virtual:pwa-register/react로 직접 한다.
      injectRegister: false,
      manifest: {
        name: 'NineGrid — 9×9 Mandalart Board',
        short_name: 'NineGrid',
        description: '9×9 mandalart goal planning board',
        lang: 'ko',
        start_url: '/',
        scope: '/',
        display: 'standalone',
        // 라이트 테마의 --page 값. 다크 테마 상단바 색은 index.html의 theme-color 메타가 맡는다.
        background_color: '#f4f5f1',
        theme_color: '#f4f5f1',
        icons: [
          { src: 'pwa-64x64.png', sizes: '64x64', type: 'image/png' },
          { src: 'pwa-192x192.png', sizes: '192x192', type: 'image/png' },
          { src: 'pwa-512x512.png', sizes: '512x512', type: 'image/png' },
          {
            src: 'maskable-icon-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
      workbox: {
        // 앱 셸(정적 파일)만 캐시한다. 보드 데이터는 localStorage에만 있다.
        // 파일 이름에 해시가 붙어 배포마다 캐시 목록이 바뀌므로 오래된 캐시가 남지 않는다.
        globPatterns: [
          '**/*.{js,css,html,svg}',
          'pwa-*.png',
          'maskable-icon-*.png',
          'apple-touch-icon-*.png',
        ],
        cleanupOutdatedCaches: true,
        navigateFallback: '/index.html',
      },
    }),
  ],
})
