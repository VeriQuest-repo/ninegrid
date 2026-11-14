export type Language = 'ko' | 'en' | 'ja' | 'zh'

export type Translation = {
  pageTitle: string
  homeLabel: string
  languageLabel: string
  focusMode: string
  showAll: string
  pngDownload: string
  backupDownload: string
  backupRestore: string
  backupFile: string
  themeToDark: string
  themeToLight: string
  reset: string
  eyebrow: string
  headline: string
  headlineAccent: string
  intro: string
  progressLabel: string
  completedCount: (count: number, total: number) => string
  detailCount: string
  boardLabel: string
  boardSize: string
  autoSaving: string
  fullModeHint: string
  focusModeHint: string
  editAreaLabel: string
  previousBlock: (title: string) => string
  nextBlock: (title: string) => string
  blockRegion: (number: number, title: string) => string
  areaName: (number: number) => string
  centerGoal: string
  linkedGoal: string
  subgoal: string
  action: string
  hubPlaceholder: string
  areaExamples: string[]
  goalPlaceholder: string
  linkedPlaceholder: string
  actionPlaceholder: string
  expandBlock: (title: string) => string
  expand: string
  completed: string
  undoCompleted: string
  legendCenter: string
  legendLinked: string
  legendAction: string
  footerMessage: string
  footerBrand: string
  resetConfirm: string
  resetSuccess: string
  saveError: string
  invalidStorage: string
  readStorageError: string
  pngNoBoard: string
  pngSuccess: string
  pngError: (message: string) => string
  backupSuccess: string
  restoreSuccess: string
  invalidBackup: string
  restoreError: string
}

