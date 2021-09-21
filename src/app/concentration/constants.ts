import { Puzzle } from './interfaces';

export const NUM_ROWS = 6;
export const NUM_COLS = 5; // could be altered to change number of tiles, dimensions would need adjusting

export const COOL_PRIZES = [ 'Jewelry', 'Washer / Dryer', 'Hair Dryer', 'Wallet', 'Year of HBO', 'Shopping Spree', 'Disney World Trip', '16\' MacBook Pro', 'Trip to Bonaire', 'Recliner', 'Dinette Set', 'Motorcycle', 'Sofa', 'GoPro', 'Home Theater', 'Digital SLR', 'Kayak', 'Surf Board', 'Media Center', 'Motor Home', 'iPhone', 'Snowmobile', 'Jet Ski', 'Sailboat', 'Scuba Equipment', 'iPad', 'Kindle', '10 Speed Bicycle', 'Television', 'Green House', 'iTunes Gift Card', 'Snowblower', 'Stand Up Paddleboard', 'Flowers', 'Hat', 'Linens', 'Artist Supplies' ];
export const GAG_PRIZES = [ 'Watermelon', 'Razor', 'Kleenex', 'Lemon', 'Socks', 'Paint Brush', 'Compost', 'Penny for Thoughts', 'Sea Shell', 'Trunk of Junk', 'Tub of Lard' ];
export const UTIL_PRIZES = [ 'Take', 'Forfeit', 'Forfeit', 'Forfeit', 'Wild' ];

export const AVAILABLE_PUZZLES: Puzzle[] = [
  {
    url: 'pzzl-001.gif',
    urlRetina: 'pzzl-001-2x.gif',
    explanation: 'Eye + Th + Ink, + Th + Ear + 4 + I + Ham',
    solution: 'I think, therefore I am'
  },
  {
    url: 'pzzl-002.gif',
    urlRetina: 'pzzl-002-2x.gif',
    explanation: '2 + Bee + Or + Knot + 2 + Bee',
    solution: 'To be, or not to be'
  },
  {
    url: 'pzzl-003.gif',
    urlRetina: 'pzzl-003-2x.gif',
    explanation: 'Hat + Bee + N + Hoo + Y + Ear',
    solution: 'Happy New Year'
  },
  {
    url: 'pzzl-004.gif',
    urlRetina: 'pzzl-004-2x.gif',
    explanation: 'SP + Ace, The F + Eye + N + Awl + Fr + ON + T + Ear',
    solution: 'Space, the final frontier'
  },
  {
    url: 'pzzl-005.gif',
    urlRetina: 'pzzl-005-2x.gif',
    explanation: 'The + Fan + Ton + M + Off + The + Up + Rah',
    solution: 'The Phantom of the Opera'
  },
  {
    url: 'pzzl-006.gif',
    urlRetina: 'pzzl-006-2x.gif',
    explanation: 'Wood + U + Bee + M + Eye + VAL + Hen + Tie + N',
    solution: 'Would you be my Valentine?'
  }
];

export const REBUS_PATH = '/assets/puzzles/'
export const COMPARISON_INTERVAL = 1500;
export const MESSAGE_DELAY = 3000;


