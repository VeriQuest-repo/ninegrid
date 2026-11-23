import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig, loadEnv, type Plugin } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'

// Cloudflare Web Analytics (#14).
// workers.dev 배포에는 자동 삽입이 안 되므로 비콘 스니펫을 빌드 때 index.html에 넣는다.
// - 사이트 토큰은 저장소에 적지 않고 빌드 환경 변수 CF_WEB_ANALYTICS_TOKEN으로 받는다.
// - 운영 빌드에서만 넣는다. 개발 서버(npm run dev)에는 넣지 않고, 토큰이 없으면(로컬 빌드·CI) 넣지 않는다.
// - Cloudflare Workers Builds가 main이 아닌 브랜치를 빌드할 때(프리뷰)는 넣지 않는다.
// - 쿠키·localStorage를 쓰지 않고 페이지뷰·성능·방문 환경만 보낸다. 보드 내용은 보내지 않는다.
// - Service Worker는 같은 출처의 정적 파일만 미리 캐시하므로 비콘(다른 출처)은 캐시하지 않고,
//   오프라인에서 비콘을 못 불러와도 앱 동작에는 영향이 없다.
const PRODUCTION_BRANCH = 'main'

function cloudflareWebAnalytics(token: string | undefined, branch: string | undefined): Plugin {
  return {
    name: 'ninegrid-cloudflare-web-analytics',
    apply: 'build',
    transformIndexHtml(_html, ctx) {
      if (!token) return
      if (branch && branch !== PRODUCTION_BRANCH) return
      // 토큰은 32자리 16진수. 다른 값이면 HTML에 넣지 않고 빌드를 멈춘다.
      if (!/^[0-9a-f]{32}$/i.test(token)) {
        throw new Error('CF_WEB_ANALYTICS_TOKEN must be a 32-character hex site token.')
      }
      if (ctx.server) return
      return [
        {
          tag: 'script',
          attrs: {
            defer: true,
            src: 'https://static.cloudflareinsights.com/beacon.min.js',
            'data-cf-beacon': JSON.stringify({ token }),
          },
          injectTo: 'body',
        },
      ]
    },
  }
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const analyticsToken =
    mode === 'production' ? env.CF_WEB_ANALYTICS_TOKEN?.trim() || undefined : undefined

  return {
    plugins: [
      react(),
      tailwindcss(),
      cloudflareWebAnalytics(analyticsToken, env.WORKERS_CI_BRANCH),
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
  }
})
