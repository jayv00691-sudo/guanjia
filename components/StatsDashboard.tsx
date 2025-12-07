
import React, { useMemo } from 'react';
import { PokerSession, ExchangeRates, Currency, PokerHand, Language, ThemeColor } from '../types';
import { TrendingUp, TrendingDown, DollarSign, Activity } from 'lucide-react';
import { translations } from '../translations';

interface StatsProps {
  sessions: PokerSession[];
  hands: PokerHand[];
  currency: Currency;
  rates: ExchangeRates;
  lang: Language;
  themeColor: ThemeColor;
  title?: string;
}

export const StatsDashboard: React.FC<StatsProps> = ({ sessions, currency, rates, lang, themeColor, title }) => {
  const t = translations[lang];
  
  const stats = useMemo(() => {
    let totalPnlUSD = 0;
    let wins = 0;
    let losses = 0;
    let totalHours = 0;
    
    sessions.forEach(session => {
      // Filter out unfinished sessions (optional, depending on preference. Currently including cached out ones)
      if (session.cashOut === undefined && !session.isLive) return; 
      
      const pnl = (session.cashOut || 0) - session.buyIn;
      const rate = rates[session.currency] || 1;
      const pnlUSD = pnl / rate;
      
      totalPnlUSD += pnlUSD;
      if (pnl > 0) wins++; else if (pnl < 0) losses++;
      totalHours += (session.durationSeconds / 3600);
    });

    const displayRate = rates[currency] || 1;
    
    return {
      totalPnl: totalPnlUSD * displayRate,
      wins,
      losses,
      totalSessions: sessions.length,
      winRate: wins + losses > 0 ? ((wins / (wins + losses)) * 100).toFixed(1) : 0,
      hourlyRate: totalHours > 0 ? ((totalPnlUSD * displayRate) / totalHours).toFixed(1) : 0,
    };
  }, [sessions, currency, rates]);

  const StatCard = ({ title, value, icon: Icon, color }: any) => (
    <div className="glass-panel p-4 rounded-2xl flex items-center gap-4">
      <div className={`p-3 rounded-full ${color} bg-opacity-20 text-white`}>
        <Icon size={24} className={color.replace('bg-', 'text-')} />
      </div>
      <div>
        <p className="text-sm text-gray-500 font-medium">{title}</p>
        <h3 className="text-2xl font-bold text-gray-800">{value}</h3>
      </div>
    </div>
  );

  return (
    <div className="space-y-6 animate-fade-in pb-4">
      {title && <h2 className="text-xl font-light text-slate-700 mb-4">{title}</h2>}
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <StatCard 
          title={`${t.dashboard.totalPnl} (${currency})`} 
          value={`${stats.totalPnl > 0 ? '+' : ''}${stats.totalPnl.toFixed(0)}`} 
          icon={DollarSign} 
          color={stats.totalPnl >= 0 ? "bg-green-500" : "bg-red-500"} 
        />
        <StatCard 
          title={t.dashboard.hourly}
          value={`${stats.hourlyRate} /h`} 
          icon={Activity} 
          color="bg-blue-500" 
        />
        <StatCard 
          title={t.dashboard.winRate}
          value={`${stats.winRate}%`} 
          icon={TrendingUp} 
          color={`bg-${themeColor}-500`} 
        />
        <StatCard 
          title={t.dashboard.sessions}
          value={stats.totalSessions} 
          icon={TrendingDown} 
          color="bg-purple-500" 
        />
      </div>
    </div>
  );
};
