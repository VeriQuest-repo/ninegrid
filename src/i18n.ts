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
  blockProgressTitle: string
  blockProgressHint: string
  blockProgressLabel: (title: string) => string
  blockNoPractice: string
  blockNoPracticeShort: string
  focusBlockProgress: (title: string) => string
  historyTitle: string
  historyRangeLabel: string
  historyRange4w: string
  historyRangeAll: string
  historyEmpty: string
  historySummary: (from: number, to: number, days: number) => string
  historyFirstDay: (value: number) => string
  historyChartLabel: (range: string, from: number, to: number, start: string, end: string) => string
  historyTableCaption: string
  historyDateColumn: string
  historyProgressColumn: string
  historyCountColumn: string
  historyNote: string
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
  completedDisabled: string
  skipToBoard: string
  cellName: (block: number, kind: string) => string
  numberedAction: (number: number) => string
  numberedSubgoal: (number: number) => string
  doneState: string
  notDoneState: string
  markDone: (cell: string) => string
  keyboardHint: (checkShortcut: string, moveShortcut: string) => string
  moveHandle: (cell: string) => string
  moveTitle: string
  moveSource: (cell: string, text: string) => string
  moveBlockLabel: string
  moveTargetLabel: string
  moveEmpty: string
  moveCurrent: string
  moveNote: string
  moveConfirm: string
  cellMoved: (cell: string) => string
  cellSwapped: (cell: string) => string
  dropMove: string
  dropSwap: string
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
  printButton: string
  printDialogIntro: string
  printChoiceLabel: string
  printCurrent: string
  printCurrentDescription: string
  printBlank: string
  printBlankDescription: string
  printDeviceHint: string
  printConfirm: string
  printDate: (date: string) => string
  printDateBlank: string
  moreActions: string
  invalidBackup: string
  restoreError: string
  samples: string
  samplesOpen: string
  samplesHint: string
  sampleDialogTitle: string
  sampleDialogIntro: string
  sampleChoiceLabel: string
  sampleProgress: (completed: number, total: number) => string
  sampleEmptyBoard: string
  sampleLoad: string
  cancel: string
  sampleLoaded: (name: string) => string
  boardsOpen: (name: string) => string
  boardsTitle: string
  boardsIntro: (max: number) => string
  boardListLabel: string
  boardCount: (count: number, max: number) => string
  currentBoardBadge: string
  boardSummary: (progress: number, date: string) => string
  newBoard: string
  defaultBoardName: (number: number) => string
  copyBoardName: (name: string) => string
  currentBoardSection: string
  boardNameLabel: string
  duplicateBoard: string
  exportBoard: string
  deleteBoard: string
  deleteBoardConfirm: (name: string) => string
  lastBoardHint: string
  boardLimit: (max: number) => string
  boardCreated: (name: string) => string
  boardDuplicated: (name: string) => string
  boardDeleted: (name: string) => string
  boardSwitched: (name: string) => string
  boardRenamed: (name: string) => string
  boardBackupSuccess: (name: string) => string
  restoreAllConfirm: (current: number, incoming: number) => string
  restoreAllSuccess: (count: number) => string
  restoreAdded: (name: string) => string
  quotaError: string
  sampleNewBoard: string
  sampleAdded: (name: string) => string
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
    backupDownload: 'JSON 백업 다운로드 (전체 보드)',
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
    blockProgressTitle: '영역별 달성률',
    blockProgressHint: '8개 영역 블록마다 작성한 실천 중 완료한 비율입니다.',
    blockProgressLabel: (title) => `${title} 달성률`,
    blockNoPractice: '아직 작성한 실천이 없어요',
    blockNoPracticeShort: '작성 전',
    focusBlockProgress: (title) => `${title} 블록 달성률`,
    historyTitle: '진척 기록',
    historyRangeLabel: '기간',
    historyRange4w: '최근 4주',
    historyRangeAll: '전체',
    historyEmpty: '실천을 작성하고 체크하면 날짜별 달성률이 여기에 쌓입니다.',
    historySummary: (from, to, days) => `${days}일 동안 ${from}% → ${to}%`,
    historyFirstDay: (value) => `오늘 첫 기록: ${value}%`,
    historyChartLabel: (range, from, to, start, end) =>
      `${range} 달성률 추이 그래프: ${start} ${from}%에서 ${end} ${to}%`,
    historyTableCaption: '날짜별 달성률',
    historyDateColumn: '날짜',
    historyProgressColumn: '달성률',
    historyCountColumn: '완료 / 작성',
    historyNote: '하루에 한 번, 그날의 마지막 값으로 기록됩니다.',
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
    completedDisabled: '실천 내용을 먼저 작성하세요',
    skipToBoard: '보드로 바로 가기',
    cellName: (block, kind) => `${block}번 블록, ${kind}`,
    numberedAction: (number) => `실천 ${number}`,
    numberedSubgoal: (number) => `세부 목표 ${number}`,
    doneState: '완료',
    notDoneState: '미완료',
    markDone: (cell) => `${cell} 완료 표시`,
    keyboardHint: (checkShortcut, moveShortcut) =>
      `키보드: 방향키로 칸 이동 · Tab으로 다음 블록 · ${checkShortcut}로 실천 완료 체크 · ${moveShortcut}로 실천 칸 옮기기`,
    moveHandle: (cell) => `${cell} 옮기기`,
    moveTitle: '다른 칸으로 이동',
    moveSource: (cell, text) => `옮길 칸: ${cell} · ${text}`,
    moveBlockLabel: '옮길 블록',
    moveTargetLabel: '옮길 자리',
    moveEmpty: '빈 칸',
    moveCurrent: '지금 칸',
    moveNote: '내용이 있는 칸을 고르면 두 칸의 자리가 서로 바뀌어요. 실행 취소로 되돌릴 수 있어요.',
    moveConfirm: '옮기기',
    cellMoved: (cell) => `${cell} 자리로 옮겼어요. 실행 취소로 되돌릴 수 있어요.`,
    cellSwapped: (cell) => `${cell} 칸과 자리를 바꿨어요. 실행 취소로 되돌릴 수 있어요.`,
    dropMove: '여기로 이동',
    dropSwap: '자리 바꾸기',
    legendCenter: '중심 목표',
    legendLinked: '자동 연동 영역',
    legendAction: '클릭해 실천 완료',
    footerMessage: '작은 실천이 모여, 큰 변화를 만듭니다.',
    footerSupport: '개발자에게 커피 후원하기',
    footerBrand: 'NINEGRID · by VERIQUEST',
    resetConfirm: '지금 보드의 모든 칸을 비우고 빈 보드로 초기화할까요? 다른 보드는 그대로 남아요.',
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
    backupSuccess: '모든 보드를 JSON 백업 파일로 다운로드했어요.',
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
    printButton: '인쇄 / PDF 저장',
    printDialogIntro:
      'A4 가로 한 장에 전체 보드를 인쇄해요. 인쇄 창에서 대상을 ‘PDF로 저장’으로 고르면 PDF 파일로 저장할 수 있어요.',
    printChoiceLabel: '인쇄할 내용',
    printCurrent: '현재 보드',
    printCurrentDescription: '작성한 내용과 완료 체크를 함께 인쇄해요. 포커스 모드에서도 전체 보드가 인쇄돼요.',
    printBlank: '빈 양식',
    printBlankDescription: '칸만 인쇄해서 손으로 채워 쓸 수 있어요.',
    printDeviceHint: '인쇄가 지원되지 않는 기기에서는 이미지 저장을 이용해 주세요.',
    printConfirm: '인쇄하기',
    printDate: (date) => `인쇄일 ${date}`,
    printDateBlank: '날짜: ____________',
    moreActions: '더보기',
    invalidBackup: '지원하지 않는 백업 파일 형식이에요.',
    restoreError: 'JSON 파일을 복원하지 못했어요.',
    samples: '예시 보드',
    samplesOpen: '샘플 보기',
    samplesHint: '처음이라면 완성된 예시 보드를 보고 시작해 보세요.',
    sampleDialogTitle: '예시 보드 불러오기',
    sampleDialogIntro: '예시를 불러와 구조를 살펴보고, 내용을 고쳐 내 보드로 써 보세요.',
    sampleChoiceLabel: '예시 보드 선택',
    sampleProgress: (completed, total) => `실천 ${total}개 중 ${completed}개 완료`,
    sampleEmptyBoard: '빈 보드에 예시 내용을 채웁니다.',
    sampleLoad: '불러오기',
    cancel: '취소',
    sampleLoaded: (name) => `'${name}' 예시 보드를 불러왔어요. 실행 취소로 이전 보드로 돌아갈 수 있어요.`,
    boardsOpen: (name) => `보드 목록 열기, 지금 보드: ${name}`,
    boardsTitle: '내 보드',
    boardsIntro: (max) => `연도별·주제별로 보드를 나눠 쓸 수 있어요. 최대 ${max}개까지 만들 수 있어요.`,
    boardListLabel: '보드 목록',
    boardCount: (count, max) => `${count} / ${max}`,
    currentBoardBadge: '지금 보드',
    boardSummary: (progress, date) => `달성률 ${progress}% · ${date} 수정`,
    newBoard: '새 보드',
    defaultBoardName: (number) => `보드 ${number}`,
    copyBoardName: (name) => `${name} 사본`,
    currentBoardSection: '지금 보드 관리',
    boardNameLabel: '보드 이름',
    duplicateBoard: '복제',
    exportBoard: '이 보드만 백업',
    deleteBoard: '삭제',
    deleteBoardConfirm: (name) => `'${name}' 보드를 삭제할까요? 삭제한 보드는 되돌릴 수 없어요.`,
    lastBoardHint: '보드가 하나뿐이라 삭제할 수 없어요.',
    boardLimit: (max) => `보드는 최대 ${max}개까지 만들 수 있어요. 쓰지 않는 보드를 삭제해 주세요.`,
    boardCreated: (name) => `'${name}' 보드를 만들었어요.`,
    boardDuplicated: (name) => `'${name}' 보드를 만들었어요.`,
    boardDeleted: (name) => `'${name}' 보드를 삭제했어요.`,
    boardSwitched: (name) => `'${name}' 보드를 열었어요.`,
    boardRenamed: (name) => `보드 이름을 '${name}'(으)로 바꿨어요.`,
    boardBackupSuccess: (name) => `'${name}' 보드를 JSON 파일로 다운로드했어요.`,
    restoreAllConfirm: (current, incoming) =>
      `지금 있는 보드 ${current}개를 백업 파일의 보드 ${incoming}개로 바꿀까요? 지금 보드는 모두 사라지고 실행 취소할 수 없어요.`,
    restoreAllSuccess: (count) => `JSON 백업의 보드 ${count}개를 모두 복원했어요.`,
    restoreAdded: (name) => `백업 파일의 보드를 '${name}' 새 보드로 추가했어요.`,
    quotaError:
      '브라우저 저장 공간이 가득 차서 저장하지 못했어요. 쓰지 않는 보드를 삭제하고, JSON 백업을 받아 두세요.',
    sampleNewBoard: '예시는 새 보드로 추가돼요. 지금 보드는 그대로 남아요.',
    sampleAdded: (name) => `'${name}' 예시를 새 보드로 추가했어요.`,
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
    backupDownload: 'Download JSON backup (all boards)',
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
    blockProgressTitle: 'Progress by area',
    blockProgressHint: 'Share of written actions completed in each of the 8 area blocks.',
    blockProgressLabel: (title) => `${title} progress`,
    blockNoPractice: 'No actions written yet',
    blockNoPracticeShort: 'Not started',
    focusBlockProgress: (title) => `${title} block progress`,
    historyTitle: 'Progress history',
    historyRangeLabel: 'Range',
    historyRange4w: 'Last 4 weeks',
    historyRangeAll: 'All',
    historyEmpty: 'Write and check off actions, and your daily progress will build up here.',
    historySummary: (from, to, days) => `${from}% → ${to}% over ${days} ${days === 1 ? 'day' : 'days'}`,
    historyFirstDay: (value) => `First record today: ${value}%`,
    historyChartLabel: (range, from, to, start, end) =>
      `Progress trend, ${range}: from ${from}% on ${start} to ${to}% on ${end}`,
    historyTableCaption: 'Progress by date',
    historyDateColumn: 'Date',
    historyProgressColumn: 'Progress',
    historyCountColumn: 'Done / written',
    historyNote: 'Recorded once a day with that day’s last value.',
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
    completedDisabled: 'Write an action first',
    skipToBoard: 'Skip to board',
    cellName: (block, kind) => `Block ${block}, ${kind}`,
    numberedAction: (number) => `action ${number}`,
    numberedSubgoal: (number) => `subgoal ${number}`,
    doneState: 'done',
    notDoneState: 'not done',
    markDone: (cell) => `Mark ${cell} as done`,
    keyboardHint: (checkShortcut, moveShortcut) =>
      `Keyboard: arrow keys move between cells · Tab goes to the next block · ${checkShortcut} checks off an action · ${moveShortcut} moves an action`,
    moveHandle: (cell) => `Move ${cell}`,
    moveTitle: 'Move to another cell',
    moveSource: (cell, text) => `Moving: ${cell} · ${text}`,
    moveBlockLabel: 'Block',
    moveTargetLabel: 'New position',
    moveEmpty: 'Empty',
    moveCurrent: 'Current cell',
    moveNote: 'If you pick a cell that already has an action, the two cells swap places. You can undo this.',
    moveConfirm: 'Move',
    cellMoved: (cell) => `Moved to ${cell}. You can undo this.`,
    cellSwapped: (cell) => `Swapped places with ${cell}. You can undo this.`,
    dropMove: 'Move here',
    dropSwap: 'Swap',
    legendCenter: 'Central goal',
    legendLinked: 'Linked areas',
    legendAction: 'Click to complete an action',
    footerMessage: 'Small steps add up to meaningful change.',
    footerSupport: 'Buy me a coffee',
    footerBrand: 'NINEGRID · by VERIQUEST',
    resetConfirm: 'Clear every cell on the current board and reset it to blank? Your other boards stay as they are.',
    resetSuccess: 'The board has been reset to blank.',
    saveError: 'Could not save automatically. Check your browser storage.',
    invalidStorage: 'Saved data is invalid. The default board was opened.',
    readStorageError: 'Could not read saved data. The default board was opened.',
    pngNoBoard: 'Could not create an image of the board.',
    pngSuccess: 'Board PNG downloaded.',
    pngError: (message) =>
      message ? `Could not create PNG: ${message}` : 'Could not create PNG.',
    backupSuccess: 'Downloaded a JSON backup of all boards.',
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
    printButton: 'Print / Save as PDF',
    printDialogIntro:
      'Prints the whole board on one landscape A4 page. To get a PDF, choose “Save as PDF” as the destination in the print window.',
    printChoiceLabel: 'What to print',
    printCurrent: 'Current board',
    printCurrentDescription:
      'Prints your text and completed checks. The whole board is printed even in focus mode.',
    printBlank: 'Blank template',
    printBlankDescription: 'Prints empty cells so you can fill them in by hand.',
    printDeviceHint: "If your device can't print, use image download instead.",
    printConfirm: 'Print',
    printDate: (date) => `Printed on ${date}`,
    printDateBlank: 'Date: ____________',
    moreActions: 'More',
    invalidBackup: 'Unsupported backup file format.',
    restoreError: 'Could not restore the JSON file.',
    samples: 'Sample boards',
    samplesOpen: 'View samples',
    samplesHint: 'New here? Start by looking at a finished sample board.',
    sampleDialogTitle: 'Load a sample board',
    sampleDialogIntro: 'Load a sample to see how a board fits together, then edit it into your own.',
    sampleChoiceLabel: 'Choose a sample board',
    sampleProgress: (completed, total) => `${completed} of ${total} actions done`,
    sampleEmptyBoard: 'The sample will fill your blank board.',
    sampleLoad: 'Load',
    cancel: 'Cancel',
    sampleLoaded: (name) => `Loaded the "${name}" sample. Use Undo to go back to your previous board.`,
    boardsOpen: (name) => `Open board list, current board: ${name}`,
    boardsTitle: 'My boards',
    boardsIntro: (max) => `Keep separate boards for each year or topic. You can have up to ${max} boards.`,
    boardListLabel: 'Board list',
    boardCount: (count, max) => `${count} / ${max}`,
    currentBoardBadge: 'Current',
    boardSummary: (progress, date) => `${progress}% done · edited ${date}`,
    newBoard: 'New board',
    defaultBoardName: (number) => `Board ${number}`,
    copyBoardName: (name) => `${name} copy`,
    currentBoardSection: 'Manage current board',
    boardNameLabel: 'Board name',
    duplicateBoard: 'Duplicate',
    exportBoard: 'Back up this board only',
    deleteBoard: 'Delete',
    deleteBoardConfirm: (name) => `Delete the "${name}" board? A deleted board can't be restored.`,
    lastBoardHint: "This is your only board, so it can't be deleted.",
    boardLimit: (max) => `You can have up to ${max} boards. Delete a board you no longer use.`,
    boardCreated: (name) => `Created the "${name}" board.`,
    boardDuplicated: (name) => `Created the "${name}" board.`,
    boardDeleted: (name) => `Deleted the "${name}" board.`,
    boardSwitched: (name) => `Opened the "${name}" board.`,
    boardRenamed: (name) => `Renamed the board to "${name}".`,
    boardBackupSuccess: (name) => `Downloaded the "${name}" board as a JSON file.`,
    restoreAllConfirm: (current, incoming) =>
      `Replace your ${current} ${current === 1 ? 'board' : 'boards'} with the ${incoming} ${incoming === 1 ? 'board' : 'boards'} in this backup? Your current boards will be removed, and this can't be undone.`,
    restoreAllSuccess: (count) => `Restored all ${count} ${count === 1 ? 'board' : 'boards'} from the JSON backup.`,
    restoreAdded: (name) => `Added the backup as a new board, "${name}".`,
    quotaError:
      "Couldn't save because browser storage is full. Delete boards you no longer use and download a JSON backup.",
    sampleNewBoard: 'The sample is added as a new board. Your current board stays as it is.',
    sampleAdded: (name) => `Added the "${name}" sample as a new board.`,
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
    backupDownload: 'JSONバックアップを保存（全ボード）',
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
    blockProgressTitle: 'エリア別の達成率',
    blockProgressHint: '8つのエリアブロックごとに、記入した行動のうち完了した割合です。',
    blockProgressLabel: (title) => `${title}の達成率`,
    blockNoPractice: 'まだ記入した行動がありません',
    blockNoPracticeShort: '未記入',
    focusBlockProgress: (title) => `${title}ブロックの達成率`,
    historyTitle: '進捗の記録',
    historyRangeLabel: '期間',
    historyRange4w: '直近4週間',
    historyRangeAll: 'すべて',
    historyEmpty: '行動を記入してチェックすると、日ごとの達成率がここにたまります。',
    historySummary: (from, to, days) => `${days}日間で ${from}% → ${to}%`,
    historyFirstDay: (value) => `今日の最初の記録: ${value}%`,
    historyChartLabel: (range, from, to, start, end) =>
      `${range}の達成率の推移グラフ: ${start} ${from}% から ${end} ${to}%`,
    historyTableCaption: '日付別の達成率',
    historyDateColumn: '日付',
    historyProgressColumn: '達成率',
    historyCountColumn: '完了 / 記入',
    historyNote: '1日1回、その日の最後の値で記録されます。',
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
    completedDisabled: '先に行動を記入してください',
    skipToBoard: 'ボードへ移動',
    cellName: (block, kind) => `${block}番ブロック、${kind}`,
    numberedAction: (number) => `行動 ${number}`,
    numberedSubgoal: (number) => `小目標 ${number}`,
    doneState: '完了',
    notDoneState: '未完了',
    markDone: (cell) => `${cell}を完了にする`,
    keyboardHint: (checkShortcut, moveShortcut) =>
      `キーボード: 矢印キーでマスを移動 · Tabで次のブロック · ${checkShortcut}で行動を完了 · ${moveShortcut}で行動マスを移動`,
    moveHandle: (cell) => `${cell}を移動`,
    moveTitle: '別のマスへ移動',
    moveSource: (cell, text) => `移動するマス: ${cell} · ${text}`,
    moveBlockLabel: '移動先のブロック',
    moveTargetLabel: '移動先の位置',
    moveEmpty: '空のマス',
    moveCurrent: '今のマス',
    moveNote: '内容があるマスを選ぶと、2つのマスの位置が入れ替わります。元に戻すで取り消せます。',
    moveConfirm: '移動',
    cellMoved: (cell) => `${cell}へ移動しました。元に戻すで取り消せます。`,
    cellSwapped: (cell) => `${cell}と位置を入れ替えました。元に戻すで取り消せます。`,
    dropMove: 'ここへ移動',
    dropSwap: '入れ替え',
    legendCenter: '中心目標',
    legendLinked: '自動連動する分野',
    legendAction: 'クリックして完了',
    footerMessage: '小さな行動が集まり、大きな変化になります。',
    footerSupport: '開発者にコーヒーを贈る',
    footerBrand: 'NINEGRID · by VERIQUEST',
    resetConfirm: '表示中のボードのマスをすべて消して空に戻しますか？ほかのボードはそのまま残ります。',
    resetSuccess: '空のボードに戻しました。',
    saveError: '自動保存できませんでした。ブラウザーの保存容量を確認してください。',
    invalidStorage: '保存データの形式が正しくないため、初期ボードを開きました。',
    readStorageError: '保存データを読み込めないため、初期ボードを開きました。',
    pngNoBoard: 'ボードを画像にできませんでした。',
    pngSuccess: 'ボードのPNG画像を保存しました。',
    pngError: (message) =>
      message ? `PNG画像を作成できませんでした: ${message}` : 'PNG画像を作成できませんでした。',
    backupSuccess: 'すべてのボードをJSONバックアップとして保存しました。',
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
    printButton: '印刷 / PDF保存',
    printDialogIntro: 'A4横向き1枚にボード全体を印刷します。印刷画面で送信先を「PDFに保存」にするとPDFファイルとして保存できます。',
    printChoiceLabel: '印刷する内容',
    printCurrent: '現在のボード',
    printCurrentDescription: '入力した内容と完了チェックを一緒に印刷します。フォーカスモードでもボード全体が印刷されます。',
    printBlank: '空のテンプレート',
    printBlankDescription: 'マスだけを印刷して、手書きで埋められます。',
    printDeviceHint: '印刷に対応していない端末では、画像保存をご利用ください。',
    printConfirm: '印刷する',
    printDate: (date) => `印刷日 ${date}`,
    printDateBlank: '日付: ____________',
    moreActions: 'その他',
    invalidBackup: '対応していないバックアップ形式です。',
    restoreError: 'JSONファイルを復元できませんでした。',
    samples: 'サンプルボード',
    samplesOpen: 'サンプルを見る',
    samplesHint: '初めての方は、完成したサンプルボードを見ながら始めてみましょう。',
    sampleDialogTitle: 'サンプルボードを読み込む',
    sampleDialogIntro: 'サンプルで全体の構成を確かめ、内容を書き換えて自分のボードにできます。',
    sampleChoiceLabel: 'サンプルボードを選択',
    sampleProgress: (completed, total) => `実践 ${total}件中 ${completed}件完了`,
    sampleEmptyBoard: '空のボードにサンプルの内容を入れます。',
    sampleLoad: '読み込む',
    cancel: 'キャンセル',
    sampleLoaded: (name) => `「${name}」のサンプルを読み込みました。元に戻すで前のボードに戻せます。`,
    boardsOpen: (name) => `ボード一覧を開く、現在のボード: ${name}`,
    boardsTitle: 'マイボード',
    boardsIntro: (max) => `年ごと・テーマごとにボードを分けて使えます。最大${max}個まで作れます。`,
    boardListLabel: 'ボード一覧',
    boardCount: (count, max) => `${count} / ${max}`,
    currentBoardBadge: '表示中',
    boardSummary: (progress, date) => `達成率 ${progress}% · ${date} 更新`,
    newBoard: '新しいボード',
    defaultBoardName: (number) => `ボード ${number}`,
    copyBoardName: (name) => `${name} のコピー`,
    currentBoardSection: '表示中のボードを管理',
    boardNameLabel: 'ボード名',
    duplicateBoard: '複製',
    exportBoard: 'このボードだけバックアップ',
    deleteBoard: '削除',
    deleteBoardConfirm: (name) => `「${name}」ボードを削除しますか？削除したボードは元に戻せません。`,
    lastBoardHint: 'ボードが1つしかないため削除できません。',
    boardLimit: (max) => `ボードは最大${max}個まで作れます。使っていないボードを削除してください。`,
    boardCreated: (name) => `「${name}」ボードを作成しました。`,
    boardDuplicated: (name) => `「${name}」ボードを作成しました。`,
    boardDeleted: (name) => `「${name}」ボードを削除しました。`,
    boardSwitched: (name) => `「${name}」ボードを開きました。`,
    boardRenamed: (name) => `ボード名を「${name}」に変更しました。`,
    boardBackupSuccess: (name) => `「${name}」ボードをJSONファイルでダウンロードしました。`,
    restoreAllConfirm: (current, incoming) =>
      `今ある${current}個のボードを、バックアップファイルの${incoming}個のボードに置き換えますか？今のボードはすべて消え、元に戻せません。`,
    restoreAllSuccess: (count) => `JSONバックアップの${count}個のボードをすべて復元しました。`,
    restoreAdded: (name) => `バックアップを新しいボード「${name}」として追加しました。`,
    quotaError:
      'ブラウザの保存容量がいっぱいで保存できませんでした。使っていないボードを削除し、JSONバックアップを取っておいてください。',
    sampleNewBoard: 'サンプルは新しいボードとして追加されます。今のボードはそのまま残ります。',
    sampleAdded: (name) => `「${name}」のサンプルを新しいボードとして追加しました。`,
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
    backupDownload: '下载 JSON 备份（全部看板）',
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
    blockProgressTitle: '各领域完成率',
    blockProgressHint: '8 个领域区块中，已填写行动的完成比例。',
    blockProgressLabel: (title) => `${title}完成率`,
    blockNoPractice: '还没有填写行动',
    blockNoPracticeShort: '未填写',
    focusBlockProgress: (title) => `${title}区块完成率`,
    historyTitle: '进度记录',
    historyRangeLabel: '时间范围',
    historyRange4w: '最近 4 周',
    historyRangeAll: '全部',
    historyEmpty: '填写并勾选行动后，每天的完成率会记录在这里。',
    historySummary: (from, to, days) => `${days} 天内 ${from}% → ${to}%`,
    historyFirstDay: (value) => `今天的第一条记录：${value}%`,
    historyChartLabel: (range, from, to, start, end) =>
      `${range}完成率趋势图：从 ${start} 的 ${from}% 到 ${end} 的 ${to}%`,
    historyTableCaption: '每日完成率',
    historyDateColumn: '日期',
    historyProgressColumn: '完成率',
    historyCountColumn: '完成 / 已填写',
    historyNote: '每天记录一次，取当天最后的数值。',
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
    completedDisabled: '请先填写行动内容',
    skipToBoard: '跳到九宫格',
    cellName: (block, kind) => `第 ${block} 个区块，${kind}`,
    numberedAction: (number) => `行动 ${number}`,
    numberedSubgoal: (number) => `子目标 ${number}`,
    doneState: '已完成',
    notDoneState: '未完成',
    markDone: (cell) => `将${cell}标记为已完成`,
    keyboardHint: (checkShortcut, moveShortcut) =>
      `键盘：方向键在格子间移动 · Tab 切换到下一个区块 · ${checkShortcut} 标记行动完成 · ${moveShortcut} 移动行动格`,
    moveHandle: (cell) => `移动${cell}`,
    moveTitle: '移动到其他格子',
    moveSource: (cell, text) => `要移动的格子：${cell} · ${text}`,
    moveBlockLabel: '目标区块',
    moveTargetLabel: '目标位置',
    moveEmpty: '空格',
    moveCurrent: '当前格子',
    moveNote: '如果选择已有内容的格子，两个格子会互换位置。可以撤销。',
    moveConfirm: '移动',
    cellMoved: (cell) => `已移动到${cell}。可以撤销。`,
    cellSwapped: (cell) => `已与${cell}互换位置。可以撤销。`,
    dropMove: '移到这里',
    dropSwap: '互换',
    legendCenter: '中心目标',
    legendLinked: '自动关联领域',
    legendAction: '点击标记完成',
    footerMessage: '每一小步，都会汇成大改变。',
    footerSupport: '请开发者喝杯咖啡',
    footerBrand: 'NINEGRID · by VERIQUEST',
    resetConfirm: '要清空当前看板的所有格子，重置为空白看板吗？其他看板保持不变。',
    resetSuccess: '已重置为空白看板。',
    saveError: '自动保存失败，请检查浏览器存储空间。',
    invalidStorage: '保存的数据格式无效，已打开默认看板。',
    readStorageError: '无法读取保存的数据，已打开默认看板。',
    pngNoBoard: '无法生成看板图片。',
    pngSuccess: '看板 PNG 图片已下载。',
    pngError: (message) =>
      message ? `无法生成 PNG 图片：${message}` : '无法生成 PNG 图片。',
    backupSuccess: '已下载全部看板的 JSON 备份。',
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
    printButton: '打印 / 保存为 PDF',
    printDialogIntro: '在一张横向 A4 纸上打印整个看板。在打印窗口中将目标选为“另存为 PDF”即可保存为 PDF 文件。',
    printChoiceLabel: '打印内容',
    printCurrent: '当前看板',
    printCurrentDescription: '同时打印填写的内容和完成勾选。即使在专注模式下也会打印整个看板。',
    printBlank: '空白模板',
    printBlankDescription: '只打印格子，可以手写填写。',
    printDeviceHint: '如果设备不支持打印，请使用保存图片。',
    printConfirm: '打印',
    printDate: (date) => `打印日期 ${date}`,
    printDateBlank: '日期：____________',
    moreActions: '更多',
    invalidBackup: '不支持此备份文件格式。',
    restoreError: '无法恢复 JSON 文件。',
    samples: '示例看板',
    samplesOpen: '查看示例',
    samplesHint: '第一次使用？先看看完整的示例看板吧。',
    sampleDialogTitle: '载入示例看板',
    sampleDialogIntro: '载入示例了解看板结构，再修改成你自己的看板。',
    sampleChoiceLabel: '选择示例看板',
    sampleProgress: (completed, total) => `${total} 项实践中已完成 ${completed} 项`,
    sampleEmptyBoard: '示例内容将填入空白看板。',
    sampleLoad: '载入',
    cancel: '取消',
    sampleLoaded: (name) => `已载入“${name}”示例。可用撤销回到之前的看板。`,
    boardsOpen: (name) => `打开看板列表，当前看板：${name}`,
    boardsTitle: '我的看板',
    boardsIntro: (max) => `可以按年份或主题分开使用看板，最多可创建 ${max} 个。`,
    boardListLabel: '看板列表',
    boardCount: (count, max) => `${count} / ${max}`,
    currentBoardBadge: '当前',
    boardSummary: (progress, date) => `达成率 ${progress}% · ${date} 修改`,
    newBoard: '新建看板',
    defaultBoardName: (number) => `看板 ${number}`,
    copyBoardName: (name) => `${name} 副本`,
    currentBoardSection: '管理当前看板',
    boardNameLabel: '看板名称',
    duplicateBoard: '复制',
    exportBoard: '仅备份此看板',
    deleteBoard: '删除',
    deleteBoardConfirm: (name) => `要删除“${name}”看板吗？删除后无法恢复。`,
    lastBoardHint: '只有一个看板，无法删除。',
    boardLimit: (max) => `最多可创建 ${max} 个看板。请删除不再使用的看板。`,
    boardCreated: (name) => `已创建“${name}”看板。`,
    boardDuplicated: (name) => `已创建“${name}”看板。`,
    boardDeleted: (name) => `已删除“${name}”看板。`,
    boardSwitched: (name) => `已打开“${name}”看板。`,
    boardRenamed: (name) => `看板已重命名为“${name}”。`,
    boardBackupSuccess: (name) => `已将“${name}”看板下载为 JSON 文件。`,
    restoreAllConfirm: (current, incoming) =>
      `要用备份文件中的 ${incoming} 个看板替换现有的 ${current} 个看板吗？现有看板将全部删除，且无法撤销。`,
    restoreAllSuccess: (count) => `已从 JSON 备份恢复全部 ${count} 个看板。`,
    restoreAdded: (name) => `已将备份添加为新看板“${name}”。`,
    quotaError: '浏览器存储空间已满，无法保存。请删除不再使用的看板，并下载 JSON 备份。',
    sampleNewBoard: '示例将作为新看板添加，当前看板保持不变。',
    sampleAdded: (name) => `已将“${name}”示例添加为新看板。`,
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
