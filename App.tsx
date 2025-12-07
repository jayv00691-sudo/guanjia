import React, { useState } from 'react';
import { 
  PieChart, Trophy, PlayCircle, Layers, MoreHorizontal, 
  Settings as SettingsIcon, Menu, X
} from 'lucide-react';

// UI-Only Version: 只包含页面 UI，无业务逻辑和数据获取

const App = () => {
  const [view, setView] = useState<'REPORT' | 'RESULTS' | 'RECORD' | 'HANDS' | 'MORE'>('RECORD');
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // 模拟数据 - 仅用于 UI 展示
  const mockSessions = [
    { id: '1', location: '澳门永利', blinds: '5/10', buyIn: 1000, cashOut: 1500, currency: 'CNY', startTime: Date.now() - 86400000, durationSeconds: 7200 },
    { id: '2', location: '澳门威尼斯人', blinds: '10/20', buyIn: 2000, cashOut: 1800, currency: 'CNY', startTime: Date.now() - 172800000, durationSeconds: 10800 },
  ];

  const mockHands = [
    { id: '1', holeCards: [{ rank: 'A', suit: '♠', id: '1' }, { rank: 'K', suit: '♠', id: '2' }], profit: 150, timestamp: Date.now() },
    { id: '2', holeCards: [{ rank: 'Q', suit: '♥', id: '3' }, { rank: 'Q', suit: '♦', id: '4' }], profit: -50, timestamp: Date.now() - 3600000 },
  ];

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-slate-50 to-slate-200 text-slate-800 font-sans">
      {/* Header */}
      <div className="px-4 py-3 flex justify-between items-center sticky top-0 z-40 bg-white/70 backdrop-blur-md border-b border-white/20 shadow-sm">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-full border-2 border-white shadow-md overflow-hidden bg-slate-100">
            <div className="w-full h-full bg-gradient-to-br from-indigo-400 to-purple-500"></div>
          </div>
          <div>
            <h1 className="font-bold text-slate-800 leading-none text-sm">HAO牌</h1>
            <p className="text-[9px] text-slate-500 uppercase tracking-widest mt-0.5">Nice Hand</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setIsMenuOpen(true)} className="p-2 rounded-full hover:bg-slate-100 transition-colors">
            <Menu className="text-slate-700" size={22} />
          </button>
        </div>
      </div>

      {/* Settings Menu */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-50 bg-black/20 backdrop-blur-sm flex justify-end animate-fade-in" onClick={() => setIsMenuOpen(false)}>
          <div className="w-72 bg-white h-full shadow-2xl p-6 flex flex-col" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-8">
              <h2 className="font-bold text-lg text-slate-800 flex items-center gap-2">
                <SettingsIcon size={18}/> 设置
              </h2>
              <button onClick={() => setIsMenuOpen(false)}><X size={20}/></button>
            </div>
            <div className="space-y-6 flex-1 overflow-y-auto pb-4">
              <div className="text-sm text-slate-500">UI 演示版本 - 仅展示界面</div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="p-4 max-w-3xl mx-auto pb-28">
        {/* 统计页面 UI */}
        {view === 'REPORT' && (
          <div className="space-y-6">
            <h2 className="text-xl font-light text-slate-700 mb-4">数据统计</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="glass-panel p-4 rounded-2xl flex items-center gap-4">
                <div className="p-3 rounded-full bg-green-500 bg-opacity-20 text-green-500">
                  <PieChart size={24} />
                </div>
                <div>
                  <p className="text-sm text-gray-500 font-medium">总盈利 (CNY)</p>
                  <h3 className="text-2xl font-bold text-gray-800">+500</h3>
                </div>
              </div>
              <div className="glass-panel p-4 rounded-2xl flex items-center gap-4">
                <div className="p-3 rounded-full bg-blue-500 bg-opacity-20 text-blue-500">
                  <Trophy size={24} />
                </div>
                <div>
                  <p className="text-sm text-gray-500 font-medium">总场次</p>
                  <h3 className="text-2xl font-bold text-gray-800">12</h3>
                </div>
              </div>
              <div className="glass-panel p-4 rounded-2xl flex items-center gap-4">
                <div className="p-3 rounded-full bg-indigo-500 bg-opacity-20 text-indigo-500">
                  <Layers size={24} />
                </div>
                <div>
                  <p className="text-sm text-gray-500 font-medium">胜率</p>
                  <h3 className="text-2xl font-bold text-gray-800">65%</h3>
                </div>
              </div>
              <div className="glass-panel p-4 rounded-2xl flex items-center gap-4">
                <div className="p-3 rounded-full bg-purple-500 bg-opacity-20 text-purple-500">
                  <PlayCircle size={24} />
                </div>
                <div>
                  <p className="text-sm text-gray-500 font-medium">每小时</p>
                  <h3 className="text-2xl font-bold text-gray-800">25 /h</h3>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 历史战绩页面 UI */}
        {view === 'RESULTS' && (
          <div className="space-y-3">
            <h2 className="text-xl font-light text-slate-700 mb-4">历史战绩</h2>
            {mockSessions.map(s => (
              <div key={s.id} className="glass-panel p-4 rounded-xl flex justify-between items-center border-l-4 border-l-indigo-500">
                <div>
                  <div className="font-bold text-slate-800">{s.location}</div>
                  <div className="text-xs text-slate-500 mt-1">{new Date(s.startTime).toLocaleDateString('zh-CN')} • {s.blinds}</div>
                  <div className="text-[10px] text-slate-400 mt-0.5">时长: {(s.durationSeconds / 3600).toFixed(1)}h</div>
                </div>
                <div className="text-right">
                  <div className={`text-lg font-bold font-mono ${(s.cashOut - s.buyIn) >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                    {(s.cashOut - s.buyIn) > 0 ? '+' : ''}{s.cashOut - s.buyIn} <span className="text-[10px] text-slate-400 font-sans">{s.currency}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* 记录页面 UI */}
        {view === 'RECORD' && (
          <div className="flex flex-col gap-4 pt-6 animate-fade-in">
            <h2 className="text-xl font-light text-slate-700 mb-2">开始新战局</h2>
            <button className="h-40 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-3xl flex flex-col items-center justify-center shadow-xl hover:scale-[1.02] transition-transform relative overflow-hidden group">
              <div className="absolute right-[-20px] bottom-[-20px] opacity-20 transform rotate-12 w-40 h-40 rounded-full bg-white"></div>
              <div className="z-10 mb-2 w-16 h-16 rounded-full border-4 border-white/30 shadow-lg overflow-hidden bg-white/90">
                <div className="w-full h-full bg-gradient-to-br from-indigo-400 to-purple-500"></div>
              </div>
              <div className="flex flex-col items-center text-white z-10">
                <span className="text-xl font-bold tracking-wide">开始记录</span>
                <span className="text-xs opacity-80 mt-1">Nice Hand!</span>
              </div>
            </button>
            <button className="h-24 bg-white border-2 border-dashed border-slate-300 rounded-3xl flex items-center justify-center hover:bg-slate-50 hover:border-indigo-300 transition-all text-slate-500 hover:text-indigo-600">
              <div className="flex items-center gap-2 font-semibold">
                <PlayCircle size={20} /> 补录战绩
              </div>
            </button>
          </div>
        )}

        {/* 手牌页面 UI */}
        {view === 'HANDS' && (
          <div className="pb-20">
            <h2 className="text-xl font-light text-slate-700 mb-4">手牌记录</h2>
            <div className="space-y-4">
              {mockHands.map(h => (
                <div key={h.id} className="glass-panel p-4 rounded-xl space-y-3 cursor-pointer border border-transparent hover:border-indigo-300 transition-all">
                  <div className="flex justify-between items-start">
                    <div className="flex gap-1">
                      {h.holeCards.map(c => (
                        <div key={c.id} className="w-8 h-11 bg-white border rounded flex flex-col justify-center items-center font-bold text-xs">
                          <span>{c.rank}</span>
                          <span className={c.suit === '♥' || c.suit === '♦' ? 'text-red-500' : 'text-slate-800'}>{c.suit}</span>
                        </div>
                      ))}
                    </div>
                    <div className={`font-bold text-lg ${h.profit > 0 ? 'text-green-600' : h.profit < 0 ? 'text-red-500' : 'text-slate-500'}`}>
                      {h.profit > 0 ? '+' : ''}{h.profit}
                    </div>
                  </div>
                  <div className="text-[10px] text-slate-400 bg-slate-100 px-2 py-1 rounded inline-flex items-center gap-1">
                    {new Date(h.timestamp).toLocaleDateString('zh-CN')}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 更多页面 UI */}
        {view === 'MORE' && (
          <div className="py-10 space-y-6 max-w-md mx-auto">
            <h2 className="text-2xl font-light text-slate-700 text-center">更多功能</h2>
            <div className="glass-panel p-6 rounded-3xl border border-slate-200/50">
              <h3 className="font-bold text-slate-800 mb-4">数据备份</h3>
              <p className="text-sm text-slate-500">UI 演示版本 - 功能待实现</p>
            </div>
          </div>
        )}
      </main>

      {/* Bottom Navigation */}
      <div className="fixed bottom-6 left-4 right-4 bg-white/90 backdrop-blur-lg rounded-3xl flex justify-between items-center px-6 py-3 shadow-2xl z-40 max-w-md mx-auto border border-white/50 ring-1 ring-black/5">
        <NavBtn icon={PieChart} label="统计" isActive={view === 'REPORT'} onClick={() => setView('REPORT')} />
        <NavBtn icon={Trophy} label="战绩" isActive={view === 'RESULTS'} onClick={() => setView('RESULTS')} />
        <div className="relative -top-6 group">
          <button 
            onClick={() => setView('RECORD')} 
            className={`w-16 h-16 rounded-full flex items-center justify-center shadow-lg transition-all transform group-hover:scale-105 ${
              view === 'RECORD' 
                ? 'bg-indigo-600 text-white ring-4 ring-indigo-100' 
                : 'bg-white text-indigo-600 border border-slate-100'
            }`}
          >
            <PlayCircle size={32} strokeWidth={2.5} />
          </button>
        </div>
        <NavBtn icon={Layers} label="手牌" isActive={view === 'HANDS'} onClick={() => setView('HANDS')} />
        <NavBtn icon={MoreHorizontal} label="更多" isActive={view === 'MORE'} onClick={() => setView('MORE')} />
      </div>
    </div>
  );
};

const NavBtn = ({ icon: Icon, label, isActive, onClick }: any) => (
  <button 
    onClick={onClick} 
    className={`flex flex-col items-center justify-center w-12 gap-1 transition-all duration-300 ${
      isActive ? 'text-indigo-600' : 'text-slate-400 hover:text-slate-600'
    }`}
  >
    <Icon size={22} strokeWidth={isActive ? 2.5 : 2} className={`transition-transform duration-300 ${isActive ? '-translate-y-1' : ''}`} />
    <span className={`text-[9px] font-bold transition-opacity duration-300 ${isActive ? 'opacity-100' : 'opacity-0 h-0'}`}>
      {label}
    </span>
  </button>
);

export default App;
