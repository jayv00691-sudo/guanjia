import React, { useState, useEffect, useRef } from 'react';
import { 
  PieChart, Trophy, PlayCircle, Layers, MoreHorizontal, 
  Settings as SettingsIcon, CreditCard, Menu, X, 
  Bot, Globe, RefreshCw, Check, Palette, 
  Download, Upload, Cloud, RefreshCcw, PlusCircle,
  Trash2, MapPin, BrainCircuit, ChevronRight,
  Layout, FileText
} from 'lucide-react';
import { Currency, PokerSession, PokerHand, ViewState, ExchangeRates, Language, FilterState, ThemeColor } from './types';
import { StatsDashboard } from './components/StatsDashboard';
import { CardDisplay } from './components/CardSelector';
import { initGapiClient, uploadDataToDrive, loadDataFromDrive, DriveData } from './services/driveService';
import { translations } from './translations';

// Components
import { HandRecorder, HandAnalysisStats } from './components/HandRecorder';
import { SessionSetup, PastSessionForm, LiveTracker, LiveSessionWidget } from './components/SessionViews';
import { FilterBar, AICoachOverlay } from './components/Overlays';

// --- CONSTANTS ---
const APP_LOGO = "https://api.dicebear.com/9.x/avataaars/svg?seed=Felix&backgroundColor=b6e3f4";
const DEFAULT_RATES: ExchangeRates = { USD: 1, CNY: 7.1, HKD: 7.8, EUR: 0.92 };

// --- UTILS ---
const useLocalStorage = <T,>(key: string, initialValue: T): [T, (value: T | ((val: T) => T)) => void] => {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(error);
      return initialValue;
    }
  });

  const setValue = (value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error(error);
    }
  };
  return [storedValue, setValue];
};

// --- HELPERS ---
const filterSessions = (sessions: PokerSession[], filter: FilterState): PokerSession[] => {
  const now = new Date();
  let filtered = sessions;

  if (filter.location) {
    filtered = filtered.filter(s => s.location === filter.location);
  }

  if (filter.time !== 'all') {
    filtered = filtered.filter(s => {
      const date = new Date(s.startTime);
      if (filter.time === 'week') {
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(now.getDate() - 7);
        return date >= oneWeekAgo;
      }
      if (filter.time === 'month') {
        return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
      }
      if (filter.time === 'year') {
        return date.getFullYear() === now.getFullYear();
      }
      return true;
    });
  }
  return filtered;
};

// --- MAIN APP COMPONENT ---

