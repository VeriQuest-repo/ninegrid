export type Language = 'ko' | 'en' | 'ja' | 'zh'

export type Translation = {
  pageTitle: string
  pageDescription: string
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
  undo: string
  redo: string
  eyebrow: string
  headline: string
  headlineAccent: string
  intro: string
  progressLabel: string
  completedCount: (count: number, total: number) => string
  writtenSummary: (written: number) => string
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
  completedDisabled: string
  legendCenter: string
  legendLinked: string
  legendAction: string
  footerMessage: string
  footerSupport: string
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
  unsavedChanges: string
  storageNoticeLabel: string
  storageNotice: string
  storageNoticeConfirm: string
  backupReminderLabel: string
  backupReminderNever: string
  backupReminderStale: (days: number) => string
  backupNow: string
  remindLater: string
  dontShowAgain: string
  installApp: string
  updateLabel: string
  updateAvailable: string
  updateNow: string
  offlineReady: string
  restoreSuccess: string
  invalidBackup: string
  restoreError: string
  samples: string
  samplesOpen: string
  samplesHint: string
  sampleDialogTitle: string
  sampleDialogIntro: string
  sampleChoiceLabel: string
  sampleProgress: (completed: number, total: number) => string
  sampleOverwrite: string
  sampleEmptyBoard: string
  sampleBackupHint: string
  sampleBackupFirst: string
  sampleLoad: string
  cancel: string
  sampleLoaded: (name: string) => string
}

