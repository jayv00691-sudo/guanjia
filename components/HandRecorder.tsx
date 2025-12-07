import React, { useState, useMemo } from 'react';
import { X, PlusCircle, Clock, ChevronUp, ChevronDown, BrainCircuit, Trash2, TrendingUp, TrendingDown } from 'lucide-react';
import { PokerHand, CardData, Villain, Language, ThemeColor } from '../types';
import { translations } from '../translations';
import { CompactCardKeyboard, CardDisplay } from './CardSelector';
import { analyzeHand } from '../services/geminiService';

const POSITIONS = ['SB', 'BB', 'UTG', 'UTG+1', 'MP', 'HJ', 'CO', 'BTN'];

const getHandLabel = (cards: CardData[]): string => {
  if (cards.length !== 2) return "Unknown";
  
  const rankValues: {[key: string]: number} = { 
    'A': 14, 'K': 13, 'Q': 12, 'J': 11, 'T': 10, 
    '9': 9, '8': 8, '7': 7, '6': 6, '5': 5, '4': 4, '3': 3, '2': 2 
  };

  const r1 = cards[0].rank;
  const r2 = cards[1].rank;
  const s1 = cards[0].suit;
  const s2 = cards[1].suit;
  const v1 = rankValues[r1];
  const v2 = rankValues[r2];

  if (v1 === v2) return `${r1}${r2}`; // Pair
  
  // High card first
  const first = v1 > v2 ? r1 : r2;
  const second = v1 > v2 ? r2 : r1;
  const suited = s1 === s2 ? 's' : 'o';
  
  return `${first}${second}${suited}`;
};

export const HandAnalysisStats = ({ hands, lang }: { hands: PokerHand[], lang: Language }) => {
  const t = translations[lang];
  const stats = useMemo(() => {
    const groups: {[key: string]: { count: number, profit: number, label: string }} = {};
    hands.forEach(h => {
      const label = getHandLabel(h.holeCards);
      if (label === 'Unknown') return;
      if (!groups[label]) groups[label] = { count: 0, profit: 0, label };
      groups[label].count += 1;
      groups[label].profit += h.profit;
    });
    const sorted = Object.values(groups).sort((a, b) => b.profit - a.profit);
    const best = sorted.slice(0, 3);
    const worst = sorted.reverse().slice(0, 3);
    return { best, worst };
  }, [hands]);

  if (hands.length === 0) return null;
  const StatRow = ({ item, type }: any) => (
    <div className="flex justify-between items-center text-xs py-1.5 border-b border-slate-50 last:border-0">
      <div className="flex items-center gap-2">
        <span className="font-bold font-mono bg-slate-200 px-1.5 py-0.5 rounded text-slate-700 w-10 text-center">{item.label}</span>
        <span className="text-slate-400 scale-90">{item.count} {t.hand.count}</span>
      </div>
      <span className={`font-bold ${type === 'win' ? 'text-green-600' : 'text-red-500'}`}>
        {item.profit > 0 ? '+' : ''}{item.profit}
      </span>
    </div>
  );
  return (
    <div className="grid grid-cols-2 gap-3 mb-4">
      <div className="bg-green-50 border border-green-100 rounded-xl p-3">
         <h4 className="text-xs font-bold text-green-700 mb-2 flex items-center gap-1"><TrendingUp size={12}/> {t.hand.bestHands}</h4>
         {stats.best.length > 0 ? stats.best.map((s, i) => <StatRow key={i} item={s} type="win" />) : <div className="text-[10px] text-slate-400">-</div>}
      </div>
      <div className="bg-red-50 border border-red-100 rounded-xl p-3">
         <h4 className="text-xs font-bold text-red-700 mb-2 flex items-center gap-1"><TrendingDown size={12}/> {t.hand.worstHands}</h4>
         {stats.worst.length > 0 ? stats.worst.map((s, i) => <StatRow key={i} item={s} type="lose" />) : <div className="text-[10px] text-slate-400">-</div>}
      </div>
    </div>
  );
};

const CardSlot = ({ cards, max, label, active, onClick, onDelete, theme }: any) => (
    <div 
      onClick={onClick}
      className={`flex flex-col gap-1 p-1.5 rounded-xl transition-all border ${active ? `bg-${theme}-50 border-${theme}-300 ring-1 ring-${theme}-200 shadow-sm` : 'bg-white/60 border-slate-200 hover:bg-white'}`}
    >
      <span className={`text-[9px] font-bold uppercase tracking-wider ${active ? `text-${theme}-600` : 'text-slate-400'}`}>{label}</span>
      <div className="flex gap-1 min-h-[44px] justify-center">
        {cards.map((c: CardData) => <CardDisplay key={c.id} card={c} size="sm" onClick={() => onDelete(c.id)} />)}
        {Array.from({ length: max - cards.length }).map((_, i) => (
          <div key={i} className="w-8 h-11 rounded border border-dashed border-slate-300 flex items-center justify-center text-slate-300 text-xs bg-white/40">
             +
          </div>
        ))}
      </div>
    </div>
);

