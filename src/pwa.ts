import { useEffect, useRef, useState } from 'react'
import { useRegisterSW } from 'virtual:pwa-register/react'

// PWA 지원 (#6): Service Worker 등록, 새 버전 안내, 홈 화면 설치.
// 캐시는 앱 셸(정적 파일)만 다루며 보드 데이터(localStorage)와는 무관하다.

// 탭을 오래 열어 두어도 새 배포를 알아차리도록 주기적으로 확인한다.
const UPDATE_CHECK_INTERVAL_MS = 60 * 60 * 1000

// Chromium 계열에서만 지원하는 설치 이벤트 (표준 DOM 타입에 없음)
type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

type PwaOptions = {
  // 앱 셸 캐시가 처음 끝나 오프라인에서도 열 수 있게 됐을 때 한 번 불린다.
  onOfflineReady: () => void
}

export function usePwa({ onOfflineReady }: PwaOptions) {
  // 등록 콜백은 한 번만 만들어지므로 최신 콜백(현재 언어 문구)을 ref로 넘긴다.
  const offlineReadyHandler = useRef(onOfflineReady)
  useEffect(() => {
    offlineReadyHandler.current = onOfflineReady
  })

  const {
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onOfflineReady() {
      offlineReadyHandler.current()
    },
    onRegisteredSW(_url, registration) {
      if (!registration) {
        return
      }
      window.setInterval(() => {
        if (navigator.onLine) {
          void registration.update()
        }
      }, UPDATE_CHECK_INTERVAL_MS)
    },
  })

  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(
    null,
  )

  useEffect(() => {
    function handleBeforeInstallPrompt(event: Event) {
      // 브라우저 기본 설치 안내 대신 상단 설치 버튼으로 보여준다.
      event.preventDefault()
      setInstallPrompt(event as BeforeInstallPromptEvent)
    }
    function handleAppInstalled() {
      setInstallPrompt(null)
    }
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    window.addEventListener('appinstalled', handleAppInstalled)
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
      window.removeEventListener('appinstalled', handleAppInstalled)
    }
  }, [])

  async function installApp() {
    if (!installPrompt) {
      return
    }
    await installPrompt.prompt()
    await installPrompt.userChoice
    // 설치 안내는 한 번만 쓸 수 있으므로 결과와 상관없이 버튼을 숨긴다.
    setInstallPrompt(null)
  }

  return {
    canInstall: installPrompt !== null,
    installApp,
    needRefresh,
    // 보드는 수정할 때마다 localStorage에 바로 저장되므로 새로고침해도 내용은 남는다.
    applyUpdate: () => updateServiceWorker(true),
    dismissUpdate: () => setNeedRefresh(false),
  }
}
