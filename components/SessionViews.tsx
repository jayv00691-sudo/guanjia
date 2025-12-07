import React, { useState } from 'react';
import { 
  PlayCircle, PlusCircle, PauseCircle, StopCircle, X, Layout, 
  FileText, MapPin, CreditCard, ChevronRight 
} from 'lucide-react';
import { Currency, PokerSession, PokerHand, Language, ThemeColor } from '../types';
import { translations } from '../translations';
import { HandRecorder } from './HandRecorder';

export const SessionSetup = ({ startSession, onBack, userCurrency, lang, theme }: any) => {
  const [loc, setLoc] = useState('');
  const [blinds, setBlinds] = useState('5/10');
  const [isCustomBlinds, setIsCustomBlinds] = useState(false);
  const [customBlindsVal, setCustomBlindsVal] = useState('');
  const [buyIn, setBuyIn] = useState('');
  const [curr, setCurr] = useState<Currency>(userCurrency);
  const [startTimeStr, setStartTimeStr] = useState(() => {
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    return now.toISOString().slice(0, 16);
  });
  const t = translations[lang];
  const presets = ['5/10', '10/20', '25/50'];
  const handleStart = () => {
    const startTs = new Date(startTimeStr).getTime();
    startSession(loc, isCustomBlinds ? customBlindsVal : blinds, Number(buyIn), curr, startTs);
  };
  return (
    <div className="max-w-md mx-auto pt-4 animate-fade-in pb-24 space-y-6">
       <button onClick={onBack} className={`flex items-center gap-1 text-slate-500 hover:text-${theme}-600 mb-2 font-medium`}><ChevronRight className="rotate-180" size={18}/> {t.common.back}</button>
       <div className="glass-panel p-6 rounded-3xl">
          <h2 className="text-xl font-bold mb-5 text-slate-800 flex items-center gap-2 border-b border-slate-200 pb-3">
            <PlayCircle className={`text-${theme}-600`} /> {t.live.startGame}
          </h2>
          <div className="space-y-5">
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase mb-1">{t.live.location}</label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3 text-slate-400" size={16} />
                <input type="text" value={loc} onChange={e => setLoc(e.target.value)} className={`w-full p-3 pl-10 rounded-xl glass-input focus:outline-none focus:ring-2 focus:ring-${theme}-500 transition-all text-slate-900 placeholder-slate-500`} placeholder="Casino..." />
              </div>
            </div>
            <div>
               <label className="block text-xs font-bold text-slate-400 uppercase mb-1">{t.live.startTime}</label>
               <input type="datetime-local" value={startTimeStr} onChange={e => setStartTimeStr(e.target.value)} className="w-full p-3 rounded-xl glass-input text-slate-900" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase mb-2">{t.live.blinds}</label>
              <div className="flex gap-2 mb-2">
                {presets.map(b => (
                  <button key={b} onClick={() => {setBlinds(b); setIsCustomBlinds(false)}} className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all border ${!isCustomBlinds && blinds === b ? `bg-${theme}-600 text-white border-${theme}-600 shadow-md` : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'}`}>{b}</button>
                ))}
                <button onClick={() => {setIsCustomBlinds(true); setBlinds('')}} className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all border ${isCustomBlinds ? `bg-${theme}-600 text-white border-${theme}-600 shadow-md` : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'}`}>{t.live.custom}</button>
              </div>
              {isCustomBlinds && (
                 <input type="text" value={customBlindsVal} onChange={e => setCustomBlindsVal(e.target.value)} className={`w-full p-2 rounded-lg glass-input text-center font-mono animate-fade-in focus:ring-2 focus:ring-${theme}-500 outline-none text-slate-900 placeholder-slate-500`} placeholder="e.g. 50/100" autoFocus />
              )}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                 <label className="block text-xs font-bold text-slate-400 uppercase mb-1">{t.live.buyIn}</label>
                 <input type="number" value={buyIn} onChange={e => setBuyIn(e.target.value)} className={`w-full p-3 rounded-xl glass-input focus:outline-none focus:ring-2 focus:ring-${theme}-500 text-slate-900 placeholder-slate-500`} placeholder="0" />
              </div>
              <div>
                 <label className="block text-xs font-bold text-slate-400 uppercase mb-1">{t.live.currency}</label>
                 <select value={curr} onChange={(e) => setCurr(e.target.value as Currency)} className={`w-full p-3 rounded-xl glass-input focus:outline-none focus:ring-2 focus:ring-${theme}-500 appearance-none bg-white text-slate-900`}>
                   {Object.values(Currency).map(c => <option key={c} value={c}>{c}</option>)}
                 </select>
              </div>
            </div>
            <button onClick={handleStart} disabled={!loc || !buyIn || (isCustomBlinds && !customBlindsVal)} className={`w-full mt-2 py-4 bg-gradient-to-r from-${theme}-600 to-purple-600 hover:from-${theme}-700 hover:to-purple-700 text-white rounded-2xl font-bold shadow-lg shadow-${theme}-200 transition-all transform active:scale-95 disabled:opacity-50 disabled:scale-100`}>
              {t.live.startBtn}
            </button>
          </div>
       </div>
    </div>
  );
};

export const PastSessionForm = ({ onSave, onCancel, userCurrency, lang, theme }: any) => {
  const t = translations[lang];
  const [loc, setLoc] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [duration, setDuration] = useState('');
  const [blinds, setBlinds] = useState('5/10');
  const [buyIn, setBuyIn] = useState('');
  const [cashOut, setCashOut] = useState('');
  const [curr, setCurr] = useState<Currency>(userCurrency);

  const handleSave = () => {
    const startTime = new Date(date).getTime() + 12 * 3600 * 1000; // Default to noon
    const durSecs = Number(duration) * 3600;
    const newSession: PokerSession = {
      id: `session_past_${Date.now()}`,
      location: loc,
      startTime,
      endTime: startTime + durSecs * 1000,
      blinds,
      buyIn: Number(buyIn),
      cashOut: Number(cashOut),
      currency: curr,
      durationSeconds: durSecs,
      isLive: false,
      pauses: []
    };
    onSave(newSession);
  };

  return (
    <div className="glass-panel p-6 rounded-3xl animate-fade-in">
       <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2"><FileText size={20} className={`text-${theme}-600`}/> {t.live.logPast}</h2>
       <div className="space-y-4">
          <div>
             <label className="block text-xs font-bold text-slate-400 uppercase mb-1">{t.live.location}</label>
             <input type="text" value={loc} onChange={e => setLoc(e.target.value)} className={`w-full p-3 rounded-xl glass-input text-slate-900 placeholder-slate-500 focus:ring-${theme}-500`} placeholder="Casino..." />
          </div>
          <div className="grid grid-cols-2 gap-4">
             <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-1">{t.live.pastDate}</label>
                <input type="date" value={date} onChange={e => setDate(e.target.value)} className="w-full p-3 rounded-xl glass-input text-slate-900" />
             </div>
             <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-1">{t.live.pastDuration}</label>
                <input type="number" value={duration} onChange={e => setDuration(e.target.value)} className="w-full p-3 rounded-xl glass-input text-slate-900 placeholder-slate-500" placeholder="Hours" />
             </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
             <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-1">{t.live.blinds}</label>
                <input type="text" value={blinds} onChange={e => setBlinds(e.target.value)} className="w-full p-3 rounded-xl glass-input text-slate-900 placeholder-slate-500" placeholder="5/10" />
             </div>
             <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-1">{t.live.currency}</label>
                <select value={curr} onChange={(e) => setCurr(e.target.value as Currency)} className="w-full p-3 rounded-xl glass-input text-slate-900">
                   {Object.values(Currency).map(c => <option key={c} value={c}>{c}</option>)}
                </select>
             </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
             <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-1">{t.live.buyIn}</label>
                <input type="number" value={buyIn} onChange={e => setBuyIn(e.target.value)} className="w-full p-3 rounded-xl glass-input text-slate-900 placeholder-slate-500" placeholder="0" />
             </div>
             <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-1">{t.live.pastProfit}</label>
                <input type="number" value={cashOut} onChange={e => setCashOut(e.target.value)} className="w-full p-3 rounded-xl glass-input text-slate-900 placeholder-slate-500" placeholder="0" />
             </div>
          </div>
          <div className="flex gap-3 pt-2">
             <button onClick={onCancel} className="flex-1 py-3 rounded-xl bg-slate-100 text-slate-600 font-bold">{t.common.cancel}</button>
             <button onClick={handleSave} disabled={!loc || !buyIn || !cashOut} className={`flex-1 py-3 rounded-xl bg-${theme}-600 text-white font-bold shadow-lg disabled:opacity-50`}>{t.common.save}</button>
          </div>
       </div>
    </div>
  );
};

export const LiveTracker = ({ activeSession, elapsedTime, togglePause, handleRebuy, endSession, openHandRecorder, lang, theme, apiKey }: any) => {
  const t = translations[lang];
  const isPaused = activeSession.pauses.length > 0 && !activeSession.pauses[activeSession.pauses.length - 1].end;
  const [showRebuy, setShowRebuy] = useState(false);
  const [showCashout, setShowCashout] = useState(false);
  const [rebuyAmt, setRebuyAmt] = useState('');
  const [cashoutAmt, setCashoutAmt] = useState('');

  return (
    <div className="max-w-lg mx-auto space-y-6 pb-24 animate-fade-in">
      <div className="glass-panel p-6 rounded-3xl relative overflow-hidden">
        <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-${theme}-500 to-purple-500`}></div>
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 className="text-xl font-bold text-slate-800">{activeSession.location}</h2>
            <p className="text-sm text-slate-500 font-mono">{activeSession.blinds} {activeSession.currency}</p>
          </div>
          <div className={`px-3 py-1 rounded-full text-xs font-bold ${isPaused ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'} flex items-center gap-1`}>
            <div className={`w-2 h-2 rounded-full ${isPaused ? 'bg-yellow-500' : 'bg-green-500 animate-pulse'}`}></div>
            {isPaused ? t.live.pause : t.history.ongoing}
          </div>
        </div>
        <div className="text-center py-4">
          <div className="text-5xl font-mono font-bold text-slate-800 tracking-wider mb-2">{elapsedTime}</div>
          <div className="text-sm text-slate-500 uppercase tracking-widest">{t.live.duration}</div>
        </div>
        <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t border-slate-200">
          <div>
            <p className="text-xs text-slate-500 uppercase">{t.live.totalBuyIn}</p>
            <p className="text-xl font-bold text-slate-800">{activeSession.buyIn}</p>
          </div>
          <div className="text-right">
             <button onClick={() => setShowRebuy(!showRebuy)} className={`text-sm text-${theme}-600 hover:text-${theme}-800 font-semibold flex items-center justify-end gap-1 ml-auto`}>
               <PlusCircle size={16} /> {t.live.rebuy}
             </button>
          </div>
        </div>
        {showRebuy && (
          <div className="mt-4 flex gap-2 animate-fade-in">
            <input type="number" value={rebuyAmt} onChange={e => setRebuyAmt(e.target.value)} className={`flex-1 p-2 rounded-lg glass-input text-sm text-slate-900 placeholder-slate-500 focus:ring-2 focus:ring-${theme}-500 outline-none`} placeholder={t.live.amount} />
            <button onClick={() => { handleRebuy(Number(rebuyAmt)); setRebuyAmt(''); setShowRebuy(false); }} className="px-4 py-2 bg-slate-800 text-white rounded-lg text-sm font-bold">{t.live.add}</button>
          </div>
        )}
      </div>
      <div className="grid grid-cols-2 gap-4">
         <button onClick={togglePause} className={`p-4 rounded-2xl flex flex-col items-center gap-2 transition-all ${isPaused ? 'bg-green-100 text-green-800 border border-green-200' : 'bg-yellow-50 text-yellow-800 border border-yellow-200'}`}>
            {isPaused ? <PlayCircle size={32} /> : <PauseCircle size={32} />}
            <span className="font-bold">{isPaused ? t.live.resume : t.live.pause}</span>
         </button>
         <button onClick={() => setShowCashout(true)} className="p-4 bg-red-50 text-red-800 border border-red-200 rounded-2xl flex flex-col items-center gap-2 hover:bg-red-100 transition-all">
            <StopCircle size={32} />
            <span className="font-bold">{t.live.cashOut}</span>
         </button>
      </div>
      <div className={`glass-panel p-5 rounded-3xl border-t-4 border-${theme}-500 animate-fade-in`}>
          <div className="flex justify-between items-center mb-2">
            <h3 className="font-bold text-slate-800">{t.hand.recorder}</h3>
          </div>
          <HandRecorder 
            sessionId={activeSession.id} 
            sessionLocation={activeSession.location}
            onSave={openHandRecorder} 
            lang={lang} 
            theme={theme}
            apiKey={apiKey}
          />
      </div>
      {showCashout && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={(e) => e.stopPropagation()}>
          <div className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-xl font-bold mb-4 text-slate-800">{t.live.endSession}</h3>
            <p className="text-slate-500 mb-4">{t.live.endSessionPrompt}</p>
            <input type="number" value={cashoutAmt} onChange={e => setCashoutAmt(e.target.value)} className="w-full p-4 text-2xl font-bold text-center rounded-xl border border-slate-300 mb-6 focus:ring-2 focus:ring-red-500 outline-none text-slate-900 placeholder-slate-400" placeholder="0" autoFocus />
            <div className="grid grid-cols-2 gap-3">
              <button onClick={() => setShowCashout(false)} className="py-3 rounded-xl font-bold text-slate-600 hover:bg-slate-100">{t.common.cancel}</button>
              <button onClick={() => endSession(Number(cashoutAmt))} className="py-3 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 shadow-lg shadow-red-200">{t.common.confirm}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export const LiveSessionWidget = ({ activeSession, elapsedTime, onRebuy, onEnd, onRecordHand, visible, lang, theme }: any) => {
  const [expanded, setExpanded] = useState(false);
  const t = translations[lang];
  if (!visible || !activeSession) return null;
  return (
    <div className={`fixed bottom-24 right-4 z-50 flex flex-col items-end transition-all ${expanded ? 'gap-2' : ''}`}>
      {expanded && (
        <div className="flex flex-col gap-2 mb-2 animate-fade-in items-end">
           <button onClick={() => { onRecordHand(); setExpanded(false); }} className={`flex items-center gap-2 px-4 py-2 bg-white text-${theme}-600 rounded-full shadow-lg font-bold text-sm border border-${theme}-100`}>
              <PlusCircle size={16} /> {t.nav.record}
           </button>
           <button onClick={() => { onRebuy(); setExpanded(false); }} className="flex items-center gap-2 px-4 py-2 bg-white text-slate-700 rounded-full shadow-lg font-bold text-sm border border-slate-200">
              <CreditCard size={16} /> {t.live.rebuy}
           </button>
           <button onClick={() => { onEnd(); setExpanded(false); }} className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-full shadow-lg font-bold text-sm border border-red-100">
              <StopCircle size={16} /> {t.common.close}
           </button>
        </div>
      )}
      <button 
        onClick={() => setExpanded(!expanded)} 
        className={`flex items-center gap-3 pl-4 pr-2 py-2 rounded-full shadow-xl transition-all border ${expanded ? 'bg-slate-800 text-white border-slate-700' : `bg-${theme}-600 text-white border-${theme}-500`}`}
      >
        <div className="flex flex-col items-start">
           <span className="text-[10px] uppercase opacity-80 leading-none">{t.history.ongoing}</span>
           <span className="font-mono font-bold text-sm leading-none mt-0.5">{elapsedTime}</span>
        </div>
        <div className="p-1.5 bg-white/20 rounded-full">
           {expanded ? <X size={16}/> : <Layout size={16}/>}
        </div>
      </button>
    </div>
  );
};
