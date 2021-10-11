import { fakeAsync, TestBed, tick } from '@angular/core/testing';
import { MOCK_RANDOMIZED_PUZZLE_ARRAY } from '../../../mocks/randomized-puzzle-array-mock';
import { AVAILABLE_PUZZLES, COOL_PRIZES, GAG_PRIZES, UTIL_PRIZES } from '../constants';
import { PuzzlePrize, RandomizedPuzzle, TrilonData } from '../interfaces';

import { PuzzleService } from './puzzle.service';

describe('PuzzleService', () => {
  let service: PuzzleService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ PuzzleService ]
    });
    service = TestBed.inject(PuzzleService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('initializePuzzles', () => {
    it('should add a random number and compare string to the available puzzles, and then sort them', () => {

      service.initializePuzzles();
      let randCheck = -1;
      const comparer = (mappedPuzzle: RandomizedPuzzle) => {
        const sourcePuzzle = AVAILABLE_PUZZLES.find(p => p.url === mappedPuzzle.url);
        let comparison = mappedPuzzle.urlRetina === sourcePuzzle?.urlRetina && mappedPuzzle.solution === sourcePuzzle?.solution && mappedPuzzle.explanation === sourcePuzzle?.explanation && mappedPuzzle.compareString === sourcePuzzle?.solution.replace(
          /\W/gi, '').toLowerCase() && !isNaN(mappedPuzzle.rand) && mappedPuzzle.rand > 0 && mappedPuzzle.rand < 1;

        // need to verify sorting
        comparison = comparison && mappedPuzzle.rand > randCheck;
        randCheck = mappedPuzzle.rand;
        return comparison;
      };
      expect(service.puzzleArray.every(comparer)).toBe(true);
    });
  });

  describe('getPuzzle', () => {
    it('should return an observable of the puzzle at the proper index', fakeAsync(() => {
      service.puzzleIndex = 1;
      service.puzzleArray = [ ...MOCK_RANDOMIZED_PUZZLE_ARRAY ];
      let completed = false;
      service.getPuzzle().subscribe({
        next: (payload: RandomizedPuzzle) => expect(payload).toEqual(MOCK_RANDOMIZED_PUZZLE_ARRAY[1]),
        error: (error: Error) => fail(`getPuzzle should not fail: ${error.message}`),
        complete: () => completed = true
      });
      tick();
      expect(completed).toBe(true);

    }));
  });

  describe('advanceToNextPuzzle', () => {
    beforeEach(() => service.puzzleArray = [ ...MOCK_RANDOMIZED_PUZZLE_ARRAY ]);

    it('should increment the puzzle index', () => {
      service.puzzleIndex = 1;
      service.advanceToNextPuzzle();
      expect(service.puzzleIndex).toBe(2);
    });
    it('should start over when the last index is reached', () => {
      service.puzzleIndex = MOCK_RANDOMIZED_PUZZLE_ARRAY.length - 1;
      service.advanceToNextPuzzle();
      expect(service.puzzleIndex).toBe(0);
    });
  });

  describe('getTrilonData', () => {
    beforeEach(() => {
      spyOn(service, 'createPrizeSet').and.callThrough();
      spyOn(service, 'createMatchForEachPrize').and.callThrough();
      spyOn(service, 'mapToTrilonData').and.callThrough();
    });
    it('should set up the prize set, make matches for each, and map the data', () => {
      const singleMode = true;
      const initialState = 'number';
      service.getTrilonData(singleMode, initialState).subscribe({
        next: () => {
          expect(service.createPrizeSet).toHaveBeenCalledWith(singleMode);
          expect(service.createMatchForEachPrize).toHaveBeenCalled();
          expect(service.mapToTrilonData).toHaveBeenCalled();
        },
        error: (error: Error) => fail(`getTrilonData should not fail: ${error.message}`)
      });
    });
  });

  describe('generatePuzzlePrizes', () => {
    it('should map a string array into array with prizenames and random numbers, and sort them', () => {
      let randCheck = -1;

      let result: PuzzlePrize[] = service.generatePuzzlePrizes(COOL_PRIZES);

      const comparer = (puzzlePrize: PuzzlePrize) => {
        const sourcePrizeName = COOL_PRIZES.find(p => p === puzzlePrize.prizeName);

        // need to verify sorting
        const comparison = !!sourcePrizeName && puzzlePrize.rand > randCheck;
        randCheck = puzzlePrize.rand;
        return comparison;
      };
      expect(result.every(comparer)).toBe(true);
    });
  });

  describe('createPrizeSet', () => {
    type TestCase = [ string[], number ]
    const filterByPrizeType = (result: PuzzlePrize[], sourceArray: string[]) => {
      return result
        .filter((trilonData: PuzzlePrize) => sourceArray.includes(trilonData.prizeName)).length;
    };

    const runContentCategoryTests = (result: PuzzlePrize[], testCases: TestCase[]) => {
      testCases.forEach(([ sourceArray, expectedCount ]: TestCase) => {
        const actualCount = filterByPrizeType(result, sourceArray);
        expect(actualCount).toBe(expectedCount);
      });
    };
    beforeEach(() => {
      spyOn(service, 'generatePuzzlePrizes').and.callThrough();
    });
    it('should add a random number and a comparison string to the available prizes (2 handed)', () => {

      const singleMode = false;
      const result: PuzzlePrize[] = service.createPrizeSet(singleMode);
      expect(service.generatePuzzlePrizes).toHaveBeenCalledWith(COOL_PRIZES);
      expect(service.generatePuzzlePrizes).toHaveBeenCalledWith(GAG_PRIZES);
      expect(service.generatePuzzlePrizes).toHaveBeenCalledWith(UTIL_PRIZES);

      const testCases: TestCase[] = [
        [ COOL_PRIZES, 7 ], [ GAG_PRIZES, 3 ], [ UTIL_PRIZES, UTIL_PRIZES.length ]
      ];
      runContentCategoryTests(result, testCases);

    });

    it('should add a random number and a comparison string to the available prizes (single handed)', () => {
      const singleMode = true;
      const result = service.createPrizeSet(singleMode);
      expect(service.generatePuzzlePrizes).toHaveBeenCalledWith(COOL_PRIZES);
      expect(service.generatePuzzlePrizes).toHaveBeenCalledWith(GAG_PRIZES);
      expect(service.generatePuzzlePrizes).toHaveBeenCalledWith([ 'Wild' ]);

      type TestCase = [ string[], number ]
      const testCases: TestCase[] = [
        [ COOL_PRIZES, 12 ], [ GAG_PRIZES, 2 ], [ UTIL_PRIZES, 1 ]
      ];

      runContentCategoryTests(result, testCases);
    });
  });

  describe('createMatchForEachPrize', () => {
    it('should create a matching item for each prize, re-randomize, and sort', () => {

      const input: PuzzlePrize[] = [
        {
          prizeName: 'Prize 1',
          rand: 0.01
        }, {
          prizeName: 'Prize 2',
          rand: 0.02
        }, {
          prizeName: 'Prize 3',
          rand: 0.03
        }, {
          prizeName: 'Prize 4',
          rand: 0.04
        }, {
          prizeName: 'Prize 5',
          rand: 0.05
        }
      ];


      const actualOutput = service.createMatchForEachPrize(input);

      let randCheck = -1;
      const comparer = (prize: PuzzlePrize) => {
        const sourcePrize = input.find(p => p.prizeName === prize.prizeName);
        let comparison = sourcePrize && !isNaN(prize.rand) && prize.rand > 0 && prize.rand < 1;

        // need to verify sorting
        comparison = comparison && prize.rand > randCheck;
        randCheck = prize.rand;
        return comparison;
      };
      expect(actualOutput.every(comparer)).toBe(true);
    });
  });

  describe('mapToTrilonData', () => {
    it('should convert matched prizes to TrilonData', () => {

      const input = [
        {
          prizeName: 'Prize 1',
          rand: 0.01
        }, {
          prizeName: 'Prize 2',
          rand: 0.02
        }, {
          prizeName: 'Prize 3',
          rand: 0.03
        }, {
          prizeName: 'Prize 4',
          rand: 0.04
        }, {
          prizeName: 'Prize 5',
          rand: 0.05
        }, {
          prizeName: 'Prize 1',
          rand: 0.06
        }, {
          prizeName: 'Prize 2',
          rand: 0.07
        }, {
          prizeName: 'Prize 3',
          rand: 0.08
        }, {
          prizeName: 'Prize 4',
          rand: 0.09
        }, {
          prizeName: 'Prize 5',
          rand: 0.1
        }
      ];

      const expected: TrilonData[] = [
        {
          trilonState: 'number',
          visibleNumber: 1,
          prizeName: 'Prize 1',
          row: 0,
          col: 0
        }, {
          trilonState: 'number',
          visibleNumber: 2,
          prizeName: 'Prize 2',
          row: 0,
          col: 1
        }, {
          trilonState: 'number',
          visibleNumber: 3,
          prizeName: 'Prize 3',
          row: 0,
          col: 2
        }, {
          trilonState: 'number',
          visibleNumber: 4,
          prizeName: 'Prize 4',
          row: 0,
          col: 3
        }, {
          trilonState: 'number',
          visibleNumber: 5,
          prizeName: 'Prize 5',
          row: 0,
          col: 4
        }, {
          trilonState: 'number',
          visibleNumber: 6,
          prizeName: 'Prize 1',
          row: 1,
          col: 0
        }, {
          trilonState: 'number',
          visibleNumber: 7,
          prizeName: 'Prize 2',
          row: 1,
          col: 1
        }, {
          trilonState: 'number',
          visibleNumber: 8,
          prizeName: 'Prize 3',
          row: 1,
          col: 2
        }, {
          trilonState: 'number',
          visibleNumber: 9,
          prizeName: 'Prize 4',
          row: 1,
          col: 3
        }, {
          trilonState: 'number',
          visibleNumber: 10,
          prizeName: 'Prize 5',
          row: 1,
          col: 4
        }
      ];

      const initialState = 'number';
      const result = service.mapToTrilonData(input, initialState);
      expect(result).toEqual(expected);
    });
  });
});
