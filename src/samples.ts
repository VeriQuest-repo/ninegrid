// 처음 쓰는 사용자를 위한 예시(샘플) 보드. (#7)
// 샘플은 JSON 백업과 같은 형식(format: 'ninegrid-backup', version: 1)으로 만들어
// parseBackup → normalizeCells를 거쳐 불러온다. 백업 복원과 같은 검증 경로를 쓴다.
// 데이터는 다국어 문구(i18n.ts)와 분리해 이 파일에서 관리한다.
import {
  CENTER_CELL,
  createInitialCells,
  parseBackup,
  type BoardCell,
} from './board'
import type { Language } from './i18n'

export const SAMPLE_IDS = ['health', 'study', 'career'] as const
export type SampleId = (typeof SAMPLE_IDS)[number]

// [영역 제목, 실천 8개]
type AreaRow = [string, string, string, string, string, string, string, string, string]

type SampleContent = {
  name: string
  description: string
  hub: string
  areas: AreaRow[]
}

type SampleDefinition = {
  // 영역별로 완료 표시할 실천 칸 순서(0~7). 언어와 관계없이 같은 달성률이 나오도록 공유한다.
  done: number[][]
  content: Record<Language, SampleContent>
}

// 중앙 블록의 하위 목표 칸(영역 1~8)과, 각 영역이 이어지는 바깥 블록 번호
export const SUBGOAL_CELLS = [30, 31, 32, 39, 41, 48, 49, 50]
const OUTER_BLOCKS = [0, 1, 2, 3, 5, 6, 7, 8]