export const HandRecorder = ({ 
  sessionId, 
  sessionLocation, 
  onSave, 
  initialHand, 
  lang, 
  theme,
  apiKey,
  isEditing = false, 
  onClose 
}: { 
  sessionId?: string, 
  sessionLocation?: string,
  onSave: (h: PokerHand) => void, 
  initialHand?: PokerHand, 
  lang: Language,
  theme: ThemeColor,
  apiKey?: string,
  isEditing?: boolean,
  onClose?: () => void
}) => {
  const t = translations[lang];
  
  // State
  const [holeCards, setHoleCards] = useState<CardData[]>(initialHand?.holeCards || []);
  const [boardCards, setBoardCards] = useState<CardData[]>(initialHand?.communityCards || []);
  const [villains, setVillains] = useState<Villain[]>(initialHand?.villains || [{ id: 'v1', name: 'V1', cards: [] }]);
  const [profit, setProfit] = useState(initialHand?.profit?.toString() || '');
  const [streetActions, setStreetActions] = useState(initialHand?.streetActions || '');
  const [note, setNote] = useState(initialHand?.note || '');
  const [heroPosition, setHeroPosition] = useState(initialHand?.heroPosition || '');
  const [analysisResult, setAnalysisResult] = useState<string | null>(initialHand?.analysis || null);
  const [analyzing, setAnalyzing] = useState(false);
  
  const [target, setTarget] = useState<'HERO' | 'BOARD' | string>('HERO'); 
  const [showDetails, setShowDetails] = useState(isEditing);

  const handleCardInput = (card: CardData) => {
    if (target === 'HERO') {
      if (holeCards.length < 2) setHoleCards([...holeCards, card]);
    } else if (target === 'BOARD') {
      if (boardCards.length < 5) setBoardCards([...boardCards, card]);
    } else {
      setVillains(prev => prev.map(v => {
        if (v.id === target && v.cards.length < 2) return { ...v, cards: [...v.cards, card] };
        return v;
      }));
    }
  };

  const removeCard = (id: string, fromTarget: string) => {
    if (fromTarget === 'HERO') setHoleCards(holeCards.filter(c => c.id !== id));
    else if (fromTarget === 'BOARD') setBoardCards(boardCards.filter(c => c.id !== id));
    else setVillains(prev => prev.map(v => v.id === fromTarget ? { ...v, cards: v.cards.filter(c => c.id !== id) } : v));
  };

  const addVillain = () => {
    const id = `v${villains.length + 1}`;
    setVillains([...villains, { id, name: `V${villains.length + 1}`, cards: [] }]);
    setTarget(id);
  };

  const appendAction = (tag: string) => {
    setStreetActions(prev => {
      const needsSep = prev.length > 0 && !prev.endsWith('; ');
      return prev + (needsSep ? ', ' : '') + tag;
    });
  };

  const handleSave = async (requestAI: boolean = false) => {
    const hand: PokerHand = {
      id: initialHand?.id || `hand_${Date.now()}`,
      sessionId,
      sessionLocation,
      timestamp: initialHand?.timestamp || Date.now(),
      holeCards,
      communityCards: boardCards,
      villains,
      heroPosition,
      profit: Number(profit) || 0,
      streetActions,
      note,
      analysis: analysisResult || undefined
    };

    if (requestAI) {
      setAnalyzing(true);
      const result = await analyzeHand(hand, lang, apiKey);
      hand.analysis = result;
      setAnalysisResult(result);
      setAnalyzing(false);
    }
    
    onSave(hand);
    if (!isEditing) reset();
    if (isEditing && onClose) onClose();
  };

  const reset = () => {
    setHoleCards([]);
    setBoardCards([]);
    setVillains([{ id: 'v1', name: 'V1', cards: [] }]);
    setProfit('');
    setStreetActions('');
    setNote('');
    setHeroPosition('');
    setTarget('HERO');
    setAnalysisResult(null);
    setShowDetails(false);
  };

  return (
    <div className={`animate-fade-in ${isEditing ? 'h-full flex flex-col' : ''}`}>
      {isEditing && (
        <div className="flex justify-between items-center mb-4 pb-4 border-b border-slate-100">
          <h3 className="font-bold text-lg text-slate-800">{t.hand.editHand}</h3>
          <button onClick={onClose}><X className="text-slate-400" /></button>
        </div>
      )}
      <div className="flex flex-col gap-2 mb-2">
        <div className="flex gap-2 items-start">
          <div className="flex-shrink-0 flex flex-col gap-2">
             <CardSlot label={t.hand.hero} cards={holeCards} max={2} active={target === 'HERO'} onClick={() => setTarget('HERO')} onDelete={(id: string) => removeCard(id, 'HERO')} theme={theme} />
             <div className="overflow-x-auto w-full max-w-[110px] scrollbar-hide flex gap-1">
                {POSITIONS.map(pos => (
                  <button key={pos} onClick={() => setHeroPosition(pos)} className={`text-[9px] px-2 py-1 rounded border flex-shrink-0 ${heroPosition === pos ? `bg-${theme}-600 text-white border-${theme}-600` : 'bg-white text-slate-500 border-slate-200'}`}>{pos}</button>
                ))}
             </div>
          </div>
          <div className="flex-1 overflow-x-auto scrollbar-hide flex gap-2">
             {villains.map(v => (
                <div key={v.id} className="flex-shrink-0">
                   <CardSlot label={v.name} cards={v.cards} max={2} active={target === v.id} onClick={() => setTarget(v.id)} onDelete={(id: string) => removeCard(id, v.id)} theme={theme} />
                </div>
             ))}
             <button onClick={addVillain} className={`w-8 h-[72px] rounded-xl bg-slate-100 text-slate-400 flex items-center justify-center hover:bg-${theme}-100 hover:text-${theme}-600 transition-colors border border-slate-200`}><PlusCircle size={18}/></button>
          </div>
        </div>
        <div className="flex justify-center">
           <div className="w-full">
             <CardSlot label={t.hand.board} cards={boardCards} max={5} active={target === 'BOARD'} onClick={() => setTarget('BOARD')} onDelete={(id: string) => removeCard(id, 'BOARD')} theme={theme} />
           </div>
        </div>
      </div>
      <div className="mb-3">
         <CompactCardKeyboard onSelect={handleCardInput} />
      </div>
      <div className="flex gap-3 mb-3">
         <div className="flex-1 relative">
            <span className="absolute left-3 top-3 text-slate-400 text-xs font-bold">$</span>
            <input type="number" value={profit} onChange={e => setProfit(e.target.value)} placeholder={t.hand.profitInput} className={`w-full pl-6 pr-3 py-3 glass-input rounded-xl text-slate-900 font-mono font-bold outline-none focus:ring-2 focus:ring-${theme}-500`} />
         </div>
         <button onClick={() => setShowDetails(!showDetails)} className={`px-3 rounded-xl border border-slate-200 flex items-center gap-1 text-xs font-bold ${showDetails ? `bg-${theme}-50 text-${theme}-600 border-${theme}-200` : 'bg-white text-slate-500'}`}>
            {showDetails ? <ChevronUp size={16}/> : <ChevronDown size={16}/>} {t.hand.details}
         </button>
      </div>
      {showDetails && (
        <div className="space-y-3 animate-fade-in bg-white/40 p-3 rounded-xl border border-white/50 mb-3">
           <div>
             <div className="flex justify-between items-center mb-1">
               <label className="text-[10px] font-bold text-slate-400 uppercase">{t.hand.street}</label>
               <button onClick={() => setStreetActions('')} className="text-[10px] text-slate-400 underline">{t.common.reset}</button>
             </div>
             <div className="flex flex-wrap gap-1.5 mb-2">
                {[t.hand.pre, t.hand.flop, t.hand.turn, t.hand.river].map(s => 
                  <button key={s} onClick={() => appendAction(`${s}: `)} className="px-2 py-1 bg-slate-800 text-white text-[10px] rounded font-bold">{s}</button>
                )}
                <div className="w-[1px] bg-slate-300 mx-1"></div>
                {[t.hand.bet, t.hand.call, t.hand.raise, t.hand.check, t.hand.fold, t.hand.allin].map(a => 
                  <button key={a} onClick={() => appendAction(a)} className="px-2 py-1 bg-white border border-slate-200 text-slate-700 text-[10px] rounded font-medium hover:bg-slate-50">{a}</button>
                )}
             </div>
             <textarea value={streetActions} onChange={e => setStreetActions(e.target.value)} className="w-full p-2 glass-input rounded-lg text-xs text-slate-900 h-16 outline-none" placeholder="e.g. Pre: Raise 20, Call..." />
           </div>
           <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase mb-1">{t.common.notes}</label>
              <input value={note} onChange={e => setNote(e.target.value)} className="w-full p-2 glass-input rounded-lg text-xs text-slate-900 outline-none" placeholder="..." />
           </div>
           {analysisResult && (
             <div className={`bg-${theme}-50 border border-${theme}-100 p-3 rounded-xl text-xs text-${theme}-900 mt-2 leading-relaxed`}>
               <div className={`font-bold flex items-center gap-1 mb-1 text-${theme}-700`}><BrainCircuit size={12}/> {t.hand.analysisTitle}</div>
               {analysisResult}
             </div>
           )}
        </div>
      )}
      <div className="grid grid-cols-2 gap-3 mt-auto">
         <button onClick={() => handleSave(false)} className="py-3 bg-slate-200 text-slate-800 rounded-xl font-bold text-sm hover:bg-slate-300 transition-colors">{t.hand.quickSave}</button>
         <button onClick={() => handleSave(true)} disabled={analyzing} className={`py-3 bg-${theme}-600 text-white rounded-xl font-bold text-sm flex justify-center items-center gap-2 hover:bg-${theme}-700 shadow-lg transition-colors disabled:opacity-70`}>
           {analyzing ? <Clock className="animate-spin" size={16}/> : <BrainCircuit size={16}/>} {analyzing ? t.hand.thinking : t.hand.aiAnalysis}
         </button>
      </div>
    </div>
  );
};
