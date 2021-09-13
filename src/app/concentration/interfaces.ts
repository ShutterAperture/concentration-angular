import { TrilonState } from './types';

export interface Prize {
  prize: string;
  duplicate: boolean;
}

export interface PuzzlePrize {
  prizeName: string;
  rand: number;
}

export interface TrilonData  {
  visibleNumber: number;
  trilonState: TrilonState;
  prizeName: string;
  url: string;
  urlRetina?: string;
  row: number
  col: number
}

export interface Puzzle {
  url: string;
  urlRetina?: string;
  solution: string;
  explanation: string;
}

export interface PlayerData {
  singleMode: boolean;
  players: string[];
}
