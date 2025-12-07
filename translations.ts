
export const translations = {
  zh: {
    nav: { report: '报表', results: '战绩', record: '记牌', hands: '手牌', more: '更多', ai: 'AI 助手' },
    common: { cancel: '取消', confirm: '完成', save: '保存', delete: '删除', edit: '编辑', back: '返回', reset: '重置', loading: '加载中...', unknown: '未知', date: '日期', notes: '备注', close: '关闭', position: '位置' },
    filter: { time: '时间范围', location: '地点', all: '全部时间', week: '本周', month: '本月', year: '今年', allLoc: '所有地点' },
    dashboard: { totalPnl: '总盈亏', hourly: '时薪', winRate: '胜率', sessions: '场次', recentHands: '近期手牌', viewAll: '查看全部', noHands: '暂无手牌记录', reportTitle: '数据汇总' },
    live: { 
      landingTitle: '记牌中心', startNew: '开始新对局', logPast: '补录战绩', 
      startGame: '准备游戏', recentSessions: '最近战绩', location: '地点', blinds: '盲注', currency: '货币', buyIn: '初始买入', startBtn: '开始发牌', rebuy: '补码 (Rebuy)', cashOut: '离桌 (Cash Out)', pause: '暂停', resume: '继续', duration: '游戏时长', totalBuyIn: '总买入', endSession: '结束游戏', endSessionPrompt: '请输入离桌时的筹码总量。', add: '添加', amount: '金额', custom: '自定义',
      pastDate: '日期', pastDuration: '时长 (小时)', pastProfit: '最终筹码 (Cash Out)', startTime: '开局时间'
    },
    hand: { 
      recorder: '手牌记录器', 
      hero: '我方', board: '公共牌', villain: '对手', addVillain: '加对手',
      profitInput: '本局盈亏', street: '行动线', details: '详细信息',
      pre: '翻前', flop: '翻牌', turn: '转牌', river: '河牌',
      bet: '下注', call: '跟注', raise: '加注', fold: '弃牌', check: '过牌', allin: '全下',
      aiAnalysis: 'AI 分析建议', thinking: '分析中...', quickSave: '保存手牌', editHand: '编辑手牌',
      cardPlaceholder: '点选录入', analysisTitle: 'AI 教练分析',
      bestHands: '最强起手牌 (Top 3)', worstHands: '亏损起手牌 (Top 3)', count: '次数', net: '净利',
      pos: { SB: 'SB', BB: 'BB', UTG: 'UTG', MP: 'MP', CO: 'CO', BTN: 'BTN' }
    },
    history: { title: '战绩列表', duration: '时长', ongoing: '进行中', noHistory: '暂无历史记录', profit: '盈亏' },
    ai: { title: 'AI 助手', subtitle: '您的全能扑克百科全书', placeholder: '问点什么... (例如: 怎么计算底池赔率?)', disclaimer: 'AI 服务需要 API Key', close: '收起' },
    settings: { 
      title: '设置', language: '语言', displayCurrency: '显示货币', 
      apiKey: 'Gemini API Key', apiKeyPlaceholder: '粘贴 Key (AIza...)', 
      googleClientId: 'Google Client ID', googleClientIdPlaceholder: '粘贴 OAuth Client ID...',
      exchangeRates: '汇率设置 (基准 USD)', resetRates: '恢复默认汇率', 
      enableWidget: '开启游戏悬浮窗', theme: '配色模式', 
      themes: { indigo: '紫罗兰', blue: '海洋蓝', emerald: '森林绿', rose: '玫瑰红', amber: '琥珀金' } 
    },
    more: { 
      title: '更多功能', comingSoon: '开发中...', debt: '债务管理', export: '数据导出',
      driveBackup: 'Google Drive 备份', connectDrive: '连接 Google Drive', 
      autoBackup: '自动备份数据', restoreDrive: '从云端恢复',
      driveConnected: '已连接', lastBackup: '上次备份'
    }
  },
  en: {
    nav: { report: 'Report', results: 'Results', record: 'Record', hands: 'Hands', more: 'More', ai: 'AI Assist' },
    common: { cancel: 'Cancel', confirm: 'Done', save: 'Save', delete: 'Delete', edit: 'Edit', back: 'Back', reset: 'Reset', loading: 'Loading...', unknown: 'Unknown', date: 'Date', notes: 'Notes', close: 'Close', position: 'Position' },
    filter: { time: 'Time Range', location: 'Location', all: 'All Time', week: 'This Week', month: 'This Month', year: 'This Year', allLoc: 'All Locations' },
    dashboard: { totalPnl: 'Total P/L', hourly: 'Hourly', winRate: 'Win Rate', sessions: 'Sessions', recentHands: 'Recent Hands', viewAll: 'View All', noHands: 'No recent hands', reportTitle: 'Summary' },
    live: { 
      landingTitle: 'Session Center', startNew: 'Start New Game', logPast: 'Log Past Game',
      startGame: 'Setup Game', recentSessions: 'Recent Games', location: 'Location', blinds: 'Blinds', currency: 'Currency', buyIn: 'Buy-in', startBtn: 'Shuffle Up & Deal', rebuy: 'Rebuy', cashOut: 'Cash Out', pause: 'Pause', resume: 'Resume', duration: 'Duration', totalBuyIn: 'Total Buy-in', endSession: 'End Session', endSessionPrompt: 'Total chips at cash out.', add: 'Add', amount: 'Amount', custom: 'Custom',
      pastDate: 'Date', pastDuration: 'Duration (Hrs)', pastProfit: 'Cash Out', startTime: 'Start Time'
    },
    hand: { 
      recorder: 'Hand Recorder', 
      hero: 'Hero', board: 'Board', villain: 'Villain', addVillain: '+ Opp',
      profitInput: 'P/L', street: 'Action', details: 'Details',
      pre: 'Pre', flop: 'Flop', turn: 'Turn', river: 'River',
      bet: 'Bet', call: 'Call', raise: 'Raise', fold: 'Fold', check: 'Check', allin: 'All-in',
      aiAnalysis: 'AI Analyze', thinking: 'Thinking...', quickSave: 'Save Hand', editHand: 'Edit Hand',
      cardPlaceholder: 'Tap to add', analysisTitle: 'Coach Analysis',
      bestHands: 'Best Hands (Top 3)', worstHands: 'Worst Hands (Top 3)', count: 'Count', net: 'Net',
      pos: { SB: 'SB', BB: 'BB', UTG: 'UTG', MP: 'MP', CO: 'CO', BTN: 'BTN' }
    },
    history: { title: 'Session Results', duration: 'Duration', ongoing: 'Live', noHistory: 'No history available', profit: 'Profit' },
    ai: { title: 'AI Assistant', subtitle: 'Your Poker Encyclopedia', placeholder: 'Ask anything...', disclaimer: 'AI Service requires API Key', close: 'Close' },
    settings: { 
      title: 'Settings', language: 'Language', displayCurrency: 'Display Currency', 
      apiKey: 'Gemini API Key', apiKeyPlaceholder: 'Paste Key (AIza...)', 
      googleClientId: 'Google Client ID', googleClientIdPlaceholder: 'Paste OAuth Client ID...',
      exchangeRates: 'Exchange Rates (Base USD)', resetRates: 'Reset Defaults', 
      enableWidget: 'Enable Game Widget', theme: 'Color Theme', 
      themes: { indigo: 'Violet', blue: 'Ocean Blue', emerald: 'Forest Green', rose: 'Rose Red', amber: 'Amber Gold' } 
    },
    more: { 
      title: 'More', comingSoon: 'Coming Soon...', debt: 'Debt Manager', export: 'Export Data',
      driveBackup: 'Google Drive Backup', connectDrive: 'Connect Google Drive', 
      autoBackup: 'Auto Backup Data', restoreDrive: 'Restore from Cloud',
      driveConnected: 'Connected', lastBackup: 'Last Backup'
    }
  }
};