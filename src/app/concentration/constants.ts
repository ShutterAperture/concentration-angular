import { Puzzle } from './interfaces';

export const NUM_ROWS = 6;
export const NUM_COLS = 5; // could be altered to change number of tiles, dimensions would need adjusting

export const COOL_PRIZES = ['Jewelry','Washer/Dryer','Hair Dryer','Wallet','Year of HBO','Shopping Spree','Disney World Trip','15\" MacBook Pro','Trip to Bonaire','Recliner','Dinette Set','Sport Touring Motorcycle','Sofa','CamCorder','Home Theater','Digital SLR','Kayak','Surf Board','Media Center','Motor Home','iPod Touch','Snowmobile','Jet Ski','Sailboat','Scuba Equipment','iPad','Kindle', 'Cannondale Bicycle','Television','Green House','iTunes Gift Card','Snowblower','Stand Up Paddleboard','Flowers','Hat','Linens','Artist Supplies']
export const GAG_PRIZES = ['Watermelon','Razor','Kleenex','Lemon','Socks','Paint Brush','Compost','Penny for Thoughts','Sea Shell','Trunk of Junk','Tub of Lard']
export const UTIL_PRIZES = ['Take','Forfeit','Forfeit','Forfeit','Wild']

export const AVAILABLE_PUZZLES: Puzzle[] = [
  {url:"pzzl006.gif",  	explanation:"Eye + Th + Ink, + Th + Ear + 4 + I + Ham",	solution:"I think, therefore I am"},
  {url:"pzzl005.gif", 	explanation:"2 + Bee + Or + Knot + 2 + Bee",	solution:"To be, or not to be"},
  {url:"pzzl003.gif", 	explanation:"Hat + Bee + N + Hoo + Y + Ear",	solution:"Happy New Year"},
  {url:"pzzl004.gif", 	explanation:"SP + Ace, The F + Eye + N + Awl + Fr + ON + T + Ear",	solution:"Space, the final frontier"},
  {url:"pzzl007.gif", 	explanation:"The + Fan + Ton + M + Off + The + Up + Rah",	solution:"The Phantom of the Opera"},
];