const App = () => {
  // --- STATE ---
  const [view, setView] = useState<ViewState>('RECORD');
  const [sessions, setSessions] = useLocalStorage<PokerSession[]>('pokerGames', []);
  const [hands, setHands] = useLocalStorage<PokerHand[]>('pokerHands', []);
  const [activeSession, setActiveSession] = useLocalStorage<PokerSession | null>('activeSession', null);
  const [userCurrency, setUserCurrency] = useLocalStorage<Currency>('userCurrency', Currency.CNY);
  const [exchangeRates, setExchangeRates] = useLocalStorage<ExchangeRates>('exchangeRates', DEFAULT_RATES);
  const [lang, setLang] = useLocalStorage<Language>('appLanguage', 'zh');
  const [enableWidget, setEnableWidget] = useLocalStorage<boolean>('enableWidget', true);
  const [themeColor, setThemeColor] = useLocalStorage<ThemeColor>('themeColor', 'indigo');
  const [userApiKey, setUserApiKey] = useLocalStorage<string>('userApiKey', 'AIzaSyAeTmzYZdNx9eK-qBGB4H14BdBx-B5K1WY');
  const [googleClientId, setGoogleClientId] = useLocalStorage<string>('googleClientId', '');
  const [enableDriveBackup, setEnableDriveBackup] = useLocalStorage<boolean>('enableDriveBackup', false);
  
  // Drive State
  const [tokenClient, setTokenClient] = useState<any>(null);
  const [driveAccessToken, setDriveAccessToken] = useState<string | null>(null);
  const [lastBackupTime, setLastBackupTime] = useState<number | null>(null);
  const [isBackingUp, setIsBackingUp] = useState(false);

  // UI States
  const [elapsedTime, setElapsedTime] = useState<string>("00:00:00");
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAIOpen, setIsAIOpen] = useState(false);
  const [editingHand, setEditingHand] = useState<PokerHand | null>(null);
  const [isQuickRecording, setIsQuickRecording] = useState(false); 
  const [isEndSessionModalOpen, setIsEndSessionModalOpen] = useState(false);
  const [widgetRebuyAmount, setWidgetRebuyAmount] = useState('');
  const [isRebuyModalOpen, setIsRebuyModalOpen] = useState(false);

  const [reportFilter, setReportFilter] = useState<FilterState>({ time: 'all', location: '' });
  const [resultsFilter, setResultsFilter] = useState<FilterState>({ time: 'all', location: '' });
  const [recordMode, setRecordMode] = useState<'LANDING' | 'START' | 'PAST'>('LANDING');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const t = translations[lang];
  const locations = Array.from(new Set(sessions.map(s => s.location)));
  const THEME_OPTIONS: ThemeColor[] = ['indigo', 'blue', 'emerald', 'rose', 'amber'];

  // Init Google Drive Logic
  useEffect(() => {
    const initDrive = async () => {
      if (!googleClientId) return;
      try {
        await initGapiClient();
        if (window.google) {
          const client = window.google.accounts.oauth2.initTokenClient({
            client_id: googleClientId,
            scope: 'https://www.googleapis.com/auth/drive.file',
            callback: (response: any) => {
              if (response.access_token) {
                setDriveAccessToken(response.access_token);
              }
            },
          });
          setTokenClient(client);
        }
      } catch (err) {
        console.error("Failed to init Google Drive:", err);
      }
    };
    initDrive();
  }, [googleClientId]);

  // Auto Backup Effect
  useEffect(() => {
    if (!enableDriveBackup || !driveAccessToken) return;
    
    const saveData = async () => {
      setIsBackingUp(true);
      try {
        const data: DriveData = {
          sessions,
          hands,
          settings: { userCurrency, exchangeRates, lang, themeColor, userApiKey, googleClientId },
          updatedAt: Date.now()
        };
        await uploadDataToDrive(data, driveAccessToken);
        setLastBackupTime(Date.now());
      } catch (err) {
        console.error("Backup failed", err);
      } finally {
        setIsBackingUp(false);
      }
    };

    const timeout = setTimeout(saveData, 5000); // Debounce 5s
    return () => clearTimeout(timeout);
  }, [sessions, hands, driveAccessToken, enableDriveBackup]);

  const handleDriveConnect = () => {
    if (tokenClient) {
      tokenClient.requestAccessToken();
    } else {
      alert(lang === 'zh' ? "请先在设置中配置 Google Client ID" : "Please set Google Client ID in settings first");
    }
  };

  const handleDriveRestore = async () => {
    if (!driveAccessToken) {
       handleDriveConnect();
       return;
    }
    if (!confirm(lang === 'zh' ? "从云端恢复将覆盖当前本地数据，确定吗？" : "Restoring will overwrite local data. Are you sure?")) return;
    
    try {
      const data = await loadDataFromDrive(driveAccessToken);
      if (data.sessions) setSessions(data.sessions);
      if (data.hands) setHands(data.hands);
      alert(lang === 'zh' ? "数据恢复成功！" : "Data restored successfully!");
    } catch (err) {
      alert(lang === 'zh' ? "恢复失败或无备份文件" : "Restore failed or no backup found");
    }
  };

  // Timer
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (activeSession && activeSession.isLive) {
      interval = setInterval(() => {
        const now = Date.now();
        const pausedDuration = activeSession.pauses.reduce((acc, pause) => acc + ((pause.end || now) - pause.start), 0);
        const isCurrentlyPaused = activeSession.pauses.length > 0 && !activeSession.pauses[activeSession.pauses.length - 1].end;
        if (!isCurrentlyPaused) {
            const totalSeconds = Math.floor((now - activeSession.startTime - pausedDuration) / 1000);
            const h = Math.floor(totalSeconds / 3600).toString().padStart(2, '0');
            const m = Math.floor((totalSeconds % 3600) / 60).toString().padStart(2, '0');
            const s = (totalSeconds % 60).toString().padStart(2, '0');
            setElapsedTime(`${h}:${m}:${s}`);
        }
      }, 1000);
    } else {
      setElapsedTime("00:00:00");
    }
    return () => clearInterval(interval);
  }, [activeSession]);

  const startSession = (location: string, blinds: string, buyIn: number, currency: Currency, startTime: number) => {
    const newSession: PokerSession = { id: `session_${Date.now()}`, location, startTime: startTime, blinds, buyIn, currency, durationSeconds: 0, isLive: true, pauses: [] };
    setActiveSession(newSession);
    setRecordMode('LANDING'); 
  };

  const endSession = (cashOut: number) => {
    if (!activeSession) return;
    const now = Date.now();
    const pausedDuration = activeSession.pauses.reduce((acc, pause) => acc + ((pause.end || now) - pause.start), 0);
    const durationSeconds = Math.floor((now - activeSession.startTime - pausedDuration) / 1000);
    const finishedSession: PokerSession = { ...activeSession, endTime: now, cashOut, durationSeconds, isLive: false, pauses: activeSession.pauses.map(p => !p.end ? {...p, end: now} : p) };
    setSessions(prev => [...prev, finishedSession]);
    setActiveSession(null);
    setView('RESULTS');
    setIsEndSessionModalOpen(false);
  };

  const savePastSession = (session: PokerSession) => {
    setSessions(prev => [...prev, session]);
    setRecordMode('LANDING');
    setView('RESULTS');
  };

  const togglePause = () => {
    if (!activeSession) return;
    const now = Date.now();
    const pauses = [...activeSession.pauses];
    if (pauses.length > 0 && !pauses[pauses.length - 1].end) pauses[pauses.length - 1].end = now;
    else pauses.push({ start: now });
    setActiveSession({ ...activeSession, pauses });
  };

  const handleRebuy = (amount: number) => {
    if (!activeSession) return;
    setActiveSession({ ...activeSession, buyIn: activeSession.buyIn + amount });
  };

  const updateHand = (updatedHand: PokerHand) => {
    setHands(prev => prev.map(h => h.id === updatedHand.id ? updatedHand : h));
    setEditingHand(null);
    setIsQuickRecording(false);
  };

  const deleteHand = (id: string) => {
    setHands(prev => prev.filter(h => h.id !== id));
    setEditingHand(null);
  };

  const handleExport = () => {
    const data = { sessions, hands, settings: { userCurrency, exchangeRates, lang, themeColor, userApiKey } };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `hao_poker_backup_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleImportClick = () => fileInputRef.current?.click();
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const json = JSON.parse(e.target?.result as string);
        if (json.sessions && Array.isArray(json.sessions)) setSessions(json.sessions);
        if (json.hands && Array.isArray(json.hands)) setHands(json.hands);
        alert(lang === 'zh' ? '数据导入成功！' : 'Data imported successfully!');
      } catch (err) {
        alert(lang === 'zh' ? '文件格式错误' : 'Invalid file format');
      }
    };
    reader.readAsText(file);
    event.target.value = '';
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-slate-50 to-slate-200 text-slate-800 font-sans">
      <div className={`fixed -top-20 -right-20 w-96 h-96 bg-${themeColor}-200/30 rounded-full blur-3xl -z-10 pointer-events-none`}></div>
      <div className="fixed top-40 -left-20 w-72 h-72 bg-purple-200/30 rounded-full blur-3xl -z-10 pointer-events-none"></div>

      <div className="px-4 py-3 flex justify-between items-center sticky top-0 z-40 bg-white/70 backdrop-blur-md border-b border-white/20 shadow-sm">
        <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-full border-2 border-white shadow-md overflow-hidden bg-slate-100">
              <img src={APP_LOGO} alt="Logo" className="w-full h-full object-cover" />
            </div>
            <div><h1 className="font-bold text-slate-800 leading-none text-sm">HAO牌</h1><p className="text-[9px] text-slate-500 uppercase tracking-widest mt-0.5">Nice Hand</p></div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setIsAIOpen(true)} className={`p-2 rounded-full bg-${themeColor}-50 hover:bg-${themeColor}-100 text-${themeColor}-600 transition-colors flex items-center gap-1 shadow-sm border border-${themeColor}-100`}>
             <Bot size={18} />
             <span className="text-xs font-bold hidden sm:inline">{t.nav.ai}</span>
          </button>
          <button onClick={() => setIsMenuOpen(true)} className="p-2 rounded-full hover:bg-slate-100 transition-colors"><Menu className="text-slate-700" size={22} /></button>
        </div>
      </div>

      <AICoachOverlay isOpen={isAIOpen} onClose={() => setIsAIOpen(false)} lang={lang} theme={themeColor} apiKey={userApiKey} />

      <LiveSessionWidget 
        activeSession={activeSession}
        elapsedTime={elapsedTime}
        visible={enableWidget && view !== 'RECORD'} 
        lang={lang}
        theme={themeColor}
        onRebuy={() => setIsRebuyModalOpen(true)}
        onEnd={() => setIsEndSessionModalOpen(true)}
        onRecordHand={() => setIsQuickRecording(true)}
      />

      {isRebuyModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/30 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in" onClick={() => setIsRebuyModalOpen(false)}>
           <div className="bg-white rounded-2xl p-6 w-full max-w-xs shadow-2xl" onClick={e => e.stopPropagation()}>
              <h3 className="font-bold text-lg mb-4">{t.live.rebuy}</h3>
              <input type="number" autoFocus value={widgetRebuyAmount} onChange={e => setWidgetRebuyAmount(e.target.value)} className="w-full p-3 glass-input rounded-xl mb-4 text-lg font-bold" placeholder={t.live.amount}/>
              <div className="flex gap-2">
                <button onClick={() => setIsRebuyModalOpen(false)} className="flex-1 py-2 bg-slate-100 rounded-lg font-bold">{t.common.cancel}</button>
                <button onClick={() => { handleRebuy(Number(widgetRebuyAmount)); setWidgetRebuyAmount(''); setIsRebuyModalOpen(false); }} className={`flex-1 py-2 bg-${themeColor}-600 text-white rounded-lg font-bold`}>{t.common.confirm}</button>
              </div>
           </div>
        </div>
      )}

      {isEndSessionModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setIsEndSessionModalOpen(false)}>
          <div className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-xl font-bold mb-4 text-slate-800">{t.live.endSession}</h3>
            <p className="text-slate-500 mb-4">{t.live.endSessionPrompt}</p>
            <input type="number" onChange={e => setWidgetRebuyAmount(e.target.value)} className="w-full p-4 text-2xl font-bold text-center rounded-xl border border-slate-300 mb-6 focus:ring-2 focus:ring-red-500 outline-none text-slate-900 placeholder-slate-400" placeholder="0" autoFocus />
            <div className="grid grid-cols-2 gap-3">
              <button onClick={() => setIsEndSessionModalOpen(false)} className="py-3 rounded-xl font-bold text-slate-600 hover:bg-slate-100">{t.common.cancel}</button>
              <button onClick={() => endSession(Number(widgetRebuyAmount))} className="py-3 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 shadow-lg shadow-red-200">{t.common.confirm}</button>
            </div>
          </div>
        </div>
      )}

      {(editingHand || isQuickRecording) && (
        <div className="fixed inset-0 z-50 bg-black/30 backdrop-blur-sm flex justify-center items-end sm:items-center p-0 sm:p-4 animate-fade-in" onClick={() => { setEditingHand(null); setIsQuickRecording(false); }}>
          <div className="bg-slate-50 w-full max-w-lg h-[90vh] sm:h-auto sm:rounded-3xl rounded-t-3xl flex flex-col shadow-2xl overflow-hidden" onClick={e => e.stopPropagation()}>
             <div className="flex-1 overflow-y-auto p-4">
               <HandRecorder 
                 initialHand={editingHand || undefined} 
                 sessionId={activeSession?.id}
                 sessionLocation={activeSession?.location}
                 onSave={(h) => { 
                    if (isQuickRecording) setHands(prev => [h, ...prev]); 
                    else updateHand(h); 
                    setIsQuickRecording(false); 
                 }} 
                 lang={lang} 
                 theme={themeColor}
                 apiKey={userApiKey}
                 isEditing={true} 
                 onClose={() => { setEditingHand(null); setIsQuickRecording(false); }} 
               />
               {editingHand && (
                 <div className="mt-6 pt-4 border-t border-slate-200">
                    <button onClick={() => deleteHand(editingHand.id)} className="w-full py-3 flex items-center justify-center gap-2 text-red-500 hover:bg-red-50 rounded-xl font-bold transition-colors"><Trash2 size={18} /> {t.common.delete}</button>
                 </div>
               )}
             </div>
          </div>
        </div>
      )}

      {isMenuOpen && (
        <div className="fixed inset-0 z-50 bg-black/20 backdrop-blur-sm flex justify-end animate-fade-in" onClick={() => setIsMenuOpen(false)}>
          <div className="w-72 bg-white h-full shadow-2xl p-6 flex flex-col" onClick={e => e.stopPropagation()}>
             <div className="flex justify-between items-center mb-8"><h2 className="font-bold text-lg text-slate-800 flex items-center gap-2"><SettingsIcon size={18}/> {t.settings.title}</h2><button onClick={() => setIsMenuOpen(false)}><X size={20}/></button></div>
             <div className="space-y-6 flex-1 overflow-y-auto pb-4">
                <div className="space-y-2"><label className="text-xs font-bold text-slate-400 uppercase flex items-center gap-2"><Globe size={12}/> {t.settings.language}</label><div className="grid grid-cols-2 gap-1 p-1 bg-slate-100 rounded-lg"><button onClick={() => setLang('zh')} className={`py-1.5 text-xs font-semibold rounded-md transition-all ${lang === 'zh' ? `bg-white shadow text-${themeColor}-600` : 'text-slate-500'}`}>中文</button><button onClick={() => setLang('en')} className={`py-1.5 text-xs font-semibold rounded-md transition-all ${lang === 'en' ? `bg-white shadow text-${themeColor}-600` : 'text-slate-500'}`}>English</button></div></div>
                
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 uppercase flex items-center gap-2"><PlusCircle size={12}/> {t.settings.apiKey}</label>
                  <input type="password" value={userApiKey} onChange={e => setUserApiKey(e.target.value)} className="w-full p-2 border border-slate-200 rounded-lg bg-slate-50 text-sm placeholder-slate-400" placeholder={t.settings.apiKeyPlaceholder} />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 uppercase flex items-center gap-2"><Cloud size={12}/> {t.settings.googleClientId}</label>
                  <input type="text" value={googleClientId} onChange={e => setGoogleClientId(e.target.value)} className="w-full p-2 border border-slate-200 rounded-lg bg-slate-50 text-sm placeholder-slate-400" placeholder={t.settings.googleClientIdPlaceholder} />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 uppercase flex items-center gap-2"><Palette size={12}/> {t.settings.theme}</label>
                  <div className="flex flex-wrap gap-2">
                    {THEME_OPTIONS.map((color) => (
                      <button key={color} onClick={() => setThemeColor(color)} className={`w-8 h-8 rounded-full flex items-center justify-center transition-all border-2 ${themeColor === color ? 'border-slate-600 scale-110' : 'border-transparent hover:scale-105'}`}>
                        <div className={`w-full h-full rounded-full bg-${color}-500`}></div>
                        {themeColor === color && <Check size={14} className="text-white absolute"/>}
                      </button>
                    ))}
                  </div>
                </div>
                
                <div className="space-y-2"><label className="text-xs font-bold text-slate-400 uppercase flex items-center gap-2"><CreditCard size={12}/> {t.settings.displayCurrency}</label><select value={userCurrency} onChange={(e) => setUserCurrency(e.target.value as Currency)} className="w-full p-2 border border-slate-200 rounded-lg bg-slate-50 text-sm">{Object.values(Currency).map(c => <option key={c} value={c}>{c}</option>)}</select></div>
                <div className="flex items-center justify-between">
                   <label className="text-xs font-bold text-slate-400 uppercase flex items-center gap-2"><Layout size={12}/> {t.settings.enableWidget}</label>
                   <button onClick={() => setEnableWidget(!enableWidget)} className={`w-10 h-5 rounded-full transition-colors relative ${enableWidget ? `bg-${themeColor}-600` : 'bg-slate-300'}`}>
                      <div className={`absolute top-1 left-1 w-3 h-3 bg-white rounded-full transition-transform ${enableWidget ? 'translate-x-5' : ''}`}></div>
                   </button>
                </div>
                <div className="space-y-3"><div className="flex justify-between items-center"><label className="text-xs font-bold text-slate-400 uppercase flex items-center gap-2"><RefreshCw size={12}/> {t.settings.exchangeRates}</label><button onClick={() => setExchangeRates(DEFAULT_RATES)} className={`text-[10px] text-${themeColor}-600 underline`}>{t.settings.resetRates}</button></div><div className="space-y-2">{Object.keys(exchangeRates).map((curr) => (<div key={curr} className="flex items-center gap-2"><div className="w-10 font-bold text-slate-600 text-xs">{curr}</div><input type="number" disabled={curr === 'USD'} value={exchangeRates[curr]} onChange={(e) => setExchangeRates({...exchangeRates, [curr]: parseFloat(e.target.value)})} className={`flex-1 p-1.5 rounded border border-slate-200 text-right text-xs ${curr === 'USD' ? 'bg-slate-100 text-slate-400' : 'bg-white text-slate-900'}`} step="0.01"/></div>))}</div></div>
             </div>
          </div>
        </div>
      )}

      <main className="p-4 max-w-3xl mx-auto pb-28">
        {view === 'REPORT' && (
           <>
            <h2 className="text-xl font-light text-slate-700 mb-4">{t.dashboard.reportTitle}</h2>
            <FilterBar filter={reportFilter} setFilter={setReportFilter} locations={locations} lang={lang} />
            <StatsDashboard sessions={filterSessions(sessions, reportFilter)} hands={hands} currency={userCurrency} rates={exchangeRates} lang={lang} themeColor={themeColor} />
           </>
        )}

        {view === 'RESULTS' && (
           <>
             <h2 className="text-xl font-light text-slate-700 mb-4">{t.history.title}</h2>
             <FilterBar filter={resultsFilter} setFilter={setResultsFilter} locations={locations} lang={lang} />
             <div className="space-y-3">
                {filterSessions(sessions, resultsFilter).sort((a,b) => b.startTime - a.startTime).map(s => (
                  <div key={s.id} className={`glass-panel p-4 rounded-xl flex justify-between items-center border-l-4 border-l-transparent hover:border-l-${themeColor}-500 transition-all`}>
                     <div>
                        <div className="font-bold text-slate-800">{s.location}</div>
                        <div className="text-xs text-slate-500 mt-1">{new Date(s.startTime).toLocaleDateString(lang === 'zh' ? 'zh-CN' : 'en-US')} • {s.blinds}</div>
                        <div className="text-[10px] text-slate-400 mt-0.5">{t.history.duration}: {(s.durationSeconds / 3600).toFixed(1)}h</div>
                     </div>
                     <div className="text-right">
                        {s.cashOut !== undefined ? (
                           <div className={`text-lg font-bold font-mono ${(s.cashOut - s.buyIn) >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                              {(s.cashOut - s.buyIn) > 0 ? '+' : ''}{s.cashOut - s.buyIn} <span className="text-[10px] text-slate-400 font-sans">{s.currency}</span>
                           </div>
                        ) : (<div className="text-green-600 font-bold text-xs px-2 py-1 bg-green-100 rounded-full animate-pulse">{t.history.ongoing}</div>)}
                     </div>
                  </div>
                ))}
                {sessions.length === 0 && <div className="text-center py-12 text-slate-400 italic">{t.history.noHistory}</div>}
             </div>
           </>
        )}

        {view === 'RECORD' && (
          activeSession ? (
             <LiveTracker activeSession={activeSession} elapsedTime={elapsedTime} togglePause={togglePause} handleRebuy={handleRebuy} endSession={endSession} openHandRecorder={(h: PokerHand) => setHands(prev => [h, ...prev])} lang={lang} theme={themeColor} apiKey={userApiKey} />
          ) : (
            recordMode === 'LANDING' ? (
              <div className="flex flex-col gap-4 pt-6 animate-fade-in">
                 <h2 className="text-xl font-light text-slate-700 mb-2">{t.live.landingTitle}</h2>
                 <button onClick={() => setRecordMode('START')} className={`h-40 bg-gradient-to-r from-${themeColor}-500 to-${themeColor === 'indigo' ? 'purple' : themeColor === 'blue' ? 'cyan' : 'orange'}-500 rounded-3xl flex flex-col items-center justify-center shadow-xl hover:scale-[1.02] transition-transform relative overflow-hidden group`}>
                    <div className="absolute right-[-20px] bottom-[-20px] opacity-20 transform rotate-12 w-40 h-40 rounded-full bg-white"></div>
                    <div className="absolute left-4 top-4 text-white/40"><PlayCircle size={24}/></div>
                    <div className="z-10 mb-2 w-16 h-16 rounded-full border-4 border-white/30 shadow-lg overflow-hidden bg-white/90"><img src={APP_LOGO} alt="Start" className="w-full h-full object-cover" /></div>
                    <div className="flex flex-col items-center text-white z-10"><span className="text-xl font-bold tracking-wide">{t.live.startNew}</span><span className="text-xs opacity-80 mt-1">Nice Hand!</span></div>
                 </button>
                 <button onClick={() => setRecordMode('PAST')} className={`h-24 bg-white border-2 border-dashed border-slate-300 rounded-3xl flex items-center justify-center hover:bg-slate-50 hover:border-${themeColor}-300 transition-all text-slate-500 hover:text-${themeColor}-600`}>
                    <div className="flex items-center gap-2 font-semibold"><PlusCircle size={20} /> {t.live.logPast}</div>
                 </button>
              </div>
            ) : recordMode === 'START' ? (
               <SessionSetup startSession={startSession} onBack={() => setRecordMode('LANDING')} userCurrency={userCurrency} lang={lang} theme={themeColor} />
            ) : (
               <>
                 <button onClick={() => setRecordMode('LANDING')} className={`flex items-center gap-1 text-slate-500 hover:text-${themeColor}-600 mb-4 font-medium`}><ChevronRight className="rotate-180" size={18}/> {t.common.back}</button>
                 <PastSessionForm onSave={savePastSession} onCancel={() => setRecordMode('LANDING')} userCurrency={userCurrency} lang={lang} theme={themeColor} />
               </>
            )
          )
        )}

        {view === 'HANDS' && (
          <div className="pb-20">
            <h2 className="text-xl font-light text-slate-700 mb-4">{t.nav.hands}</h2>
            <HandAnalysisStats hands={hands} lang={lang} />
            <div className="space-y-4">
               {hands.map(h => (
                 <div key={h.id} onClick={() => setEditingHand(h)} className={`glass-panel p-4 rounded-xl space-y-3 cursor-pointer border border-transparent hover:border-${themeColor}-300 transition-all`}>
                    <div className="flex justify-between items-start">
                       <div className="flex gap-1">
                          <div className="flex gap-1 mr-3">{h.holeCards.map(c => <CardDisplay key={c.id} card={c} size="sm" />)}</div>
                          {h.communityCards.length > 0 && (<div className="flex gap-1 pl-3 border-l border-slate-300">{h.communityCards.map(c => <CardDisplay key={c.id} card={c} size="sm" />)}</div>)}
                       </div>
                       <div className={`font-bold text-lg ${h.profit > 0 ? 'text-green-600' : h.profit < 0 ? 'text-red-500' : 'text-slate-500'}`}>{h.profit > 0 ? '+' : ''}{h.profit}</div>
                    </div>
                    <div className="flex justify-between items-end">
                       <div className="text-[10px] text-slate-400 bg-slate-100 px-2 py-1 rounded inline-flex items-center gap-1">
                         <MapPin size={10} /> {h.sessionLocation || t.common.unknown} {h.heroPosition ? `• ${h.heroPosition}` : ''} • {new Date(h.timestamp).toLocaleDateString(lang === 'zh' ? 'zh-CN' : 'en-US')}
                       </div>
                       {h.analysis && <BrainCircuit size={16} className={`text-${themeColor}-500`} />}
                    </div>
                 </div>
               ))}
               {hands.length === 0 && <div className="text-center py-12 text-slate-400 italic">{t.dashboard.noHands}</div>}
            </div>
          </div>
        )}

        {view === 'MORE' && (
           <div className="py-10 space-y-6 max-w-md mx-auto">
              <h2 className="text-2xl font-light text-slate-700 text-center">{t.more.title}</h2>
              
              {/* Google Drive Sync Section */}
              <div className="glass-panel p-6 rounded-3xl border border-slate-200/50 relative overflow-hidden">
                 <div className={`absolute top-0 left-0 w-1 h-full bg-${themeColor}-500`}></div>
                 <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                    <Cloud className={`text-${themeColor}-600`}/> {t.more.driveBackup}
                 </h3>
                 {!driveAccessToken ? (
                    <div className="text-center py-4">
                      <p className="text-xs text-slate-500 mb-4">
                         {lang === 'zh' ? '连接 Google Drive 以启用云端同步功能。' : 'Connect Google Drive to enable cloud sync.'}
                      </p>
                      <button onClick={handleDriveConnect} className={`px-6 py-2 bg-${themeColor}-600 text-white rounded-full font-bold text-sm shadow-lg`}>
                         {t.more.connectDrive}
                      </button>
                    </div>
                 ) : (
                    <div className="space-y-4">
                       <div className="flex items-center justify-between bg-slate-50 p-3 rounded-xl border border-slate-100">
                          <div className="flex items-center gap-2">
                             <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                             <span className="text-xs font-bold text-slate-600">{t.more.driveConnected}</span>
                          </div>
                          <button onClick={() => setDriveAccessToken(null)} className="text-[10px] text-red-400 underline">Disconnect</button>
                       </div>

                       <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-slate-500">{t.more.autoBackup}</span>
                          <button onClick={() => setEnableDriveBackup(!enableDriveBackup)} className={`w-10 h-5 rounded-full transition-colors relative ${enableDriveBackup ? `bg-${themeColor}-600` : 'bg-slate-300'}`}>
                              <div className={`absolute top-1 left-1 w-3 h-3 bg-white rounded-full transition-transform ${enableDriveBackup ? 'translate-x-5' : ''}`}></div>
                          </button>
                       </div>
                       
                       <div className="flex gap-2">
                          <button onClick={handleDriveRestore} className="flex-1 py-2 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-600 flex items-center justify-center gap-1">
                             <RefreshCcw size={12} /> {t.more.restoreDrive}
                          </button>
                       </div>

                       {lastBackupTime && (
                          <div className="text-center text-[10px] text-slate-400">
                             {t.more.lastBackup}: {new Date(lastBackupTime).toLocaleTimeString()} 
                             {isBackingUp && <span className={`ml-2 text-${themeColor}-500`}>{t.common.loading}</span>}
                          </div>
                       )}
                    </div>
                 )}
              </div>

              <div className="glass-panel p-6 rounded-3xl border border-slate-200/50">
                 <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                    <FileText className={`text-${themeColor}-600`}/> {lang === 'zh' ? '本地文件备份' : 'Local File Backup'}
                 </h3>
                 <div className="grid grid-cols-2 gap-4">
                    <button onClick={handleExport} className={`flex flex-col items-center gap-2 p-4 rounded-xl bg-${themeColor}-50 border border-${themeColor}-100 text-${themeColor}-700 hover:bg-${themeColor}-100 transition-colors`}>
                       <Download size={24} />
                       <span className="text-xs font-bold">{lang === 'zh' ? '导出备份' : 'Export'}</span>
                    </button>
                    <button onClick={handleImportClick} className="flex flex-col items-center gap-2 p-4 rounded-xl bg-slate-50 border border-slate-200 text-slate-600 hover:bg-slate-100 transition-colors relative">
                       <Upload size={24} />
                       <span className="text-xs font-bold">{lang === 'zh' ? '导入数据' : 'Import'}</span>
                       <input type="file" ref={fileInputRef} onChange={handleFileChange} accept=".json" className="absolute inset-0 opacity-0 cursor-pointer" />
                    </button>
                 </div>
              </div>

              <div className="opacity-50 grayscale pointer-events-none">
                <div className="glass-panel p-6 rounded-2xl flex items-center justify-between mb-4">
                   <div className="flex items-center gap-3">
                      <CreditCard size={20} className="text-slate-400"/>
                      <span className="font-bold text-slate-500">{t.more.debt}</span>
                   </div>
                   <span className="text-[10px] bg-slate-100 px-2 py-1 rounded text-slate-400">Coming Soon</span>
                </div>
              </div>
              <div className="text-center pt-8"><p className="text-[10px] text-slate-300 uppercase tracking-widest">HAO牌 v1.0.1 Final</p></div>
           </div>
        )}
      </main>
      <div className="fixed bottom-6 left-4 right-4 bg-white/90 backdrop-blur-lg rounded-3xl flex justify-between items-center px-6 py-3 shadow-2xl z-40 max-w-md mx-auto border border-white/50 ring-1 ring-black/5">
         <NavBtn icon={PieChart} label={t.nav.report} isActive={view === 'REPORT'} onClick={() => setView('REPORT')} theme={themeColor} />
         <NavBtn icon={Trophy} label={t.nav.results} isActive={view === 'RESULTS'} onClick={() => setView('RESULTS')} theme={themeColor} />
         <div className="relative -top-6 group">
            <button onClick={() => setView('RECORD')} className={`w-16 h-16 rounded-full flex items-center justify-center shadow-${themeColor}-500/30 shadow-lg transition-all transform group-hover:scale-105 group-active:scale-95 ${view === 'RECORD' ? `bg-${themeColor}-600 text-white ring-4 ring-${themeColor}-100` : `bg-white text-${themeColor}-600 border border-slate-100`}`}>
              <PlayCircle size={32} strokeWidth={2.5} fill={view === 'RECORD' ? 'transparent' : 'currentColor'} className={view === 'RECORD' ? '' : `text-${themeColor}-50`} />
              {view !== 'RECORD' && <PlayCircle size={32} className={`absolute text-${themeColor}-600`} strokeWidth={1.5}/>}
            </button>
         </div>
         <NavBtn icon={Layers} label={t.nav.hands} isActive={view === 'HANDS'} onClick={() => setView('HANDS')} theme={themeColor} />
         <NavBtn icon={MoreHorizontal} label={t.nav.more} isActive={view === 'MORE'} onClick={() => setView('MORE')} theme={themeColor} />
      </div>
    </div>
  );
};

const NavBtn = ({ icon: Icon, label, isActive, onClick, theme }: any) => (
  <button onClick={onClick} className={`flex flex-col items-center justify-center w-12 gap-1 transition-all duration-300 ${isActive ? `text-${theme}-600` : 'text-slate-400 hover:text-slate-600'}`}>
    <Icon size={22} strokeWidth={isActive ? 2.5 : 2} className={`transition-transform duration-300 ${isActive ? '-translate-y-1' : ''}`} />
    <span className={`text-[9px] font-bold transition-opacity duration-300 ${isActive ? 'opacity-100' : 'opacity-0 h-0'}`}>{label}</span>
  </button>
);

export default App;