export const translations: Record<Language, Translation> = {
  ko: {
    pageTitle: 'NineGrid — 만다라트 목표 관리',
    homeLabel: 'NineGrid 홈',
    languageLabel: '언어 선택',
    focusMode: '포커스 모드',
    showAll: '전체 보기',
    pngDownload: '보드 PNG 다운로드',
    backupDownload: 'JSON 백업 다운로드',
    backupRestore: 'JSON 백업 복원',
    backupFile: 'JSON 백업 파일 선택',
    themeToDark: '다크 테마로 변경',
    themeToLight: '라이트 테마로 변경',
    reset: '초기화',
    eyebrow: '나만의 만다라트 보드',
    headline: '큰 목표를,',
    headlineAccent: '오늘의 한 걸음으로.',
    intro: '가운데 목표에서 시작해 8개의 영역과 작은 실천으로 채워보세요.',
    progressLabel: '전체 달성률',
    completedCount: (count, total) => `${count} / ${total}개 실천 완료`,
    detailCount: '64개의 세부 실천',
    boardLabel: '만다라트 보드',
    boardSize: '9 × 9',
    autoSaving: '자동 저장 중',
    fullModeHint: '확대 버튼으로 영역을 크게 편집하세요',
    focusModeHint: '화살표로 다음 영역을 편집하세요',
    editAreaLabel: '편집할 영역 선택',
    previousBlock: (title) => `이전 블록: ${title}`,
    nextBlock: (title) => `다음 블록: ${title}`,
    blockRegion: (number, title) => `${number}번 블록: ${title}`,
    areaName: (number) => `영역 ${number}`,
    centerGoal: '중심 목표',
    linkedGoal: '자동 연동된 세부 목표',
    subgoal: '중심 블록의 세부 목표',
    action: '세부 실천',
    hubPlaceholder: '예: 올해 이루고 싶은 목표',
    areaExamples: [
      '예: 건강',
      '예: 커리어',
      '예: 배움',
      '예: 관계',
      '예: 재정',
      '예: 취미',
      '예: 성장',
      '예: 생활',
    ],
    goalPlaceholder: '예: 구체적인 세부 목표',
    linkedPlaceholder: '중심 목표에서 자동 연동',
    actionPlaceholder: '예: 오늘 할 작은 실천',
    expandBlock: (title) => `${title} 블록 확대`,
    expand: '확대',
    completed: '실천 완료 표시',
    undoCompleted: '완료 표시 해제',
    legendCenter: '중심 목표',
    legendLinked: '자동 연동 영역',
    legendAction: '클릭해 실천 완료',
    footerMessage: '작은 실천이 모여, 큰 변화를 만듭니다.',
    footerBrand: 'NINEGRID · by VERIQUEST',
    resetConfirm: '보드를 처음 템플릿으로 되돌릴까요?',
    resetSuccess: '기본 템플릿으로 초기화했어요.',
    saveError: '자동 저장에 실패했어요. 브라우저 저장 공간을 확인해 주세요.',
    invalidStorage: '저장된 데이터 형식이 올바르지 않아 기본 보드를 열었어요.',
    readStorageError: '저장 데이터를 읽지 못해 기본 보드를 열었어요.',
    pngNoBoard: '보드를 이미지로 만들지 못했어요.',
    pngSuccess: '보드 PNG 이미지를 다운로드했어요.',
    pngError: (message) =>
      message
        ? `PNG 이미지 생성에 실패했어요: ${message}`
        : 'PNG 이미지 생성에 실패했어요.',
    backupSuccess: 'JSON 백업 파일을 다운로드했어요.',
    restoreSuccess: 'JSON 백업을 복원했어요.',
    invalidBackup: '지원하지 않는 백업 파일 형식이에요.',
    restoreError: 'JSON 파일을 복원하지 못했어요.',
  },
  en: {
    pageTitle: 'NineGrid — Mandalart Goal Planner',
    homeLabel: 'NineGrid home',
    languageLabel: 'Select language',
    focusMode: 'Focus',
    showAll: 'Show all',
    pngDownload: 'Download board PNG',
    backupDownload: 'Download JSON backup',
    backupRestore: 'Restore JSON backup',
    backupFile: 'Choose JSON backup file',
    themeToDark: 'Switch to dark theme',
    themeToLight: 'Switch to light theme',
    reset: 'Reset',
    eyebrow: 'YOUR PERSONAL MANDAL-ART',
    headline: 'Dream big,',
    headlineAccent: 'start with one small step.',
    intro: 'Start with your central goal, then fill in eight areas and small actions.',
    progressLabel: 'Overall progress',
    completedCount: (count, total) => `${count} / ${total} actions done`,
    detailCount: '64 small actions',
    boardLabel: 'Mandalart board',
    boardSize: '9 × 9',
    autoSaving: 'Saved automatically',
    fullModeHint: 'Select Expand to work on an area',
    focusModeHint: 'Use the arrows to move between areas',
    editAreaLabel: 'Choose an area to edit',
    previousBlock: (title) => `Previous block: ${title}`,
    nextBlock: (title) => `Next block: ${title}`,
    blockRegion: (number, title) => `Block ${number}: ${title}`,
    areaName: (number) => `Area ${number}`,
    centerGoal: 'Central goal',
    linkedGoal: 'Linked subgoal',
    subgoal: 'Subgoal in central block',
    action: 'Small action',
    hubPlaceholder: 'e.g. A goal I want to reach this year',
    areaExamples: [
      'e.g. Health',
      'e.g. Career',
      'e.g. Learning',
      'e.g. Relationships',
      'e.g. Finances',
      'e.g. Hobbies',
      'e.g. Growth',
      'e.g. Lifestyle',
    ],
    goalPlaceholder: 'e.g. A specific subgoal',
    linkedPlaceholder: 'Linked from the central goal',
    actionPlaceholder: 'e.g. One small action for today',
    expandBlock: (title) => `Expand ${title} block`,
    expand: 'Expand',
    completed: 'Mark action complete',
    undoCompleted: 'Undo completion',
    legendCenter: 'Central goal',
    legendLinked: 'Linked areas',
    legendAction: 'Click to complete an action',
    footerMessage: 'Small steps add up to meaningful change.',
    footerBrand: 'NINEGRID · by VERIQUEST',
    resetConfirm: 'Reset the board to its original template?',
    resetSuccess: 'The board has been reset to the template.',
    saveError: 'Could not save automatically. Check your browser storage.',
    invalidStorage: 'Saved data is invalid. The default board was opened.',
    readStorageError: 'Could not read saved data. The default board was opened.',
    pngNoBoard: 'Could not create an image of the board.',
    pngSuccess: 'Board PNG downloaded.',
    pngError: (message) =>
      message ? `Could not create PNG: ${message}` : 'Could not create PNG.',
    backupSuccess: 'JSON backup downloaded.',
    restoreSuccess: 'JSON backup restored.',
    invalidBackup: 'Unsupported backup file format.',
    restoreError: 'Could not restore the JSON file.',
  },
  ja: {
    pageTitle: 'NineGrid — マンダラート目標管理',
    homeLabel: 'NineGrid ホーム',
    languageLabel: '言語を選択',
    focusMode: 'フォーカス',
    showAll: '全体表示',
    pngDownload: 'ボードをPNGで保存',
    backupDownload: 'JSONバックアップを保存',
    backupRestore: 'JSONバックアップを復元',
    backupFile: 'JSONバックアップファイルを選択',
    themeToDark: 'ダークテーマに切り替え',
    themeToLight: 'ライトテーマに切り替え',
    reset: 'リセット',
    eyebrow: 'あなたのマンダラート',
    headline: '大きな目標を、',
    headlineAccent: '今日の小さな一歩から。',
    intro: '中央の目標から始めて、8つの分野と小さな行動を書き込みましょう。',
    progressLabel: '全体の達成率',
    completedCount: (count, total) => `${total}件中 ${count}件完了`,
    detailCount: '64の小さな行動',
    boardLabel: 'マンダラートボード',
    boardSize: '9 × 9',
    autoSaving: '自動保存中',
    fullModeHint: '「拡大」を選んで分野を編集',
    focusModeHint: '矢印で分野を切り替え',
    editAreaLabel: '編集する分野を選択',
    previousBlock: (title) => `前のブロック: ${title}`,
    nextBlock: (title) => `次のブロック: ${title}`,
    blockRegion: (number, title) => `${number}番ブロック: ${title}`,
    areaName: (number) => `分野 ${number}`,
    centerGoal: '中心目標',
    linkedGoal: '連動した小目標',
    subgoal: '中心ブロックの小目標',
    action: '小さな行動',
    hubPlaceholder: '例: 今年達成したい目標',
    areaExamples: [
      '例: 健康',
      '例: キャリア',
      '例: 学び',
      '例: 人間関係',
      '例: お金',
      '例: 趣味',
      '例: 成長',
      '例: 暮らし',
    ],
    goalPlaceholder: '例: 具体的な小目標',
    linkedPlaceholder: '中心目標から自動連動',
    actionPlaceholder: '例: 今日できる小さな行動',
    expandBlock: (title) => `${title}ブロックを拡大`,
    expand: '拡大',
    completed: '行動を完了にする',
    undoCompleted: '完了を取り消す',
    legendCenter: '中心目標',
    legendLinked: '自動連動する分野',
    legendAction: 'クリックして完了',
    footerMessage: '小さな行動が集まり、大きな変化になります。',
    footerBrand: 'NINEGRID · by VERIQUEST',
    resetConfirm: 'ボードを初期テンプレートに戻しますか？',
    resetSuccess: 'ボードを初期テンプレートに戻しました。',
    saveError: '自動保存できませんでした。ブラウザーの保存容量を確認してください。',
    invalidStorage: '保存データの形式が正しくないため、初期ボードを開きました。',
    readStorageError: '保存データを読み込めないため、初期ボードを開きました。',
    pngNoBoard: 'ボードを画像にできませんでした。',
    pngSuccess: 'ボードのPNG画像を保存しました。',
    pngError: (message) =>
      message ? `PNG画像を作成できませんでした: ${message}` : 'PNG画像を作成できませんでした。',
    backupSuccess: 'JSONバックアップを保存しました。',
    restoreSuccess: 'JSONバックアップを復元しました。',
    invalidBackup: '対応していないバックアップ形式です。',
    restoreError: 'JSONファイルを復元できませんでした。',
  },
  zh: {
    pageTitle: 'NineGrid — 九宫格目标管理',
    homeLabel: 'NineGrid 首页',
    languageLabel: '选择语言',
    focusMode: '专注模式',
    showAll: '显示全部',
    pngDownload: '下载看板 PNG',
    backupDownload: '下载 JSON 备份',
    backupRestore: '恢复 JSON 备份',
    backupFile: '选择 JSON 备份文件',
    themeToDark: '切换到深色主题',
    themeToLight: '切换到浅色主题',
    reset: '重置',
    eyebrow: '你的九宫格目标计划',
    headline: '设定远大目标，',
    headlineAccent: '从今天的一小步开始。',
    intro: '从中心目标出发，填写八个领域和每日小行动。',
    progressLabel: '总体完成率',
    completedCount: (count, total) => `已完成 ${count} / ${total} 项行动`,
    detailCount: '64 项小行动',
    boardLabel: '九宫格目标看板',
    boardSize: '9 × 9',
    autoSaving: '自动保存中',
    fullModeHint: '点击“放大”编辑一个领域',
    focusModeHint: '使用箭头切换领域',
    editAreaLabel: '选择要编辑的领域',
    previousBlock: (title) => `上一个区块：${title}`,
    nextBlock: (title) => `下一个区块：${title}`,
    blockRegion: (number, title) => `第 ${number} 个区块：${title}`,
    areaName: (number) => `领域 ${number}`,
    centerGoal: '中心目标',
    linkedGoal: '自动关联的子目标',
    subgoal: '中心区块的子目标',
    action: '每日行动',
    hubPlaceholder: '例如：今年想实现的目标',
    areaExamples: [
      '例如：健康',
      '例如：事业',
      '例如：学习',
      '例如：人际关系',
      '例如：财务',
      '例如：兴趣爱好',
      '例如：成长',
      '例如：生活',
    ],
    goalPlaceholder: '例如：具体的子目标',
    linkedPlaceholder: '自动关联中心目标',
    actionPlaceholder: '例如：今天可以完成的一小步',
    expandBlock: (title) => `放大${title}区块`,
    expand: '放大',
    completed: '标记为已完成',
    undoCompleted: '取消完成标记',
    legendCenter: '中心目标',
    legendLinked: '自动关联领域',
    legendAction: '点击标记完成',
    footerMessage: '每一小步，都会汇成大改变。',
    footerBrand: 'NINEGRID · by VERIQUEST',
    resetConfirm: '要将看板恢复为初始模板吗？',
    resetSuccess: '看板已恢复为初始模板。',
    saveError: '自动保存失败，请检查浏览器存储空间。',
    invalidStorage: '保存的数据格式无效，已打开默认看板。',
    readStorageError: '无法读取保存的数据，已打开默认看板。',
    pngNoBoard: '无法生成看板图片。',
    pngSuccess: '看板 PNG 图片已下载。',
    pngError: (message) =>
      message ? `无法生成 PNG 图片：${message}` : '无法生成 PNG 图片。',
    backupSuccess: 'JSON 备份文件已下载。',
    restoreSuccess: 'JSON 备份已恢复。',
    invalidBackup: '不支持此备份文件格式。',
    restoreError: '无法恢复 JSON 文件。',
  },
}

export function isLanguage(value: unknown): value is Language {
  return value === 'ko' || value === 'en' || value === 'ja' || value === 'zh'
}

export function detectLanguage(browserLanguage?: string): Language {
  const language =
    browserLanguage ??
    (typeof navigator === 'undefined' ? 'ko' : navigator.language)
  const normalized = language.toLowerCase()

  if (normalized.startsWith('en')) return 'en'
  if (normalized.startsWith('ja')) return 'ja'
  if (normalized.startsWith('zh')) return 'zh'
  return 'ko'
}

export function getTranslation(language: Language): Translation {
  return translations[language]
}
