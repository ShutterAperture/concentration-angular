import { GameOptions, Puzzle } from './interfaces';

export const NUM_ROWS = 6;
export const NUM_COLS = 5; // could be altered to change number of tiles, dimensions would need adjusting

export const COOL_PRIZES = [ 'Jewelry', 'Washer / Dryer', 'Hair Dryer', 'Wallet', 'Year of HBO', 'Shopping Spree', 'Disney World Trip', '16\' MacBook Pro', 'Trip to Bonaire', 'Recliner', 'Dinette Set', 'Motorcycle', 'Sofa', 'GoPro', 'Home Theater', 'Digital SLR', 'Kayak', 'Surf Board', 'Media Center', 'Motor Home', 'iPhone', 'Snowmobile', 'Jet Ski', 'Sailboat', 'Scuba Equipment', 'iPad', 'Kindle', 'Bicycle', 'Television', 'Green House', 'iTunes Gift Card', 'Snowblower', 'Stand Up Paddleboard', 'Flowers', 'Hat', 'Linens', 'Artist Supplies', 'Skis', 'Clock' ];
export const GAG_PRIZES = [ 'Watermelon', 'Razor', 'Kleenex', 'Lemon', 'Socks', 'Paint Brush', 'Compost', 'Penny for Thoughts', 'Sea Shell', 'Trunk of Junk', 'Tub of Lard', 'Valise of Grease' ];
export const UTIL_PRIZES = [ 'Take', 'Forfeit', 'Forfeit', 'Forfeit', 'Wild' ];
export const VIEWED_PUZZLES_KEY = 'viewed-puzzles'

export const AVAILABLE_PUZZLES: Puzzle[] = [
  {
    url: 'pzzl-001.gif',
    urlRetina: 'pzzl-001-2x.gif',
    explanation: 'Eye + Th + Ink, + Th + Ear + 4 + I + Ham',
    solution: 'I think, therefore I am',
    author: 'Ted O\'Hara'
  },
  {
    url: 'pzzl-002.gif',
    urlRetina: 'pzzl-002-2x.gif',
    explanation: '2 + Bee + Oar + Knot + 2 + Bee',
    solution: 'To be, or not to be',
    author: 'Ted O\'Hara'
  },
  {
    url: 'pzzl-003.gif',
    urlRetina: 'pzzl-003-2x.gif',
    explanation: 'Hat + Bee + N + Hoo + Y + Ear',
    solution: 'Happy New Year',
    author: 'Ted O\'Hara'
  },
  {
    url: 'pzzl-004.gif',
    urlRetina: 'pzzl-004-2x.gif',
    explanation: 'SP + Ace, The F + Eye + N + Awl + Fr + ON + T + Ear',
    solution: 'Space, the final frontier',
    author: 'Ted O\'Hara'
  },
  {
    url: 'pzzl-005.gif',
    urlRetina: 'pzzl-005-2x.gif',
    explanation: 'The + Fan + Ton + M + Off + The + Up + Rah',
    solution: 'The Phantom of the Opera',
    author: 'Ted O\'Hara'
  },
  {
    url: 'pzzl-006.gif',
    urlRetina: 'pzzl-006-2x.gif',
    explanation: 'Wood + U + Bee + M + Eye + VAL + Hen + Tie + N',
    solution: 'Would you be my Valentine?',
    author: 'Ted O\'Hara'
  },
  {
    url: 'pzzl-007.gif',
    urlRetina: 'pzzl-007-2x.gif',
    explanation: 'Head + Ham + Pen + ed  1 + N + Eye + T',
    solution: 'It happened one night',
    author: 'Ted O\'Hara'
  },
  {
    url: 'pzzl-008.gif',
    urlRetina: 'pzzl-008-2x.gif',
    explanation: 'Saw + M Hen + CH + Hand + Ed EVE + hen + ING',
    solution: 'Some enchanted evening',
    author: 'Ted O\'Hara'
  },
  {
    url: 'pzzl-009.gif',
    urlRetina: 'pzzl-009-2x.gif',
    explanation: 'Caw + L Off The W + Eye + ld',
    solution: 'Call of the Wild',
    author: 'Ted O\'Hara'
  }
];

export const DEFAULT_GAME_OPTIONS: GameOptions = {
  enableSound: true,
  volume: .24,
  narzAppearance: false,
  blumenthalPuzzles: false
}

export const TRILON_SOUND_SOURCE = '/assets/sounds/trilon.mp3';
export const REBUS_PATH = '/assets/puzzles/'
export const COMPARISON_INTERVAL = 1200;
export const MESSAGE_DELAY = 3000;
export const PLAY_AGAIN_DELAY = 1600;


