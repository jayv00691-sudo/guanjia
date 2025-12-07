
import React, { useState } from 'react';
import { Suit, Rank, CardData } from '../types';

interface CardKeyboardProps {
  onSelect: (card: CardData) => void;
}

const SUITS = [Suit.SPADES, Suit.HEARTS, Suit.CLUBS, Suit.DIAMONDS];
// Split ranks into two rows for the grid
const RANKS_ROW_1 = [Rank.ACE, Rank.KING, Rank.QUEEN, Rank.JACK, Rank.TEN, Rank.NINE, Rank.EIGHT];
const RANKS_ROW_2 = [Rank.SEVEN, Rank.SIX, Rank.FIVE, Rank.FOUR, Rank.THREE, Rank.TWO];

export const CardDisplay: React.FC<{ card: CardData; onClick?: () => void; size?: 'xs' | 'sm' | 'md'; highlight?: boolean }> = ({ card, onClick, size = 'md', highlight = false }) => {
  const isRed = card.suit === Suit.HEARTS || card.suit === Suit.DIAMONDS;
  const baseClasses = "bg-white border rounded flex flex-col justify-center items-center font-bold select-none shadow-sm leading-none transition-all";
  
  const sizeClasses = {
    xs: "w-6 h-8 text-[10px] rounded-sm",
    sm: "w-8 h-11 text-xs rounded",
    md: "w-10 h-14 text-sm rounded-md",
  };

  return (
    <div 
      onClick={onClick}
      className={`
        ${baseClasses} ${sizeClasses[size]} 
        ${isRed ? 'text-red-500 border-slate-200' : 'text-slate-800 border-slate-200'} 
        ${onClick ? 'cursor-pointer' : ''}
        ${highlight ? 'ring-2 ring-indigo-500 -translate-y-1 shadow-indigo-200' : ''}
      `}
    >
      <span>{card.rank}</span>
      <span className="-mt-0.5">{card.suit}</span>
    </div>
  );
};

export const CompactCardKeyboard: React.FC<CardKeyboardProps> = ({ onSelect }) => {
  const [selectedRank, setSelectedRank] = useState<Rank | null>(null);

  const handleRankClick = (rank: Rank) => {
    setSelectedRank(rank);
  };

  const handleSuitClick = (suit: Suit) => {
    if (selectedRank) {
      onSelect({ suit, rank: selectedRank, id: `${selectedRank}${suit}-${Date.now()}` });
      setSelectedRank(null); // Reset after selection for next card
    }
  };

  const renderRankBtn = (rank: Rank) => (
    <button
      key={rank}
      onClick={() => handleRankClick(rank)}
      className={`
        flex-1 h-9 rounded-md font-bold text-sm transition-all border
        ${selectedRank === rank 
          ? 'bg-indigo-600 text-white border-indigo-700 shadow-md' 
          : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'}
      `}
    >
      {rank}
    </button>
  );

  return (
    <div className="bg-slate-100 rounded-xl p-2 border border-slate-200 shadow-inner select-none">
      {/* Ranks - Grid Layout 2 Rows */}
      <div className="flex flex-col gap-1.5 mb-2">
        <div className="flex gap-1">
          {RANKS_ROW_1.map(renderRankBtn)}
        </div>
        <div className="flex gap-1">
          {RANKS_ROW_2.map(renderRankBtn)}
        </div>
      </div>

      {/* Row 2: Suits - Only active when rank selected */}
      <div className="grid grid-cols-4 gap-2">
        {SUITS.map(suit => {
          const isRed = suit === Suit.HEARTS || suit === Suit.DIAMONDS;
          return (
            <button
              key={suit}
              onClick={() => handleSuitClick(suit)}
              disabled={!selectedRank}
              className={`
                h-9 rounded-lg text-lg flex items-center justify-center transition-all border
                ${!selectedRank 
                  ? 'bg-slate-200 text-slate-400 border-transparent cursor-not-allowed' 
                  : isRed 
                    ? 'bg-white text-red-500 border-red-200 hover:bg-red-50 shadow-sm' 
                    : 'bg-white text-slate-800 border-slate-300 hover:bg-slate-50 shadow-sm'}
              `}
            >
              {suit}
            </button>
          );
        })}
      </div>
    </div>
  );
};