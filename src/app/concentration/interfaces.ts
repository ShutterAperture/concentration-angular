import { TrilonState } from './types';

// A prize, as shown on the scoreboard. Duplicate indicates player has won two.
export interface Prize {
  prize: string;
  duplicate: boolean;
}

// Describes a player and their prizes, used by scoreboard
export interface PlayerPrizes {
  player: string;
  prizes: Prize[]
}

export interface StyleObject {
  [property: string]: any;
}

// Randomizing object for prizes; each prize is assigned a random order, and then the set is sorted.
export interface PuzzlePrize {
  prizeName: string;
  rand: number;
}

// Data object for each trilon (rotating puzzle piece. Row and column are important for positioning
export interface TrilonData  {
  visibleNumber: number;
  trilonState: TrilonState;
  prizeName: string;
  row: number
  col: number
}

// Representation of a puzzle; url and urlRetina point to puzzle images.
export interface Puzzle {
  url: string;
  urlRetina?: string;
  solution: string;
  explanation: string;
}

/* Compare string is the solution stripped of punctuation and white space,
   and converted to lower case, to check submitted solutions.  */
export interface RandomizedPuzzle extends Puzzle {
  rand: number;
  compareString: string;
}

/* Data coming out of the entry form, comprised of the single mode flag, and the
  names of the players, if two handed.  */
export interface PlayerData {
  singleMode: boolean;
  players: string[];
}

export interface GameOptions {
  enableSound: boolean;
  volume: number;
  narzAppearance: boolean;
  blumenthalPuzzles: boolean
}