const SAMPLES: Record<SampleId, SampleDefinition> = {
  health: {
    done: [[0, 1, 3, 6], [0, 1], [1, 2, 3], [0, 4], [1], [0, 3, 5], [0, 3], [1, 4]],
    content: {
      ko: {
        name: '건강',
        description: '운동·식습관·수면 등 몸과 마음을 돌보는 습관',
        hub: '건강한 몸과 마음',
        areas: [
          ['운동', '주 3회 30분 걷기', '계단 이용하기', '주말 등산', '아침 스트레칭 10분', '스쿼트 20개', '자전거로 출근', '운동 기록 남기기', '한 달 한 번 새 운동'],
          ['식습관', '아침 거르지 않기', '물 하루 8잔', '매 끼니 채소', '야식 줄이기', '단 음료 줄이기', '천천히 씹어 먹기', '주 3회 집밥', '간식은 과일로'],
          ['수면', '12시 전 잠들기', '7시간 이상 자기', '자기 전 휴대폰 끄기', '같은 시간에 일어나기', '오후 커피 끊기', '침실 어둡게', '낮잠 20분 이내', '수면 기록'],
          ['마음 건강', '하루 5분 명상', '감사 일기', '걱정 적어 보기', '주 1회 생각 정리 산책', '좋아하는 음악 듣기', '혼자만의 시간', '힘들면 도움 요청', '나를 한 번 칭찬하기'],
          ['체력', '플랭크 1분', '팔굽혀펴기 10개', '5km 달리기 도전', '줄넘기 300개', '코어 운동', '유연성 운동', '분기마다 체력 측정', '근력 운동 주 2회'],
          ['생활 습관', '1시간마다 일어나기', '바른 자세', '화면 시간 줄이기', '술 마시지 않는 날', '손 자주 씻기', '햇볕 15분 쬐기', '정리정돈', '식사 시간 지키기'],
          ['건강 관리', '연 1회 건강검진', '치과 정기 검진', '혈압 확인', '주 1회 체중 기록', '영양제 챙기기', '눈 쉬게 하기', '예방접종 확인', '병원 미루지 않기'],
          ['휴식', '주 1회 완전한 휴식일', '취미에 1시간', '따뜻한 반신욕', '주말 디지털 디톡스', '공원 산책', '퇴근 후 업무 알림 끄기', '계절마다 짧은 여행', '친구와 수다'],
        ],
      },
      en: {
        name: 'Health',
        description: 'Habits for body and mind: exercise, eating, sleep, and more',
        hub: 'A healthy body and mind',
        areas: [
          ['Exercise', 'Walk 30 min, 3x a week', 'Take the stairs', 'Weekend hike', '10-min morning stretch', '20 squats', 'Bike to work', 'Log workouts', 'Try a new sport monthly'],
          ['Eating', 'Never skip breakfast', '8 glasses of water', 'Veggies every meal', 'Fewer late-night snacks', 'Cut sugary drinks', 'Eat slowly', 'Cook at home 3x a week', 'Fruit for snacks'],
          ['Sleep', 'Asleep before midnight', '7+ hours of sleep', 'Phone off before bed', 'Wake at the same time', 'No coffee after noon', 'Keep the bedroom dark', 'Naps under 20 min', 'Track sleep'],
          ['Mind', '5-min daily meditation', 'Gratitude journal', 'Write down worries', 'Weekly thinking walk', 'Listen to favorite music', 'Time alone', 'Ask for help when needed', 'Praise myself once a day'],
          ['Fitness', '1-min plank', '10 push-ups', 'Try a 5K run', '300 jump-rope skips', 'Core workout', 'Flexibility training', 'Fitness check each quarter', 'Strength training 2x a week'],
          ['Daily habits', 'Stand up every hour', 'Good posture', 'Less screen time', 'Alcohol-free days', 'Wash hands often', '15 min of sunlight', 'Keep things tidy', 'Regular mealtimes'],
          ['Checkups', 'Yearly health checkup', 'Regular dental visits', 'Check blood pressure', 'Weekly weight log', 'Take supplements', 'Rest my eyes', 'Check vaccinations', "Don't put off the doctor"],
          ['Rest', 'One full rest day a week', 'An hour for hobbies', 'Warm bath', 'Weekend digital detox', 'Walk in the park', 'Mute work alerts after hours', 'A short trip each season', 'Chat with friends'],
        ],
      },
      ja: {
        name: '健康',
        description: '運動・食事・睡眠など心身を整える習慣',
        hub: '健康な体と心',
        areas: [
          ['運動', '週3回30分歩く', '階段を使う', '週末に山歩き', '朝のストレッチ10分', 'スクワット20回', '自転車で通勤', '運動を記録', '月1回新しい運動'],
          ['食習慣', '朝食を抜かない', '水を1日8杯', '毎食野菜を', '夜食を減らす', '甘い飲み物を減らす', 'よく噛んで食べる', '週3回自炊', '間食は果物に'],
          ['睡眠', '0時前に寝る', '7時間以上眠る', '寝る前はスマホオフ', '同じ時間に起きる', '午後はコーヒーなし', '寝室を暗く', '昼寝は20分以内', '睡眠を記録'],
          ['心の健康', '1日5分の瞑想', '感謝日記', '心配ごとを書き出す', '週1回考えごと散歩', '好きな音楽を聴く', '一人の時間', 'つらい時は相談', '自分をひとつ褒める'],
          ['体力', 'プランク1分', '腕立て10回', '5km走に挑戦', '縄跳び300回', '体幹トレーニング', '柔軟運動', '季節ごとに体力測定', '筋トレ週2回'],
          ['生活習慣', '1時間ごとに立つ', '正しい姿勢', '画面時間を減らす', '休肝日をつくる', 'こまめに手洗い', '日光を15分', '整理整頓', '食事の時間を一定に'],
          ['健康管理', '年1回健康診断', '歯科の定期検診', '血圧チェック', '週1回体重記録', 'サプリを忘れずに', '目を休める', '予防接種の確認', '受診を先延ばししない'],
          ['休息', '週1回の完全休養日', '趣味に1時間', 'ぬるめのお風呂', '週末デジタルデトックス', '公園を散歩', '退勤後は通知オフ', '季節ごとに小旅行', '友人とおしゃべり'],
        ],
      },
      zh: {
        name: '健康',
        description: '运动、饮食、睡眠等照顾身心的习惯',
        hub: '健康的身心',
        areas: [
          ['运动', '每周3次步行30分钟', '走楼梯', '周末爬山', '晨间拉伸10分钟', '深蹲20个', '骑车上班', '记录运动', '每月尝试新运动'],
          ['饮食', '不跳过早餐', '每天8杯水', '每餐有蔬菜', '少吃夜宵', '少喝甜饮料', '细嚼慢咽', '每周3次自己做饭', '零食换成水果'],
          ['睡眠', '12点前入睡', '睡够7小时', '睡前关手机', '固定时间起床', '下午不喝咖啡', '卧室保持黑暗', '午睡不超过20分钟', '记录睡眠'],
          ['心理健康', '每天冥想5分钟', '感恩日记', '写下烦恼', '每周散步整理思绪', '听喜欢的音乐', '独处时间', '难受时寻求帮助', '每天夸自己一句'],
          ['体能', '平板支撑1分钟', '俯卧撑10个', '挑战5公里跑', '跳绳300下', '核心训练', '柔韧训练', '每季度测体能', '每周2次力量训练'],
          ['生活习惯', '每小时起身活动', '保持正确坐姿', '减少屏幕时间', '设定不喝酒日', '勤洗手', '晒太阳15分钟', '整理房间', '按时吃饭'],
          ['健康管理', '每年体检', '定期看牙医', '测量血压', '每周记录体重', '按时吃营养剂', '让眼睛休息', '确认疫苗接种', '不拖延就医'],
          ['休息', '每周一天完全休息', '留1小时给爱好', '泡个热水澡', '周末数字排毒', '去公园散步', '下班后关闭工作通知', '每季度短途旅行', '和朋友聊天'],
        ],
      },
    },
  },
  study: {
    done: [[0, 1, 2], [0, 5], [0, 1], [0], [0, 1], [0], [0, 1, 3], []],
    content: {
      ko: {
        name: '학습',
        description: '새 외국어를 단어·듣기·말하기부터 꾸준히',
        hub: '새 외국어 배우기',
        areas: [
          ['단어', '하루 단어 10개', '단어장 앱으로 복습', '예문과 함께 외우기', '주말에 모아서 복습', '헷갈린 단어 표시', '집 안 물건에 이름표', '주제별로 묶기', '한 달 300단어 점검'],
          ['듣기', '출근길 팟캐스트', '자막 없이 영상 1편', '받아쓰기 5문장', '좋아하는 노래 따라 부르기', '짧은 뉴스 한 꼭지', '같은 음원 반복 듣기', '1.25배속 도전', '모르는 표현 메모'],
          ['말하기', '하루 5분 소리 내 읽기', '섀도잉 10분', '혼잣말로 하루 정리', '주 1회 회화 연습', '내 목소리 녹음', '자기소개 외우기', '질문 5개 준비', '틀려도 말해 보기'],
          ['읽기', '짧은 기사 1편', '쉬운 동화책 읽기', '모르는 단어 표시', '소리 내어 읽기', '한 달 책 1권', '세 줄 요약', '관심 분야 글 읽기', '읽은 글 목록'],
          ['쓰기', '세 줄 일기', '오늘 배운 표현 쓰기', '짧은 메시지 써 보기', '첨삭 받기', '문장 바꿔 쓰기', '주 1회 짧은 글', '틀린 문장 노트', '손으로 따라 쓰기'],
          ['문법', '교재 하루 1과', '문법 문제 10개', '예문 직접 만들기', '헷갈리는 규칙 정리', '주 1회 복습', '틀린 문제 다시 풀기', '시제 정리표', '설명하며 익히기'],
          ['습관', '매일 같은 시간 공부', '공부 기록 남기기', '30분 집중 타이머', '휴대폰 언어 바꾸기', '스터디 모임 참여', '주간 목표 세우기', '쉬는 날 정하기', '작은 보상 주기'],
          ['점검', '월 1회 모의시험', '3개월마다 목표 점검', '녹음 비교하기', '약한 영역 찾기', '계획 다시 세우기', '레벨 테스트', '진도표 업데이트', '성장 기록 공유'],
        ],
      },
      en: {
        name: 'Learning',
        description: 'Steady steps to learn a new language',
        hub: 'Learn a new language',
        areas: [
          ['Vocabulary', '10 new words a day', 'Review in a flashcard app', 'Learn words with examples', 'Weekend review', 'Mark confusing words', 'Label things at home', 'Group words by topic', 'Check 300 words monthly'],
          ['Listening', 'Podcast on the commute', 'One video without subtitles', 'Dictate 5 sentences', 'Sing along to a favorite song', 'One short news clip', 'Replay the same audio', 'Try 1.25x speed', 'Note new expressions'],
          ['Speaking', 'Read aloud 5 min a day', '10 min of shadowing', 'Recap the day out loud', 'Weekly conversation practice', 'Record my voice', 'Memorize a self-intro', 'Prepare 5 questions', 'Speak even with mistakes'],
          ['Reading', 'One short article', 'Read an easy storybook', 'Mark unknown words', 'Read out loud', 'One book a month', 'Three-line summary', 'Read about my interests', 'Keep a reading list'],
          ['Writing', 'Three-line diary', "Write today's phrases", 'Write a short message', 'Get corrections', 'Rewrite sentences', 'A short essay weekly', 'Mistake notebook', 'Copy sentences by hand'],
          ['Grammar', 'One lesson a day', '10 grammar exercises', 'Make my own examples', 'Sort out tricky rules', 'Weekly review', 'Redo wrong answers', 'Make a tense chart', 'Learn by explaining'],
          ['Habits', 'Study at the same time', 'Keep a study log', '30-min focus timer', 'Switch phone language', 'Join a study group', 'Set weekly goals', 'Plan rest days', 'Small rewards'],
          ['Check-ins', 'Monthly practice test', '3-month goal review', 'Compare recordings', 'Find weak areas', 'Revise the plan', 'Take a level test', 'Update the progress chart', 'Share my progress'],
        ],
      },
      ja: {
        name: '学習',
        description: '単語・リスニング・会話から新しい外国語を',
        hub: '新しい外国語を学ぶ',
        areas: [
          ['単語', '1日10単語', '単語アプリで復習', '例文と一緒に覚える', '週末にまとめて復習', '迷った単語に印', '身の回りにラベル', 'テーマ別に整理', '月300語をチェック'],
          ['リスニング', '通勤中にポッドキャスト', '字幕なしで動画1本', 'ディクテーション5文', '好きな歌を一緒に歌う', '短いニュースを1本', '同じ音声をくり返す', '1.25倍速に挑戦', '知らない表現をメモ'],
          ['スピーキング', '1日5分音読', 'シャドーイング10分', '独り言で1日を振り返る', '週1回会話練習', '自分の声を録音', '自己紹介を覚える', '質問を5つ用意', '間違えても話す'],
          ['リーディング', '短い記事を1本', 'やさしい絵本を読む', '知らない単語に印', '声に出して読む', '月に1冊', '3行で要約', '興味のある分野を読む', '読んだものリスト'],
          ['ライティング', '3行日記', '今日の表現を書く', '短いメッセージを書く', '添削してもらう', '言い換えて書く', '週1回短い作文', '間違いノート', '手で書き写す'],
          ['文法', '教材を1日1課', '文法問題10問', '例文を自作する', '紛らわしい規則を整理', '週1回復習', '間違えた問題を解き直す', '時制の表を作る', '説明しながら覚える'],
          ['習慣', '毎日同じ時間に勉強', '学習記録をつける', '30分集中タイマー', 'スマホの言語を変える', '勉強会に参加', '週の目標を立てる', '休む日を決める', '小さなごほうび'],
          ['振り返り', '月1回の模試', '3か月ごとに目標確認', '録音を聞き比べる', '苦手分野を探す', '計画を立て直す', 'レベルテスト', '進度表を更新', '成長を共有する'],
        ],
      },
      zh: {
        name: '学习',
        description: '从单词、听力、口语开始坚持学外语',
        hub: '学习一门新外语',
        areas: [
          ['单词', '每天10个单词', '用单词App复习', '结合例句记忆', '周末集中复习', '标记易混单词', '给家里物品贴标签', '按主题分类', '每月检查300词'],
          ['听力', '通勤听播客', '无字幕看1个视频', '听写5句话', '跟唱喜欢的歌', '听一段新闻', '反复听同一音频', '挑战1.25倍速', '记下新表达'],
          ['口语', '每天朗读5分钟', '跟读10分钟', '自言自语回顾一天', '每周练一次会话', '录下自己的声音', '背熟自我介绍', '准备5个问题', '说错也要开口'],
          ['阅读', '读一篇短文章', '读简单的童话书', '标记生词', '大声朗读', '每月读1本书', '三句话总结', '读感兴趣的内容', '建立阅读清单'],
          ['写作', '三行日记', '写下今天学的表达', '写一条短消息', '请人批改', '改写句子', '每周一篇短文', '错句笔记', '手抄句子'],
          ['语法', '每天学1课', '做10道语法题', '自己造例句', '整理易混规则', '每周复习', '重做错题', '制作时态表', '讲给别人听'],
          ['习惯', '每天固定时间学习', '记录学习', '30分钟专注计时', '把手机换成外语', '参加学习小组', '制定每周目标', '安排休息日', '给自己小奖励'],
          ['检查', '每月模拟测试', '每3个月检查目标', '对比录音', '找出薄弱环节', '重新制定计划', '做水平测试', '更新进度表', '分享成长'],
        ],
      },
    },
  },
  career: {
    done: [[0, 3, 4], [0, 1, 4], [0, 1, 3], [1], [0, 2], [0], [1, 7], [0, 2, 3]],
    content: {
      ko: {
        name: '커리어',
        description: '전문성·소통·네트워크로 한 단계 성장',
        hub: '커리어 한 단계 성장',
        areas: [
          ['전문성', '한 달 직무 책 1권', '온라인 강의 수강', '관련 자격증 준비', '업계 뉴스 읽기', '배운 내용 정리', '사내 발표 1회', '실무 도구 익히기', '전문가 글 구독'],
          ['업무 효율', '우선순위 정하기', '오전 집중 시간 확보', '반복 업무 자동화', '회의 안건 미리 공유', '메일은 정한 시간에', '주간 회고', '업무 템플릿 만들기', '마감 하루 전 완료'],
          ['소통', '결론부터 말하기', '끝까지 듣기', '피드백 요청하기', '고마움 표현하기', '회의록 공유', '어려운 대화 피하지 않기', '글로 정리해 전달', '먼저 질문하기'],
          ['네트워크', '업계 모임 참석', '동료와 점심', '이전 동료에게 연락', '온라인 커뮤니티 활동', '연락처 정리', '멘토 찾기', '세미나에서 질문하기', '먼저 도움 주기'],
          ['포트폴리오', '성과 기록하기', '프로젝트 사례 정리', '이력서 업데이트', '성과를 숫자로', '개인 블로그 운영', '결과물 모아 두기', '분기마다 점검', '추천사 받기'],
          ['리더십', '후배 도와주기', '작은 프로젝트 맡기', '회의 진행해 보기', '의사결정 기록', '팀 목표 공유', '구체적으로 칭찬하기', '끝까지 책임지기', '리더십 책 읽기'],
          ['자기계발', '새 분야 하나 배우기', '주 1권 독서', '글쓰기 습관', '외국어 공부', '사이드 프로젝트', '강연 듣기', '배운 것 공유', '매일 5분 회고'],
          ['워라밸', '주 3회 정시 퇴근', '휴가 미리 계획', '퇴근 후 업무 알림 끄기', '운동 시간 확보', '가족과 저녁', '취미 생활', '충분한 수면', '번아웃 신호 점검'],
        ],
      },
      en: {
        name: 'Career',
        description: 'Grow through expertise, communication, and networking',
        hub: 'Reach the next career level',
        areas: [
          ['Expertise', 'A work book every month', 'Take an online course', 'Prepare for a certification', 'Read industry news', 'Summarize what I learn', 'Give one internal talk', 'Master key tools', 'Follow expert writing'],
          ['Efficiency', 'Set daily priorities', 'Protect morning focus time', 'Automate repetitive tasks', 'Share meeting agendas early', 'Check email at set times', 'Weekly retrospective', 'Build work templates', 'Finish a day early'],
          ['Communication', 'Lead with the conclusion', 'Listen actively', 'Ask for feedback', 'Say thank you', 'Share meeting notes', 'Face hard conversations', 'Put it in writing', 'Ask questions first'],
          ['Network', 'Attend industry meetups', 'Lunch with coworkers', 'Reach out to former colleagues', 'Join an online community', 'Organize contacts', 'Find a mentor', 'Ask questions at seminars', 'Help others first'],
          ['Portfolio', 'Record achievements', 'Write up project stories', 'Update my resume', 'Show results with numbers', 'Run a personal blog', 'Collect work samples', 'Review every quarter', 'Get recommendations'],
          ['Leadership', 'Help junior coworkers', 'Lead a small project', 'Run a meeting', 'Record decisions', 'Share team goals', 'Give specific praise', 'Follow through', 'Read a leadership book'],
          ['Growth', 'Learn one new field', 'A book a week', 'Writing habit', 'Study a foreign language', 'Side project', 'Watch talks', 'Share what I learn', '5-min daily reflection'],
          ['Balance', 'Leave on time 3x a week', 'Plan vacations early', 'Mute work alerts after hours', 'Make time to exercise', 'Dinner with family', 'Enjoy a hobby', 'Get enough sleep', 'Watch for burnout signs'],
        ],
      },
      ja: {
        name: 'キャリア',
        description: '専門性・コミュニケーション・人脈で成長',
        hub: 'キャリアを一段階伸ばす',
        areas: [
          ['専門性', '月1冊の専門書', 'オンライン講座を受講', '資格の準備', '業界ニュースを読む', '学びをまとめる', '社内で1回発表', '実務ツールを習得', '専門家の発信をフォロー'],
          ['業務効率', '優先順位を決める', '午前に集中時間', '定型作業を自動化', '会議の議題を事前共有', 'メールは決まった時間に', '週次の振り返り', '業務テンプレート作成', '締切の前日に完了'],
          ['コミュニケーション', '結論から話す', '傾聴する', 'フィードバックを求める', '感謝を伝える', '議事録を共有', '難しい話から逃げない', '文章で整理して伝える', 'まず質問する'],
          ['人脈', '業界イベントに参加', '同僚とランチ', '元同僚に連絡', 'オンラインコミュニティ', '連絡先を整理', 'メンターを探す', 'セミナーで質問', 'まず自分から助ける'],
          ['ポートフォリオ', '成果を記録', '事例をまとめる', '履歴書を更新', '成果を数字で示す', '個人ブログを運営', '成果物を集める', '四半期ごとに見直す', '推薦の言葉をもらう'],
          ['リーダーシップ', '後輩を手伝う', '小さなプロジェクトを担当', '会議を進行', '意思決定を記録', 'チーム目標を共有', '具体的に褒める', '最後までやり切る', 'リーダー本を読む'],
          ['自己成長', '新しい分野を1つ学ぶ', '週1冊読書', '書く習慣', '外国語の勉強', 'サイドプロジェクト', '講演を聞く', '学びを共有', '毎日5分の振り返り'],
          ['ワークライフ', '週3回定時退社', '休暇を早めに計画', '退勤後は仕事の通知オフ', '運動の時間を確保', '家族と夕食', '趣味を楽しむ', '十分な睡眠', '燃え尽きサインを確認'],
        ],
      },
      zh: {
        name: '职业',
        description: '通过专业能力、沟通、人脉更进一步',
        hub: '职业更上一层楼',
        areas: [
          ['专业能力', '每月读1本专业书', '学习网课', '准备相关证书', '阅读行业新闻', '整理所学内容', '内部分享1次', '熟练掌握工具', '关注专家文章'],
          ['工作效率', '排好优先级', '保留上午专注时间', '自动化重复工作', '提前发会议议程', '定时查看邮件', '每周复盘', '制作工作模板', '提前一天完成'],
          ['沟通', '先说结论', '认真倾听', '主动要反馈', '表达感谢', '分享会议纪要', '不回避难谈的话题', '用文字整理后传达', '先提问'],
          ['人脉', '参加行业活动', '和同事吃午饭', '联系前同事', '参与线上社区', '整理联系人', '寻找导师', '在研讨会上提问', '先帮助别人'],
          ['作品集', '记录成果', '整理项目案例', '更新简历', '用数字展示成果', '经营个人博客', '收集作品', '每季度检查', '获得推荐语'],
          ['领导力', '帮助新同事', '负责小项目', '主持会议', '记录决策', '分享团队目标', '具体地表扬', '有始有终', '读领导力书籍'],
          ['自我提升', '学习一个新领域', '每周读1本书', '写作习惯', '学习外语', '副业项目', '听讲座', '分享所学', '每天复盘5分钟'],
          ['工作生活平衡', '每周3次准时下班', '提前规划假期', '下班后关闭工作通知', '留出运动时间', '和家人吃晚饭', '享受爱好', '保证睡眠', '留意倦怠信号'],
        ],
      },
    },
  },
}

