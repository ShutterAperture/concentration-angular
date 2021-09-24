import { RandomizedPuzzle } from '../app/concentration/interfaces';

export const MOCK_RANDOMIZED_PUZZLE_ARRAY: RandomizedPuzzle[] = JSON.parse(`
[
  {
    "url": "pzzl-001.gif",
    "urlRetina": "pzzl-001-2x.gif",
    "explanation": "Eye + Th + Ink, + Th + Ear + 4 + I + Ham",
    "solution": "I think, therefore I am",
    "rand": 0.3370113090322191,
    "compareString": "ithinkthereforeiam"
  },
  {
    "url": "pzzl-004.gif",
    "urlRetina": "pzzl-004-2x.gif",
    "explanation": "SP + Ace, The F + Eye + N + Awl + Fr + ON + T + Ear",
    "solution": "Space, the final frontier",
    "rand": 0.4832321434632225,
    "compareString": "spacethefinalfrontier"
  },
  {
    "url": "pzzl-003.gif",
    "urlRetina": "pzzl-003-2x.gif",
    "explanation": "Hat + Bee + N + Hoo + Y + Ear",
    "solution": "Happy New Year",
    "rand": 0.6037196124476945,
    "compareString": "happynewyear"
  },
  {
    "url": "pzzl-006.gif",
    "urlRetina": "pzzl-006-2x.gif",
    "explanation": "Wood + U + Bee + M + Eye + VAL + Hen + Tie + N",
    "solution": "Would you be my Valentine?",
    "rand": 0.6229859683282686,
    "compareString": "wouldyoubemyvalentine"
  },
  {
    "url": "pzzl-002.gif",
    "urlRetina": "pzzl-002-2x.gif",
    "explanation": "2 + Bee + Or + Knot + 2 + Bee",
    "solution": "To be, or not to be",
    "rand": 0.9042671906273974,
    "compareString": "tobeornottobe"
  },
  {
    "url": "pzzl-005.gif",
    "urlRetina": "pzzl-005-2x.gif",
    "explanation": "The + Fan + Ton + M + Off + The + Up + Rah",
    "solution": "The Phantom of the Opera",
    "rand": 0.9653664930273673,
    "compareString": "thephantomoftheopera"
  }
]`)