export const translations: Record<Language, Translation> = {
  ko: {
    pageTitle: 'NineGrid — 9×9 만다라트 목표 관리 | by VeriQuest',
    pageDescription:
      '태블릿과 PC에 최적화된 9×9 만다라트 보드. 81칸 실시간 연동, 포커스 모드, 달성률 체크, 이미지 저장을 무료로 지원합니다.',
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
    reset: '빈 보드로 초기화',
    undo: '실행 취소',
    redo: '다시 실행',
    eyebrow: '나만의 만다라트 보드',
    headline: '큰 목표를,',
    headlineAccent: '오늘의 한 걸음으로.',
    intro: '가운데 목표에서 시작해 8개의 영역과 작은 실천으로 채워보세요.',
    progressLabel: '전체 달성률',
    completedCount: (count, total) => `완료 ${count} / 작성 ${total}`,
    writtenSummary: (written) => `작성한 실천 ${written}개 · 완료 0개`,
    detailCount: '작성한 실천 기준',
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
    completedDisabled: '실천 내용을 먼저 작성하세요',
    legendCenter: '중심 목표',
    legendLinked: '자동 연동 영역',
    legendAction: '클릭해 실천 완료',
    footerMessage: '작은 실천이 모여, 큰 변화를 만듭니다.',
    footerSupport: '개발자에게 커피 후원하기',
    footerBrand: 'NINEGRID · by VERIQUEST',
    resetConfirm: '모든 칸을 비우고 빈 보드로 초기화할까요?',
    resetSuccess: '빈 보드로 초기화했어요.',
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
    unsavedChanges: '백업하지 않은 변경 사항이 있어요',
    storageNoticeLabel: '데이터 저장 안내',
    storageNotice:
      '보드는 이 브라우저에만 저장돼요. 브라우저 데이터를 지우면 사라지니 중요한 내용은 JSON으로 백업하세요.',
    storageNoticeConfirm: '확인',
    backupReminderLabel: '백업 알림',
    backupReminderNever: '아직 보드를 백업한 적이 없어요. JSON 파일로 백업해 두세요.',
    backupReminderStale: (days) =>
      `마지막 백업 후 ${days}일이 지났고, 백업하지 않은 변경 사항이 있어요.`,
    backupNow: '지금 백업',
    remindLater: '나중에',
    dontShowAgain: '다시 보지 않기',
    installApp: '앱으로 설치',
    updateLabel: '업데이트 알림',
    updateAvailable:
      '새 버전이 있습니다. 새로고침하면 적용되며, 보드 내용은 그대로 남습니다.',
    updateNow: '새로고침',
    offlineReady: '이제 인터넷 연결 없이도 NineGrid를 열 수 있습니다.',
    restoreSuccess: 'JSON 백업을 복원했어요.',
    invalidBackup: '지원하지 않는 백업 파일 형식이에요.',
    restoreError: 'JSON 파일을 복원하지 못했어요.',
    samples: '예시 보드',
    samplesOpen: '샘플 보기',
    samplesHint: '처음이라면 완성된 예시 보드를 보고 시작해 보세요.',
    sampleDialogTitle: '예시 보드 불러오기',
    sampleDialogIntro: '예시를 불러와 구조를 살펴보고, 내용을 고쳐 내 보드로 써 보세요.',
    sampleChoiceLabel: '예시 보드 선택',
    sampleProgress: (completed, total) => `실천 ${total}개 중 ${completed}개 완료`,
    sampleOverwrite: '불러오면 지금 보드의 내용이 예시로 바뀝니다. 불러온 뒤 실행 취소로 되돌릴 수 있어요.',
    sampleEmptyBoard: '빈 보드에 예시 내용을 채웁니다.',
    sampleBackupHint: '백업하지 않은 변경이 있어요. 불러오기 전에 JSON 백업을 받아 두는 것을 권장합니다.',
    sampleBackupFirst: '먼저 백업하기',
    sampleLoad: '불러오기',
    cancel: '취소',
    sampleLoaded: (name) => `'${name}' 예시 보드를 불러왔어요. 실행 취소로 이전 보드로 돌아갈 수 있어요.`,
  },
  en: {
    pageTitle: 'NineGrid — 9×9 Mandalart Goal Planner | by VeriQuest',
    pageDescription:
      'A 9×9 Mandalart goal planner optimized for tablets and desktops. Linked 81 cells, focus mode, progress tracking, and PNG export, all free.',
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
    reset: 'Reset to a blank board',
    undo: 'Undo',
    redo: 'Redo',
    eyebrow: 'YOUR PERSONAL MANDAL-ART',
    headline: 'Dream big,',
    headlineAccent: 'start with one small step.',
    intro: 'Start with your central goal, then fill in eight areas and small actions.',
    progressLabel: 'Overall progress',
    completedCount: (count, total) => `${count} done / ${total} written`,
    writtenSummary: (written) =>
      `${written} ${written === 1 ? 'action' : 'actions'} written · 0 done`,
    detailCount: 'Based on written actions',
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
    completedDisabled: 'Write an action first',
    legendCenter: 'Central goal',
    legendLinked: 'Linked areas',
    legendAction: 'Click to complete an action',
    footerMessage: 'Small steps add up to meaningful change.',
    footerSupport: 'Buy me a coffee',
    footerBrand: 'NINEGRID · by VERIQUEST',
    resetConfirm: 'Clear every cell and reset to a blank board?',
    resetSuccess: 'The board has been reset to blank.',
    saveError: 'Could not save automatically. Check your browser storage.',
    invalidStorage: 'Saved data is invalid. The default board was opened.',
    readStorageError: 'Could not read saved data. The default board was opened.',
    pngNoBoard: 'Could not create an image of the board.',
    pngSuccess: 'Board PNG downloaded.',
    pngError: (message) =>
      message ? `Could not create PNG: ${message}` : 'Could not create PNG.',
    backupSuccess: 'JSON backup downloaded.',
    unsavedChanges: 'You have changes that are not backed up',
    storageNoticeLabel: 'Data storage notice',
    storageNotice:
      'Your board is saved only in this browser. Clearing browser data will erase it, so back up important boards as JSON.',
    storageNoticeConfirm: 'Got it',
    backupReminderLabel: 'Backup reminder',
    backupReminderNever: "You haven't backed up your board yet. Save a JSON backup to keep it safe.",
    backupReminderStale: (days) =>
      `It's been ${days} ${days === 1 ? 'day' : 'days'} since your last backup, and you have unsaved changes.`,
    backupNow: 'Back up now',
    remindLater: 'Later',
    dontShowAgain: "Don't show again",
    installApp: 'Install app',
    updateLabel: 'Update notice',
    updateAvailable:
      'A new version is available. Reload to apply it. Your board will stay as it is.',
    updateNow: 'Reload',
    offlineReady: 'NineGrid now works offline.',
    restoreSuccess: 'JSON backup restored.',
    invalidBackup: 'Unsupported backup file format.',
    restoreError: 'Could not restore the JSON file.',
    samples: 'Sample boards',
    samplesOpen: 'View samples',
    samplesHint: 'New here? Start by looking at a finished sample board.',
    sampleDialogTitle: 'Load a sample board',
    sampleDialogIntro: 'Load a sample to see how a board fits together, then edit it into your own.',
    sampleChoiceLabel: 'Choose a sample board',
    sampleProgress: (completed, total) => `${completed} of ${total} actions done`,
    sampleOverwrite: 'Loading replaces everything on your current board. You can undo it afterwards.',
    sampleEmptyBoard: 'The sample will fill your blank board.',
    sampleBackupHint: 'You have changes that are not backed up. We recommend downloading a JSON backup first.',
    sampleBackupFirst: 'Back up first',
    sampleLoad: 'Load',
    cancel: 'Cancel',
    sampleLoaded: (name) => `Loaded the "${name}" sample. Use Undo to go back to your previous board.`,
  },
  ja: {
    pageTitle: 'NineGrid — 9×9 マンダラート目標計画ボード | by VeriQuest',
    pageDescription:
      'タブレットとPCに最適化された9×9のマンダラートボード。81マスの連動、フォーカス表示、達成率チェック、画像保存を無料で使えます。',
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
    reset: '空のボードにリセット',
    undo: '元に戻す',
    redo: 'やり直す',
    eyebrow: 'あなたのマンダラート',
    headline: '大きな目標を、',
    headlineAccent: '今日の小さな一歩から。',
    intro: '中央の目標から始めて、8つの分野と小さな行動を書き込みましょう。',
    progressLabel: '全体の達成率',
    completedCount: (count, total) => `完了 ${count} / 記入 ${total}`,
    writtenSummary: (written) => `記入した行動 ${written}件 · 完了 0件`,
    detailCount: '記入した行動が基準',
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
    completedDisabled: '先に行動を記入してください',
    legendCenter: '中心目標',
    legendLinked: '自動連動する分野',
    legendAction: 'クリックして完了',
    footerMessage: '小さな行動が集まり、大きな変化になります。',
    footerSupport: '開発者にコーヒーを贈る',
    footerBrand: 'NINEGRID · by VERIQUEST',
    resetConfirm: 'すべてのマスを消して空のボードに戻しますか？',
    resetSuccess: '空のボードに戻しました。',
    saveError: '自動保存できませんでした。ブラウザーの保存容量を確認してください。',
    invalidStorage: '保存データの形式が正しくないため、初期ボードを開きました。',
    readStorageError: '保存データを読み込めないため、初期ボードを開きました。',
    pngNoBoard: 'ボードを画像にできませんでした。',
    pngSuccess: 'ボードのPNG画像を保存しました。',
    pngError: (message) =>
      message ? `PNG画像を作成できませんでした: ${message}` : 'PNG画像を作成できませんでした。',
    backupSuccess: 'JSONバックアップを保存しました。',
    unsavedChanges: 'バックアップしていない変更があります',
    storageNoticeLabel: 'データ保存のお知らせ',
    storageNotice:
      'ボードはこのブラウザにのみ保存されます。ブラウザのデータを消すと失われるため、大切な内容はJSONでバックアップしてください。',
    storageNoticeConfirm: 'OK',
    backupReminderLabel: 'バックアップのお知らせ',
    backupReminderNever: 'まだボードをバックアップしていません。JSONファイルで保存しておきましょう。',
    backupReminderStale: (days) =>
      `前回のバックアップから${days}日が経ち、バックアップしていない変更があります。`,
    backupNow: '今すぐバックアップ',
    remindLater: 'あとで',
    dontShowAgain: '今後表示しない',
    installApp: 'アプリとしてインストール',
    updateLabel: 'アップデートのお知らせ',
    updateAvailable:
      '新しいバージョンがあります。再読み込みすると適用され、ボードの内容はそのまま残ります。',
    updateNow: '再読み込み',
    offlineReady: 'インターネットに接続していなくてもNineGridを開けるようになりました。',
    restoreSuccess: 'JSONバックアップを復元しました。',
    invalidBackup: '対応していないバックアップ形式です。',
    restoreError: 'JSONファイルを復元できませんでした。',
    samples: 'サンプルボード',
    samplesOpen: 'サンプルを見る',
    samplesHint: '初めての方は、完成したサンプルボードを見ながら始めてみましょう。',
    sampleDialogTitle: 'サンプルボードを読み込む',
    sampleDialogIntro: 'サンプルで全体の構成を確かめ、内容を書き換えて自分のボードにできます。',
    sampleChoiceLabel: 'サンプルボードを選択',
    sampleProgress: (completed, total) => `実践 ${total}件中 ${completed}件完了`,
    sampleOverwrite: '読み込むと、今のボードの内容がサンプルに置き換わります。読み込んだ後に元に戻すこともできます。',
    sampleEmptyBoard: '空のボードにサンプルの内容を入れます。',
    sampleBackupHint: 'バックアップしていない変更があります。読み込む前にJSONバックアップをおすすめします。',
    sampleBackupFirst: '先にバックアップ',
    sampleLoad: '読み込む',
    cancel: 'キャンセル',
    sampleLoaded: (name) => `「${name}」のサンプルを読み込みました。元に戻すで前のボードに戻せます。`,
  },
  zh: {
    pageTitle: 'NineGrid — 9×9 九宫格目标计划看板 | by VeriQuest',
    pageDescription:
      '专为平板和电脑优化的 9×9 九宫格目标看板。支持 81 格联动、专注模式、完成率统计和图片保存，完全免费。',
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
    reset: '重置为空白看板',
    undo: '撤销',
    redo: '重做',
    eyebrow: '你的九宫格目标计划',
    headline: '设定远大目标，',
    headlineAccent: '从今天的一小步开始。',
    intro: '从中心目标出发，填写八个领域和每日小行动。',
    progressLabel: '总体完成率',
    completedCount: (count, total) => `完成 ${count} / 已填写 ${total}`,
    writtenSummary: (written) => `已填写 ${written} 项行动 · 完成 0 项`,
    detailCount: '按已填写的行动计算',
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
    completedDisabled: '请先填写行动内容',
    legendCenter: '中心目标',
    legendLinked: '自动关联领域',
    legendAction: '点击标记完成',
    footerMessage: '每一小步，都会汇成大改变。',
    footerSupport: '请开发者喝杯咖啡',
    footerBrand: 'NINEGRID · by VERIQUEST',
    resetConfirm: '要清空所有格子，重置为空白看板吗？',
    resetSuccess: '已重置为空白看板。',
    saveError: '自动保存失败，请检查浏览器存储空间。',
    invalidStorage: '保存的数据格式无效，已打开默认看板。',
    readStorageError: '无法读取保存的数据，已打开默认看板。',
    pngNoBoard: '无法生成看板图片。',
    pngSuccess: '看板 PNG 图片已下载。',
    pngError: (message) =>
      message ? `无法生成 PNG 图片：${message}` : '无法生成 PNG 图片。',
    backupSuccess: 'JSON 备份文件已下载。',
    unsavedChanges: '有尚未备份的更改',
    storageNoticeLabel: '数据存储提示',
    storageNotice:
      '看板只保存在当前浏览器中。清除浏览器数据后将会丢失，重要内容请导出 JSON 备份。',
    storageNoticeConfirm: '知道了',
    backupReminderLabel: '备份提醒',
    backupReminderNever: '你还没有备份过看板。建议导出 JSON 文件保存。',
    backupReminderStale: (days) => `距离上次备份已过 ${days} 天，且有尚未备份的更改。`,
    backupNow: '立即备份',
    remindLater: '稍后',
    dontShowAgain: '不再显示',
    installApp: '安装为应用',
    updateLabel: '更新提示',
    updateAvailable:
      '有新版本可用。重新加载后即可应用，看板内容会保持不变。',
    updateNow: '重新加载',
    offlineReady: '现在无需联网也能打开 NineGrid。',
    restoreSuccess: 'JSON 备份已恢复。',
    invalidBackup: '不支持此备份文件格式。',
    restoreError: '无法恢复 JSON 文件。',
    samples: '示例看板',
    samplesOpen: '查看示例',
    samplesHint: '第一次使用？先看看完整的示例看板吧。',
    sampleDialogTitle: '载入示例看板',
    sampleDialogIntro: '载入示例了解看板结构，再修改成你自己的看板。',
    sampleChoiceLabel: '选择示例看板',
    sampleProgress: (completed, total) => `${total} 项实践中已完成 ${completed} 项`,
    sampleOverwrite: '载入后，当前看板的内容会被示例替换。载入后可以撤销。',
    sampleEmptyBoard: '示例内容将填入空白看板。',
    sampleBackupHint: '有尚未备份的更改。建议载入前先下载 JSON 备份。',
    sampleBackupFirst: '先备份',
    sampleLoad: '载入',
    cancel: '取消',
    sampleLoaded: (name) => `已载入“${name}”示例。可用撤销回到之前的看板。`,
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
