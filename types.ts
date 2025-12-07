
export enum Currency {
  CNY = 'CNY',
  USD = 'USD',
  HKD = 'HKD',
  EUR = 'EUR'
}

export enum Suit {
  SPADES = '♠',
  HEARTS = '♥',
  CLUBS = '♣',
  DIAMONDS = '♦'
}

export enum Rank {
  TWO = '2', THREE = '3', FOUR = '4', FIVE = '5',
  SIX = '6', SEVEN = '7', EIGHT = '8', NINE = '9',
  TEN = 'T', JACK = 'J', QUEEN = 'Q', KING = 'K', ACE = 'A'
}

export interface CardData {
  suit: Suit;
  rank: Rank;
  id: string;
}

export interface ExchangeRates {
  [key: string]: number; // Value in USD. e.g., USD: 1, CNY: 7.1
}

export interface PokerSession {
  id: string;
  location: string;
  startTime: number;
  endTime?: number;
  buyIn: number;
  cashOut?: number;
  blinds: string;
  currency: Currency;
  notes?: string;
  durationSeconds: number;
  isLive: boolean;
  pauses: { start: number; end?: number }[];
}

export interface Villain {
  id: string;
  name: string;
  cards: CardData[];
}

export interface PokerHand {
  id: string;
  sessionId?: string;
  sessionLocation?: string; // Snapshot of location for quick display
  timestamp: number;
  holeCards: CardData[];
  communityCards: CardData[];
  villains: Villain[]; // Opponents' cards
  heroPosition?: string; // New: Hero's position
  profit: number;
  streetActions: string; // Compact string e.g. "Pre: R 50, C; Flop: X, B 100"
  note?: string;
  analysis?: string;
}

// New 5-tab structure: Report, Results, Record (Center), Hands, More
export type ViewState = 'REPORT' | 'RESULTS' | 'RECORD' | 'HANDS' | 'MORE';

export type Language = 'zh' | 'en';

export type TimeFilter = 'all' | 'week' | 'month' | 'year';

export interface FilterState {
  time: TimeFilter;
  location: string;
}

export type ThemeColor = 'indigo' | 'blue' | 'emerald' | 'rose' | 'amber';