// 바깥 블록의 칸 인덱스(왼쪽 위부터 9칸)
function blockCells(blockIndex: number) {
  const rowStart = Math.floor(blockIndex / 3) * 3
  const columnStart = (blockIndex % 3) * 3
  return Array.from(
    { length: 9 },
    (_, local) => (rowStart + Math.floor(local / 3)) * 9 + columnStart + (local % 3),
  )
}

// 샘플을 JSON 백업 파일과 같은 형식의 객체로 만든다.
export function buildSampleBackup(id: SampleId, language: Language) {
  const { content, done } = SAMPLES[id]
  const sample = content[language]
  const cells: BoardCell[] = createInitialCells()

  cells[CENTER_CELL] = { text: sample.hub, done: false }
  sample.areas.forEach(([title, ...actions], areaIndex) => {
    cells[SUBGOAL_CELLS[areaIndex]] = { text: title, done: false }

    const blockIndexes = blockCells(OUTER_BLOCKS[areaIndex])
    cells[blockIndexes[4]] = { text: title, done: false }
    blockIndexes
      .filter((_, local) => local !== 4)
      .forEach((cellIndex, actionIndex) => {
        cells[cellIndex] = {
          text: actions[actionIndex] ?? '',
          done: done[areaIndex]?.includes(actionIndex) ?? false,
        }
      })
  })

  return {
    format: 'ninegrid-backup',
    version: 1,
    cells,
    theme: 'light',
    language,
  }
}

// 백업 복원과 같은 검증(parseBackup → normalizeCells)을 거친 샘플 보드. 형식이 깨졌으면 null
export function loadSampleCells(id: SampleId, language: Language): BoardCell[] | null {
  return parseBackup(buildSampleBackup(id, language))?.cells ?? null
}

export function getSampleInfo(id: SampleId, language: Language) {
  const { name, description } = SAMPLES[id].content[language]
  return { id, name, description }
}
