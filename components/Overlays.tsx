import React, { useState, useEffect, useRef } from 'react';
import { Calendar, MapPin, Bot, X, Send } from 'lucide-react';
import { FilterState, TimeFilter, Language, ThemeColor } from '../types';
import { translations } from '../translations';
import { chatWithPokerCoach } from '../services/geminiService';

export const FilterBar = ({ filter, setFilter, locations, lang }: { filter: FilterState, setFilter: (f: FilterState) => void, locations: string[], lang: Language }) => {
  const t = translations[lang];
  return (
    <div className="flex gap-3 mb-4 overflow-x-auto pb-2 scrollbar-hide">
       <div className="relative">
         <select 
            value={filter.time} 
            onChange={e => setFilter({...filter, time: e.target.value as TimeFilter})}
            className="appearance-none pl-8 pr-8 py-2 rounded-full bg-white border border-slate-200 text-xs font-bold text-slate-700 focus:outline-none shadow-sm"
         >
           <option value="all">{t.filter.all}</option>
           <option value="week">{t.filter.week}</option>
           <option value="month">{t.filter.month}</option>
           <option value="year">{t.filter.year}</option>
         </select>
         <Calendar className="absolute left-2.5 top-2 text-slate-400" size={14} />
       </div>
       
       <div className="relative">
         <select 
            value={filter.location} 
            onChange={e => setFilter({...filter, location: e.target.value})}
            className="appearance-none pl-8 pr-8 py-2 rounded-full bg-white border border-slate-200 text-xs font-bold text-slate-700 focus:outline-none shadow-sm"
         >
           <option value="">{t.filter.allLoc}</option>
           {locations.map(l => <option key={l} value={l}>{l}</option>)}
         </select>
         <MapPin className="absolute left-2.5 top-2 text-slate-400" size={14} />
       </div>
    </div>
  );
};

export const AICoachOverlay = ({ isOpen, onClose, lang, theme, apiKey }: { isOpen: boolean, onClose: () => void, lang: Language, theme: ThemeColor, apiKey?: string }) => {
  const t = translations[lang];
  const [messages, setMessages] = useState<{role: 'user' | 'model', text: string}[]>([
    { role: 'model', text: lang === 'zh' ? '你好！我是 HAO，你的私人扑克助手。无论是手牌复盘、概率计算还是心态建设，我都可以帮你。今天想聊点什么？' : 'Hi! I am HAO, your poker assistant. Ask me anything about hands, odds, or mindset.' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages, isOpen]);
  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;
    const userText = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userText }]);
    setIsLoading(true);
    const history = messages.map(m => ({ role: m.role, parts: [{ text: m.text }] }));
    const response = await chatWithPokerCoach(history, userText, lang, apiKey);
    setMessages(prev => [...prev, { role: 'model', text: response }]);
    setIsLoading(false);
  };
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 bg-black/30 backdrop-blur-sm flex justify-end animate-fade-in">
      <div className="w-full max-w-md bg-slate-50 h-full shadow-2xl flex flex-col relative">
        <div className="p-4 bg-white shadow-sm flex justify-between items-center z-10">
           <h2 className="font-bold text-lg text-slate-800 flex items-center gap-2"><Bot className={`text-${theme}-600`}/> {t.ai.title}</h2>
           <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full"><X size={20} className="text-slate-600"/></button>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
          {messages.map((m, i) => (
            <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[85%] p-3 rounded-2xl text-sm leading-relaxed shadow-sm ${m.role === 'user' ? `bg-${theme}-600 text-white rounded-br-none` : 'bg-white text-slate-800 rounded-bl-none border border-slate-200'}`}>
                {m.text}
              </div>
            </div>
          ))}
          {isLoading && (
             <div className="flex justify-start"><div className="bg-white p-3 rounded-2xl rounded-bl-none border border-slate-200 flex gap-2 items-center shadow-sm"><div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></div><div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div><div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{animationDelay: '0.4s'}}></div></div></div>
          )}
          <div ref={bottomRef}></div>
        </div>
        <div className="p-4 bg-white border-t border-slate-200">
          <div className="flex gap-2 items-center">
            <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && sendMessage()} placeholder={t.ai.placeholder} className={`flex-1 bg-slate-100 border-none focus:ring-2 focus:ring-${theme}-500 text-slate-800 rounded-full px-4 py-2 focus:outline-none`} />
            <button onClick={sendMessage} disabled={isLoading || !input.trim()} className={`p-2 bg-${theme}-600 rounded-full text-white disabled:opacity-50 hover:bg-${theme}-700 transition-colors shadow-md`}><Send size={18} /></button>
          </div>
        </div>
      </div>
    </div>
  );
};
