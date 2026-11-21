import { defineConfig, minimal2023Preset } from '@vite-pwa/assets-generator/config'

// PWA 아이콘 생성 설정. 아이콘을 바꾸면 `npm run generate-pwa-assets`로 다시 만든다.
export default defineConfig({
  headLinkOptions: { preset: '2023' },
  preset: {
    ...minimal2023Preset,
    // favicon.svg를 그대로 쓰므로 favicon.ico는 만들지 않는다.
    transparent: { ...minimal2023Preset.transparent, favicons: [] },
    // 배경색은 라이트 테마의 --page 값과 같다.
    maskable: { ...minimal2023Preset.maskable, resizeOptions: { background: '#f4f5f1' } },
    apple: { ...minimal2023Preset.apple, resizeOptions: { background: '#f4f5f1' } },
  },
  images: ['public/favicon.svg'],
})
